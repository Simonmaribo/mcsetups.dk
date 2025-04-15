import http from "@/api/http";

export default function downloadProduct({ userId }: { userId?: string | number } = {}) {
    window.open(`${http.defaults.baseURL}/admin/users/${userId}/login`, "_self");
}
