import http from "@/api/http";
import { ProductType } from "database";

export interface FrontpageProduct {
    id: number;
    title: string;
    price: number;
    sale: number;
    bannerUrl: string;
    type: ProductType;
    createdAt: Date;
    updatedAt: Date;
}

export interface FrontpageResponse {
    topProducts: FrontpageProduct[];
    randomProducts: FrontpageProduct[];
}

export default function getFrontpage(): Promise<FrontpageResponse> {
    return new Promise(async (resolve, reject) => {
        await http.get(`/products/frontpage`)
            .then((response) => resolve(response.data))
            .catch((error) => reject(error));
    });
}
