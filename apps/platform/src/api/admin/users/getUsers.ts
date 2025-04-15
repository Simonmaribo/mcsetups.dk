import http from "@/api/http";
import { TempBalance } from "database";

type Response = {
    users: {
        discordId: string;
        displayName: string;
        email: string;
        discordName: string;
        id: number;
        balance: number;
        tempBalance: TempBalance[]
        avatarUrl: string;
        createdAt: Date;
        lastLogin: Date;
        verified: boolean;
        group: number;
    }[];
    total: number;
    currentPage: number;
    pages: number;
};

export default function getUsers({ page = 1, limit = 10, search = "" }: { page?: number, limit?: number, search?: string }): Promise<Response> {
    return new Promise(async (resolve, reject) => {
        await http.get(`/admin/users`, { params: { page, limit, search } })
            .then((response) => resolve(response.data))
            .catch((error) => reject(error));
    });
}
