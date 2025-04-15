import http from "@/api/http";

export default function downloadProduct({ productId }: { productId?: string | number } = {}) {
    window.open(`${http.defaults.baseURL}/products/${productId}/download`, "_blank");
}
