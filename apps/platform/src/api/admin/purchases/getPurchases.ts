import http from "@/api/http";

type Response = {
    purchases: {
        id: number;
        createdAt: Date;
        user: {
            id: number;
            displayName: string;
            discordName: string;
            discordId: string;
            avatarUrl: string;
        };
        product: {
            id: number;
            title: string;
            price: number;
            creator: {
                id: number;
                displayName: string;
                discordName: string;
                discordId: string;
                avatarUrl: string;
            }
        };
        transaction?: {
            id: number;
            amount: number;
        }
    }[]
    total: number;
    pages: number;
    currentPage: number;
};

export default function getPurchases({ page = 1, limit = 15 }: { page?: number, limit?: number }): Promise<Response> {
    return new Promise(async (resolve, reject) => {
        await http.get(`/admin/purchases`, { params: { page, limit } })
            .then((response) => resolve(response.data))
            .catch((error) => reject(error));
    });
}
