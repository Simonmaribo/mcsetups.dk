import http from "@/api/http";

export default function deleteManualPurchase({ productId, userId }: { productId: number | string, userId: number | string }): Promise<Response> {
    return new Promise(async (resolve, reject) => {
        await http.delete(`/products/${productId}/purchases/${userId}`)
            .then((response) => resolve(response.data))
            .catch((error) => reject(error.response.data));
    });
}
