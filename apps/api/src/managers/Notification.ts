import type NotificationManager from "@/interfaces/managers/NotificationManager";
import { NotificationType, PrismaClient } from "database";

module.exports = (db: PrismaClient): NotificationManager => {
    const notification: any = {};

    notification.sendNotification = async ({
        userId,
        type,
        metadata,
    }: {
        userId: number;
        type: NotificationType;
        metadata: any;
    }): Promise<void> => {
        try {
            await db.notification.create({
                data: {
                    userId,
                    type,
                    metadata,
                },
            });
        }
        catch (err) {
            console.error(err);
        }
    }

    return notification;
}