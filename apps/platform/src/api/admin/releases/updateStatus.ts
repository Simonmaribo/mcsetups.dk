import http from "@/api/http";
import { ProductStatus } from "database";

export default function updateStatus({ id, status, comment }: { id: number | string, status: ProductStatus, comment?: string }): Promise<Response> {
    return new Promise(async (resolve, reject) => {
        await http.put(`/admin/releases/${id}`, { status, comment })
            .then((response) => resolve(response.data))
            .catch((error) => reject(error));
    });
}
