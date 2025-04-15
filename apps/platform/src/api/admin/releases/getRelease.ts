import http from "@/api/http";
import { Prisma, ProductType, ReleaseStatusUpdate } from "database";

type Response = {
    id: number;
    title: string;
    version: string;
    createdAt: Date;
    statusUpdate: ReleaseStatusUpdate | null;
    status: string;
    changelog: string;
    product: {
        id: number;
        createdAt: Date;
        price: number;
        type: ProductType;
        skriptVersion: string;
        description: string;
        brief: string;
        minecraftVersions: Prisma.JsonValue,
        bannerUrl: string;
        creator: {
            id: number;
            displayName: string;
            avatarUrl: string;
        }
    }
};

export default function getRelease({ releaseId }: { releaseId: number | string }): Promise<Response> {
    return new Promise(async (resolve, reject) => {
        await http.get(`/admin/releases/${releaseId}`)
            .then((response) => resolve(response.data))
            .catch((error) => reject(error));
    });
}
