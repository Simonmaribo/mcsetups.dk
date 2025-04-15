import http from "@/api/http";
import { User } from "database";

export default function getUser({ userId = "@me" }: { userId?: string } = {}): Promise<User> {
    return new Promise(async (resolve, reject) => {
        await http.get(`/user/${userId}`)
            .then((response) => resolve(response.data))
            .catch((error) => reject(error));
    });
}
