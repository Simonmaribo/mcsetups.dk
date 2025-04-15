import http from "@/api/http";

export interface License {
    product: {
        id: number;
        title: string;
    };
    license: {
        id: number;
        key: string;
        lastUpdated: Date;
    } | null;
}

export default function getLicenses({ userId = "@me" }: { userId?: string } = {}): Promise<License[]> {
    return new Promise(async (resolve, reject) => {
        await http.get(`/user/${userId}/licenses`)
            .then((response) => resolve(response.data))
            .catch((error) => reject(error));
    });
}
