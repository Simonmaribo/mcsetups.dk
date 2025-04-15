import axios from "axios"

const CLIENT_ID = process.env.PAYPAL_CLIENT_ID
const CLIENT_SECRET = process.env.PAYPAL_CLIENT_SECRET
const PAYPAL_BASEURL_API = (process.env.NODE_ENV == "development" ? "https://api-m.sandbox.paypal.com" : "https://api-m.paypal.com")
export async function generateAccessToken() {
    const auth = Buffer.from(CLIENT_ID + ":" + CLIENT_SECRET).toString("base64")
    const response = await axios.post(`${PAYPAL_BASEURL_API}/v1/oauth2/token`, "grant_type=client_credentials", {
        headers: {
            Authorization: `Basic ${auth}`
        }
    });
    return response.data.access_token;
}
