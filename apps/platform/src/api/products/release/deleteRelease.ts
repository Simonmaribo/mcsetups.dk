import http from "@/api/http";

export default function deleteRelease({ releaseId }: { releaseId: number | string }): Promise<Response> {
    return new Promise(async (resolve, reject) => {
        await http.delete(`/products/releases/${releaseId}`)
            .then((response) => resolve(response.data))
            .catch((error) => reject(error));
    });
}
