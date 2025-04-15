import http from "@/api/http";

export interface Response {
    access: boolean;
}

export default function getAccess({ productId, userId = "@me" }: { productId?: string | number, userId?: string | number }): Promise<Response> {
    return new Promise(async (resolve, reject) => {
        await http.get(`/products/${productId}/access/${userId}`)
            .then((response) => resolve(response.data))
            .catch((error) => reject(error));
    });
}
