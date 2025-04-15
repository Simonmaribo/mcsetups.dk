import http from "@/api/http";
import { ProductHistoryStat } from "database";

export default function getTotalStats({ productId, startDate, endDate }: { productId?: string | number, startDate?: Date, endDate?: Date }): Promise<ProductHistoryStat[]> {
    return new Promise(async (resolve, reject) => {
        await http.get(`/products/${productId}/stats/graph`, {
            params: {
                startDate,
                endDate
            }
        })
            .then((response) => resolve(response.data))
            .catch((error) => reject(error));
    });
}
