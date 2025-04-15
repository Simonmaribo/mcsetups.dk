import http from "@/api/http";
import { PurchaseType } from "database";

export interface PurchasesResponse {
    id: number;
    userId: number;
    type: PurchaseType;
    createdAt: Date;
    user: {
        id: number;
        displayName: string;
        discordId: string;
        avatarUrl: string;
    };
    transaction?: {
        amount: number;
    };
}

export default function getProductPurchases({ productId }: { productId?: string } = {}): Promise<PurchasesResponse[]> {
    return new Promise(async (resolve, reject) => {
        await http.get(`/products/${productId}/purchases`)
            .then((response) => resolve(response.data))
            .catch((error) => reject(error));
    });
}
