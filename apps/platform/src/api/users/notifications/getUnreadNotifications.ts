import http from "@/api/http";
import { Notification } from "database";

export default function getUnreadNotifications({ userId = "@me" }: { userId?: string } = {}): Promise<Notification[]> {
    return new Promise(async (resolve, reject) => {
        await http.get(`/user/${userId}/notifications/unread`)
            .then((response) => resolve(response.data))
            .catch((error) => reject(error));
    });
}
