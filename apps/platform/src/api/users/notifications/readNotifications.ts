import http from "@/api/http";

export default function readNotifications({ userId = "@me", notificationId = "all"}: { userId?: string, notificationId?: number | "all" } = {}): Promise<Response> {
    return new Promise(async (resolve, reject) => {
        await http.post(`/user/${userId}/notifications/read/${notificationId}`)
            .then((response) => resolve(response.data))
            .catch((error) => reject(error));
    });
}
