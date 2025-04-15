import http from "@/api/http";

export default function disconnectPaypal() {
    window.open(`${http.defaults.baseURL}/integrations/paypal/disconnect`, "_self");
}
