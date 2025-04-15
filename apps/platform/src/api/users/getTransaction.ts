import http from "@/api/http";
import { Transaction } from "database";

export type getTransactionResponse = 
    (Transaction & {
        purchase: {
            id: number;
            productId: number;
            transactionId: number;
            product: {
                title: string;
                bannerUrl: string | null;
            };
        } | null;
    });

export default function getTransaction({ userId = "@me", transactionId }: { userId?: string | number, transactionId: string | number }): Promise<getTransactionResponse> {
    return new Promise(async (resolve, reject) => {
        await http.get(`/user/${userId}/transactions/${transactionId}`)
            .then((response) => resolve(response.data))
            .catch((error) => reject(error));
    });
}
