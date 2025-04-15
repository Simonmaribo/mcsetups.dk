import { ProductType } from 'database';
import http from "@/api/http";

export interface ProductResponse {
    id: number;
    creator: {
        id: number;
        displayName: string;
        avatarUrl: string;
        verified: boolean;
        description: string;
    };
    releases: {
        id: number;
        title: string;
        version: string;
        resourceSize: number;
        createdAt: Date;
    }[];
    title: string;
    description: string;
    brief: string;
    price: number;
    sale: number;
    type: ProductType;
    skriptVersion: string;
    minecraftVersions: string[];
    tags: string[];
    bannerUrl: string;
    bannerId: string;
    updatedAt: Date;
    createdAt: Date;
}


export default function getProduct({ productId, addView = false }: { productId?: string, addView?: boolean } = {}): Promise<ProductResponse> {
    if(addView){
        return new Promise(async (resolve, reject) => {
            await http.get(`/products/${productId}`, { params: { addView } })
                .then((response) => resolve(response.data))
                .catch((error) => reject(error));
        });
    } else {
        return new Promise(async (resolve, reject) => {
            await http.get(`/products/${productId}`)
                .then((response) => resolve(response.data))
                .catch((error) => reject(error));
        });
    }
}
