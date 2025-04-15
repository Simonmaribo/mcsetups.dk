import http from "@/api/http";

export default function addFavorite({ userId = "@me", productId }: { userId?: string | number, productId: string | number }): Promise<Response> {
    return new Promise(async (resolve, reject) => {
        await http.post(`/user/${userId}/favorites/${productId}`)
            .then((response) => resolve(response.data))
            .catch((error) => reject(error));
    });
}
