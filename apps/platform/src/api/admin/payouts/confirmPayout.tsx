import http from "@/api/http";

export default function confirmPayout({ payoutId, transactionId }: { payoutId: number | string, transactionId: string }): Promise<Response> {
    return new Promise(async (resolve, reject) => {
        await http.put(`/admin/payouts/${payoutId}/complete`, { transactionId })
            .then((response) => resolve(response.data))
            .catch((error) => reject(error?.response?.data));
    });
}
