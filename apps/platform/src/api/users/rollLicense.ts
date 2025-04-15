import http from "@/api/http";

export default function rollLicense({ userId = "@me", productId }: { userId?: string | number, productId: string | number}): Promise<Response> {
    return new Promise(async (resolve, reject) => {
        await http.put(`/user/${userId}/licenses/${productId}`)
            .then((response) => resolve(response.data))
            .catch((error) => reject(error));
    });
}
