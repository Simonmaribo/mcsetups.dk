import http from "@/api/http";
import { Product, ProductRelease, ReleaseStatusUpdate } from "database";

export type DetailedProductsResponse = (Product & {
    releases: (ProductRelease & {
        statusUpdate: ReleaseStatusUpdate | null;
    })[];
    _count: {
        purchases: number;
        favorites: number;
    };
});

export default function getDetailedProducts({ userId = "@me" }: { userId?: string } = {}): Promise<DetailedProductsResponse[]> {
    return new Promise(async (resolve, reject) => {
        await http.get(`/user/${userId}/products/details`)
            .then((response) => resolve(response.data))
            .catch((error) => reject(error));
    });
}
