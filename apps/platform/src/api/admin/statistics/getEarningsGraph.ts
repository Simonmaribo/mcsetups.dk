import http from "@/api/http";


export interface IEarningsGraph {
    date: Date;
    amount: number;
    netVolume: number;
    grossVolume: number;
}

export default function getEarningsGraph({ startDate, endDate }: { startDate?: Date, endDate?: Date }): Promise<{
    data: IEarningsGraph[];
    totalAmount: number;
    totalNetVolume: number;
    totalGrossVolume: number;
}> {
    return new Promise(async (resolve, reject) => {
        await http.get(`/admin/statistics/earnings/graph`, {
            params: {
                startDate,
                endDate
            }
        })
            .then((response) => resolve(response.data))
            .catch((error) => reject(error));
    });
}
