import type Server from "@/interfaces/Server";

module.exports = (server: Server) => {
    return {
        name: "Garbage Collection (Sessions)",
        enabled: true,
        cron: "0 0 * * *",
        run: async () => {
            await server.database.session.deleteMany({
                where: {
                    expiresAt: {
                        lte: new Date()
                    }
                }
            });
        }
    }
};