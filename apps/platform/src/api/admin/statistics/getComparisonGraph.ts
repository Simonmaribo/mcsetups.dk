import http from "@/api/http";


export interface ComparisonData {
    date: Date;
    argonClicks: number;
    argonDownloads: number;
    mcsetupsViews: number;
    mcsetupsDownloads: number;
}

export default function getComparisonGraph({ startDate, endDate }: { startDate?: Date, endDate?: Date }): Promise<ComparisonData[]> {
    return new Promise(async (resolve, reject) => {
        await http.get(`/admin/statistics/comparison/graph`, {
            params: {
                startDate,
                endDate
            }
        })
            .then((response) => resolve(response.data))
            .catch((error) => reject(error));
    });
}
