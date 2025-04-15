import http from "@/api/http";

export default function getSaleTransactions({ userId = "@me" }: { userId?: string | number } = {}): Promise<{
    date: Date;
    amount: number;
}[]> {
    return new Promise(async (resolve, reject) => {
        await http.get(`/user/${userId}/transactions/graph`)
            .then((response) => resolve(response.data))
            .catch((error) => reject(error));
    });
}
