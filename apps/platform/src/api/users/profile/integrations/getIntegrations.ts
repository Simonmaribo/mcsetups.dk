import http from "@/api/http";
import { Integration } from "database";


export default function getIntegrations({ userId = "@me" }: { userId?: string | number } = {}): Promise<Integration[]> {
    return new Promise(async (resolve, reject) => {
        await http.get(`/user/${userId}/integrations`)
            .then((response) => resolve(response.data))
            .catch((error) => reject(error));
    });
}
