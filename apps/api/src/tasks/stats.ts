import type Server from "@/interfaces/Server";
import { updateStats } from "@/libs/functions/updateStats";

module.exports = (server: Server) => {
    return {
        name: "Product Stats Updater",
        enabled: true,
        cron: "1 0 * * *",
        run: async () => {
            await updateStats(server);
        }
    }
};