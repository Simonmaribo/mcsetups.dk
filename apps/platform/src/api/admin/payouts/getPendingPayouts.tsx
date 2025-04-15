import http from "@/api/http";
import { Integration, Payout, Prisma } from "database";

export type PendingPayout = (Payout & {
    user: {
        discordName: string;
        discordId: string;
        displayName: string;
        email: string;
        avatarUrl: string;
        id: number;
        integrations: Integration[];
    };
})

export default function getPendingPayouts(): Promise<PendingPayout[]> {
    return new Promise(async (resolve, reject) => {
        await http.get(`/admin/payouts/pending`)
            .then((response) => resolve(response.data))
            .catch((error) => reject(error));
    });
}
