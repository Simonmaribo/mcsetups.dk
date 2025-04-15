import http from "@/api/http";
import { Prisma, TransactionType } from "database";

export type TransactionsResponse = {
    id: number;
    userId: number;
    type: TransactionType;
    amount: number;
    metadata: Prisma.JsonValue;
    createdAt: Date;
    product: {
        id: number;
        title: string;
    } | null;
};

export default function getTransactions({ userId = "@me", page = 1, limit = 10 }: { userId?: string | number, page?: number, limit?: number }): Promise<TransactionsResponse[]> {
    return new Promise(async (resolve, reject) => {
        await http.get(`/user/${userId}/transactions`, { params: { page, limit } })
            .then((response) => resolve(response.data))
            .catch((error) => reject(error));
    });
}
