import { NotificationType } from "database";


export default interface NotificationManager {
    sendNotification({ userId, type, metadata }: { userId: number; type: NotificationType; metadata: any; }): void;
}