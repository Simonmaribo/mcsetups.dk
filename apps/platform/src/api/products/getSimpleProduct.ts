import { ProductType } from 'database';
import http from "@/api/http";

export interface ProductResponse {
    id: number;
    publicId: string;
    title: string;
    brief: string;
    price: number;
    type: ProductType;
    skriptVersion: string;
    minecraftVersions: string[];
    bannerUrl: string;
    updatedAt: Date;
    createdAt: Date;
}


export default function getSimpleProduct({ productId }: { productId?: string } = {}): Promise<ProductResponse> {
    return new Promise(async (resolve, reject) => {
        await http.get(`/products/${productId}/simple`)
            .then((response) => resolve(response.data))
            .catch((error) => reject(error));
    });
}
