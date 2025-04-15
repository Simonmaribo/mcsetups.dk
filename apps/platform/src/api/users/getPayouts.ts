import http from "@/api/http";
import { Payout } from "database";

export default function getPayouts({ userId = "@me" }: { userId?: string } = {}): Promise<Payout[]> {
    return new Promise(async (resolve, reject) => {
        await http.get(`/user/${userId}/payouts`)
            .then((response) => resolve(response.data))
            .catch((error) => reject(error));
    });
}
