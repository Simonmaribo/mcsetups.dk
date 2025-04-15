import http from "@/api/http";
import { UserFavoriteProduct } from "database";

export default function getFavorites({ userId = "@me" }: { userId?: string | number } = {}): Promise<UserFavoriteProduct[]> {
    return new Promise(async (resolve, reject) => {
        await http.get(`/user/${userId}/favorites`)
            .then((response) => resolve(response.data))
            .catch((error) => reject(error));
    });
}
