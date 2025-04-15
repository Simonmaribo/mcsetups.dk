import http from "@/api/http";
import { PurchaseType, ProductType } from "database";

export interface PurchasesReponse {
    id: number;
    type: PurchaseType;
    transactionId: number | null;
    createdAt: Date;
    product: {
        id: number;
        type: ProductType;
        title: string;
        licensable: boolean;
        createdAt: Date;
    };
}[]

export default function getPurchases({ userId = "@me" }: { userId?: string } = {}): Promise<PurchasesReponse[]> {
    return new Promise(async (resolve, reject) => {
        await http.get(`/user/${userId}/purchases`)
            .then((response) => resolve(response.data))
            .catch((error) => reject(error));
    });
}
