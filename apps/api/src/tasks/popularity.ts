import type Server from "@/interfaces/Server";
import { updateProductsPopularity } from "@/libs/functions/updateProductsPopularity";

module.exports = (server: Server) => {
  return {
    name: "Popularity Update",
    enabled: true,
    cron: "0 0 * * *",
    run: async () => {
      await updateProductsPopularity(server);
    },
  };
};
