import http from "@/api/http";
import { ProductType } from "database";

export interface PublicProfileResponse {
    displayName: string;
    id: number;
    description: string;
    discordName: string;
    avatarUrl: string;
    createdAt: Date;
    verified: boolean;
    products: {
        id: number;
        title: string;
        public: boolean;
        brief: string;
        price: number;
        sale: number;
        bannerId: string;
        bannerUrl: string | null;
        type: ProductType;
    }[];
}

export default function getPublicProfile({ username }: { username: string }): Promise<PublicProfileResponse> {
    return new Promise(async (resolve, reject) => {
        await http.get(`/user/${username}/profile/public`)
            .then((response) => resolve(response.data))
            .catch((error) => reject(error?.response?.data));
    });
}
