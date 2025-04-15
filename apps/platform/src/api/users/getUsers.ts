import http from "@/api/http";

type UsersResponse = {
    users: {
        discordName: string;
        displayName: string;
        id: number;
        discordId: string;
        createdAt: Date;
        verified: boolean;
        group: number;
        avatarUrl: string;
        _count: {
            products: number;
        };
    }[]
    total: number;
    pages: number;
    currentPage: number;
}


export default function getUsers({ 
    page = 1,
    limit = 12,  
    search = "",
}: { page?: number, limit?: number, search?: string}): Promise<UsersResponse> {
    return new Promise(async (resolve, reject) => {
        await http.get(`/user/users/list`, { params: { page, limit, search } })
            .then((response) => resolve(response.data))
            .catch((error) => reject(error));
    });
}
