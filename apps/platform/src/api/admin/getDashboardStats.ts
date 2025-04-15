import http from "@/api/http";

type Response = {
    user: {
        total: number;
        activeThisMonth: number;
        newThisMonth: number;
        newPreviousMonth: number;
    },
    balance: {
        total: number;
        totalBalance: number;
        tempTotal: number;
    }
};

export default function getDashboardStats(): Promise<Response> {
    return new Promise(async (resolve, reject) => {
        await http.get(`/admin/dashboard/stats`)
            .then((response) => resolve(response.data))
            .catch((error) => reject(error));
    });
}
