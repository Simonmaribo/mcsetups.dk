import http from "@/api/http";

export default function connectPaypal() {
    window.open(`${http.defaults.baseURL}/integrations/paypal/connect`, "_self");
}
