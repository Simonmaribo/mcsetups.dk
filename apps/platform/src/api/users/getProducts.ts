import http from "@/api/http";
import { Product, ProductRelease } from "database";

export default function getProducts({ userId = "@me" }: { userId?: string } = {}): Promise<(Product & { releases: ProductRelease[] })[]> {
    return new Promise(async (resolve, reject) => {
        await http.get(`/user/${userId}/products`)
            .then((response) => resolve(response.data))
            .catch((error) => reject(error));
    });
}
