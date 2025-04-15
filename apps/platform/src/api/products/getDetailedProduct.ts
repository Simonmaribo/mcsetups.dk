import http from "@/api/http";
import { Prisma, Product, ProductStatus, ProductType } from "database";

export type DetailedProductResponse = {
    id: number;
    public: boolean;
    title: string;
    description: string;
    price: number;
    type: ProductType;
    skriptVersion: string | null;
    minecraftVersions: Prisma.JsonValue;
    bannerId: string;
    bannerUrl: string | null;
    createdAt: Date;
    updatedAt: Date;
    creator: {
        id: number;
        displayName: string;
        avatarUrl: string | null;
        verified: boolean;
        group: number;
    };
    releases: {
        id: number;
        title: string;
        version: string;
        resourceSize: number;
        createdAt: Date;
        status: ProductStatus;
    }[]
};

export default function getDetailedProduct({ productId }: { productId?: string | number }): Promise<DetailedProductResponse> {
    return new Promise(async (resolve, reject) => {
        await http.get(`/products/${productId}/detailed`)
            .then((response) => resolve(response.data))
            .catch((error) => reject(error));
    });
}
