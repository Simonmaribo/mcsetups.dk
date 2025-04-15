import type Server from "@/interfaces/Server";
import { updateRandomProducts } from "@/libs/functions/updateRandomProducts";

module.exports = (server: Server) => {
    return {
        name: "Random Products",
        enabled: true,
        cron: "0 0 * * *",
        run: async () => {
            await updateRandomProducts(server);
        }
    }
};