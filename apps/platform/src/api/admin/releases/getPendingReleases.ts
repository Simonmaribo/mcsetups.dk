import http from "@/api/http";
import { Prisma, ProductType, ReleaseStatusUpdate } from "database";

type Response = {
    id: number;
    title: string;
    version: string;
    createdAt: Date;
    statusUpdate: ReleaseStatusUpdate | null;
    product: {
        id: number;
        createdAt: Date;
        price: number;
        type: ProductType;
        skriptVersion: string;
        minecraftVersions: Prisma.JsonValue
        creator: {
            id: number;
            displayName: string;
            avatarUrl: string;
        }
    }
}[];

export default function getPendingReleases(): Promise<Response> {
    return new Promise(async (resolve, reject) => {
        await http.get(`/admin/releases/pending`)
            .then((response) => resolve(response.data))
            .catch((error) => reject(error));
    });
}
