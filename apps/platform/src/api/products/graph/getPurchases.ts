import http from "@/api/http";

export default function getPurchases({ productId }: { productId?: string | number }): Promise<{
    date: Date;
    purchases: number;
}[]> {
    return new Promise(async (resolve, reject) => {
        await http.get(`/products/${productId}/purchases/graph`)
            .then((response) => resolve(response.data))
            .catch((error) => reject(error));
    });
}
