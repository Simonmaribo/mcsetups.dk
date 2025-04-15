import http from "@/api/http";

interface Response {
    link: string;
}

export default function purchaseFunds({ amount }: { amount: number }): Promise<Response> {
    return new Promise(async (resolve, reject) => {
        await http.post(`/payment/paypal/create`, { amount })
            .then((response) => resolve(response.data))
            .catch((error) => reject(error.response.data));
    });
}
