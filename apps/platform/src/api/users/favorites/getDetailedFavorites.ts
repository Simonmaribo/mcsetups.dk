import http from "@/api/http";
import { ProductType, UserFavoriteProduct } from "database";

type DetailedFavorites = UserFavoriteProduct & {
    product: {
        id: number;
        createdAt: Date;
        title: string;
        price: number;
        sale: number;
        type: ProductType;
        bannerId: string;
        bannerUrl: string | null;
        updatedAt: Date;
    };
}[]

export default function getDetailedFavorites({ userId = "@me" }: { userId?: string | number } = {}): Promise<DetailedFavorites> {
    return new Promise(async (resolve, reject) => {
        await http.get(`/user/${userId}/favorites/detailed`)
            .then((response) => resolve(response.data))
            .catch((error) => reject(error));
    });
}
