import { ProductStatus, ReleaseStatusUpdate } from 'database';
import http from "@/api/http";

export interface ReleaseResponse {
    id: number;
    title: string;
    version: string;
    resourceSize: number;
    changelog: string;
    createdAt: Date;
    updatedAt: Date;
    status: ProductStatus | null;
    statusUpdate: ReleaseStatusUpdate | null;
    product: {
        creatorId: number;
    }
}


export default function getRelease({ releaseId }: { releaseId?: string } = {}): Promise<ReleaseResponse> {
    return new Promise(async (resolve, reject) => {
        await http.get(`/products/releases/${releaseId}`)
            .then((response) => resolve(response.data))
            .catch((error) => reject(error));
    });
}
