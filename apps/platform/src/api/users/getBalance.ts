import http from "@/api/http";

export interface getBalanceResponse {
    balance: number;
    tempBalance: {
        amount: number;
        availableAt: Date;
    }[];
}

export default function getBalance({ userId = "@me" }: { userId?: string | number } = {}): Promise<getBalanceResponse> {
    return new Promise(async (resolve, reject) => {
        await http.get(`/user/${userId}/balance`)
            .then((response) => resolve(response.data))
            .catch((error) => reject(error));
    });
}
