import http from "@/api/http";

type Sitemap = {
    id: number;
    title: string;
    createdAt: Date;
    updatedAt: Date;
}


export default function getSitemap(): Promise<Sitemap[]> {
    return new Promise(async (resolve, reject) => {
        await http.get(`/sitemap`)
            .then((response) => resolve(response.data))
            .catch((error) => reject(error));
    });
}
