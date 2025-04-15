import { PrismaClient } from "database";
import AuthManager from "@/interfaces/managers/AuthManager";
import NotificationManager from "@/interfaces/managers/NotificationManager";
export default interface Server {
    database: PrismaClient,
    environment: 'development' | 'production',
    authManager: AuthManager,
    notificationManager: NotificationManager,
}