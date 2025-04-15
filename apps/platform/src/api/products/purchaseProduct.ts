import http from "@/api/http";

export default function updateStatus({ productId }: { productId: number | string }): Promise<Response> {
    return new Promise(async (resolve, reject) => {
        await http.put(`/products/${productId}/purchase`)
            .then((response) => resolve(response.data))
            .catch((error) => reject(error));
    });
}
