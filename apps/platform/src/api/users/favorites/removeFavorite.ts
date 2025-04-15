import http from "@/api/http";

export default function deleteFavorite({ userId = "@me", productId }: { userId?: string | number, productId: string | number }): Promise<Response> {
    return new Promise(async (resolve, reject) => {
        await http.delete(`/user/${userId}/favorites/${productId}`)
            .then((response) => resolve(response.data))
            .catch((error) => reject(error));
    });
}
