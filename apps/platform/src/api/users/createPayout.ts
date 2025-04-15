import http from "@/api/http";
import { Payout } from "database";

export default function createPayout({ userId = "@me", amount = 0 }: { userId?: string, amount?: number } = {}): Promise<Payout> {
    return new Promise(async (resolve, reject) => {
        await http.post(`/user/${userId}/payouts`, { amount })
            .then((response) => resolve(response.data))
            .catch((error) => reject(error?.response?.data));
    });
}
