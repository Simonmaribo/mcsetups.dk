import type Server from "@/interfaces/Server";
import { generateAccessToken } from "@/libs/paypal";
import axios from "axios";
import type { Request, Response } from "express";
const logger = require('../../libs/logger');

const router = require("express").Router({ mergeParams: true });

const PAYPAL_BASEURL = (process.env.NODE_ENV == "development" ? "https://api-m.sandbox.paypal.com" : "https://api-m.paypal.com")
const RETURN_URL = (process.env.NODE_ENV == "development" ? "http://127.0.0.1:3000" : `https://${process.env.FRONTEND_DOMAIN}`)

module.exports = (server: Server) => {
    return {
        rateLimit: {
            max: 16,
            timePeriod: 60,
        },
        router: () => {

            router.post("/create", server.authManager.ensureAuthentication, async (req: Request, res: Response) => {
                try {
                    if(!req.user) return res.status(401).json({ error: "Unauthorized" });
                    let { amount } = req.body;
                    if(!amount) return res.status(400).json({ error: "Missing amount" });
                    amount = parseInt(amount);
                    if(isNaN(amount) || !amount) return res.status(400).json({ error: "Invalid amount" }); 
                    if(amount < 1000) return res.status(400).json({ error: "Amount must be greater than 10.00" });
                    if(amount > 100000) return res.status(400).json({ error: "Amount must be less than 1000.00" });

                    const accessToken = await generateAccessToken();
                    const response = await axios.post(`${PAYPAL_BASEURL}/v2/checkout/orders`, {
                        intent: "CAPTURE",
                        purchase_units: [
                            {
                                amount: {
                                    currency_code: "DKK",
                                    value: `${amount / 100}`
                                },
                            }
                        ],
                        application_context: {
                            return_url: `${RETURN_URL}/payment?status=complete`,
                            cancel_url: `${RETURN_URL}/payment?status=cancel`,
                        }
                    }, {
                        headers: {
                            "Content-Type": "application/json",
                            Authorization: `Bearer ${accessToken}`
                        }
                    });
                    const { id } = response.data;
                    if(!id) return res.status(500).json({ error: "Something went wrong" });
                    await server.database.paypalOrder.create({
                        data: {
                            orderId: `${id}`,
                            userId: req.user.id,
                            amount: amount,
                            platformProfit: Math.round(amount * 0.15),
                        }
                    });

                    let links = response.data.links;
                    if(!links) return res.status(500).json({ error: "Something went wrong" });
                    let link = links.find((link: any) => link.rel === "approve");
                    if(!link) return res.status(500).json({ error: "Something went wrong" });
                    
                    return res.json({ link: link.href });
                } catch (error) {
                    console.log(error);
                    logger.log("error", error)
                    return res.status(500).json({ error: "Something went wrong" });
                }
            });

            router.post("/callback", async (req: Request, res: Response) => {
                try {
                    if(req.body.event_type != "CHECKOUT.ORDER.APPROVED") return res.status(400).json({ error: "Invalid event type" });
                    const { resource } = req.body;
                    if(!resource) return res.status(400).json({ error: "Missing resource" });
                    const { id } = resource;
                    if(!id) return res.status(400).json({ error: "Missing order id" });

                    const order = await server.database.paypalOrder.findFirst({
                        where: {
                            orderId: id
                        }
                    });

                    if(!order) return res.status(400).json({ error: "Invalid order id" });
                    
                    const accessToken = await generateAccessToken();
                    const response = await axios.post(`${PAYPAL_BASEURL}/v2/checkout/orders/${order.orderId}/capture`, {}, {
                        headers: {
                            "Content-Type": "application/json",
                            Authorization: `Bearer ${accessToken}`
                        }
                    });
                    if(response.status != 201) return res.status(500).json({ error: "Something went wrong" });
                    const { status } = response.data;
                    if(status != "COMPLETED") return res.status(500).json({ error: "Something went wrong" });

                    let fee = response?.data?.purchase_units[0]?.payments.captures[0]?.seller_receivable_breakdown?.paypal_fee?.value || 0;
                    fee = parseFloat(fee);
                    fee = Math.round(fee * 100);


                    await server.database.user.update({
                        where: {
                            id: order.userId
                        },
                        data: {
                            balance: {
                                increment: order.amount
                            }
                        }
                    });

                    const transaction = await server.database.transaction.create({
                        data: {
                            userId: order.userId,
                            amount: order.amount,
                            type: "DEPOSIT",
                            
                        }
                    });

                    await server.database.paypalOrder.update({
                        where: {
                            orderId: order.orderId
                        },
                        data: {
                            status: "COMPLETED",
                            paypalFee: fee,
                            transactionId: transaction.id
                        }
                    });

                    return res.status(200).json({ status: "OK" });
                } catch (error) {
                    console.log(error);
                    logger.log("error", error)
                    return res.status(500).json({ error: "Something went wrong" });
                }
            });

            return router;
        }
    }
}