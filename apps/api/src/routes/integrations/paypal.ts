import Route from "@/interfaces/Route";
import type Server from "@/interfaces/Server";
import axios from "axios";
import { IntegrationType } from "database";
import type { Request, Response } from "express";
const router = require("express").Router({ mergeParams: true });

const CLIENT_ID = process.env.PAYPAL_CLIENT_ID
const CLIENT_SECRET = process.env.PAYPAL_CLIENT_SECRET
const PAYPAL_BASEURL = (process.env.NODE_ENV == "development" ? "https://www.sandbox.paypal.com/connect" : "https://www.paypal.com/connect")
const PAYPAL_BASEURL_API = (process.env.NODE_ENV == "development" ? "https://api-m.sandbox.paypal.com" : "https://api-m.paypal.com")
const RETURN_URL = (process.env.NODE_ENV == "development" ? "http://127.0.0.1:7000" : `https://${process.env.DOMAIN}`)
const FRONTEND_URL = (process.env.NODE_ENV == "development" ? "http://127.0.0.1:3000" : `https://${process.env.FRONTEND_DOMAIN}`)

const getAuthorizationEndpoint = () => {
    let BASEURL = `${PAYPAL_BASEURL}?flowEntry=static`
    BASEURL += `&client_id=${CLIENT_ID}`

    let scopes = [
        "openid",
        "profile",
        "email",
        "https://uri.paypal.com/services/paypalattributes"
    ]
    BASEURL += `&scope=${encodeURIComponent(scopes.join('+'))}`

    //BASEURL += `&scope=openid%20profile%20email%20https%3A%2F%2Furi.paypal.com%2Fservices%2Fpaypalattributes`
    BASEURL += `&redirect_uri=${encodeURIComponent(`${RETURN_URL}/integrations/paypal/callback`)}`
    BASEURL += `&response_type=code`//%20id_token`
    return BASEURL;
}

module.exports = (server: Server): Route => {

    return {
        rateLimit: {
            max: 10,
            timePeriod: 60,
        },
        router: () => {
            router.get("/connect", server.authManager.ensureAuthentication, async (req: Request, res: Response) => {
                let URL = getAuthorizationEndpoint();
                let token = server.authManager.getToken(req)
                if(!await server.authManager.isTokenValid(token)){
                    return res.status(401).json({ error: "Unauthorized" });
                }
                URL += `&state=${token}`
                return res.redirect(URL);
            });

            router.get("/disconnect", server.authManager.ensureAuthentication, async (req: Request, res: Response) => {
                if(!req.user) return res.status(401).json({ error: "Unauthorized" });

                let integration = await server.database.integration.findFirst({
                    where: {
                        userId: req.user.id,
                        type: IntegrationType.PAYPAL,
                    }
                })

                if(!integration) return res.status(404).json({ error: "Integration not found." });

                await server.database.integration.delete({
                    where: {
                        id: integration.id,
                    }
                })

                return res.redirect(`${FRONTEND_URL}/profile/settings`)

            })

            router.get("/callback", server.authManager.ensureAuthentication, async (req: Request, res: Response) => {
                if(!req.user) return res.status(401).json({ error: "Unauthorized" });
                let { code, state } = req.query;

                if(!code) return res.status(400).json({ error: "No code provided." });
                if(typeof code !== "string") return res.status(400).json({ error: "Invalid code provided." });
                if(!state) return res.status(400).json({ error: "No state provided." });
                if(typeof state !== "string") return res.status(400).json({ error: "Invalid state provided." });

                let currentToken = server.authManager.getToken(req)
                if(currentToken !== state) return res.status(400).json({ error: "Invalid state provided." });
                if(!await server.authManager.isTokenValid(state)) return res.status(401).json({ error: "Unauthorized" });

                const auth = Buffer.from(CLIENT_ID + ":" + CLIENT_SECRET).toString("base64")
                let oauthToken = await axios.post(`${PAYPAL_BASEURL_API}/v1/oauth2/token`, {
                    grant_type: "authorization_code",
                    code,
                }, {
                    headers: {
                        "Content-Type": "application/x-www-form-urlencoded",
                        Authorization: `Basic ${auth}`,
                    }
                }).then(res => res.data).catch(err => {
                    console.log(err)
                    return null;
                })

                let accessToken = oauthToken?.access_token;
                if(!accessToken) return res.status(500).json({ error: "Failed to get oauth token." });
                
                let identity = await axios.get(`${PAYPAL_BASEURL_API}/v1/identity/openidconnect/userinfo?schema=openid`, {
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                        "Content-Type": "application/x-www-form-urlencoded",
                    }
                }).then(res => res.data).catch(err => {
                    console.log(err)
                    return null;
                })

                if(!identity) return res.status(500).json({ error: "Failed to get identity." });
                if(`${identity?.verified}` !== "true") return res.status(500).json({ error: "Identity is not verified." });
                if(`${identity?.email_verified}` !== "true") return res.status(500).json({ error: "Email is not verified." });

                let success = true;

                if(!identity.payer_id) success = false;
                if(!identity.email) success = false;

                if(!success) return res.status(500).json({ error: "Failed to get identity." });

                if(await server.database.integration.findFirst({
                    where: {
                        userId: req.user.id,
                        type: IntegrationType.PAYPAL,
                    }
                })) return res.status(400).json({ error: "Integration already exists." });

                await server.database.integration.create({
                    data: {
                        userId: req.user.id,
                        type: IntegrationType.PAYPAL,
                        data: {
                            payerId: identity.payer_id,
                            email: identity.email,
                        }
                    }
                })

                return res.redirect(`${FRONTEND_URL}/profile/settings`)

            });

            
            return router;
        }
    }
}