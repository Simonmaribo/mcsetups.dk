import type Server from "@/interfaces/Server";

module.exports = (server: Server) => {
    return {
        name: "Temp Balance Transfer",
        enabled: true,
        cron: "0 * * * *",
        run: async () => {
            const tempBalances = await server.database.tempBalance.findMany({
                where: {
                    availableAt: {
                        lte: new Date()
                    }
                }
            });
            let users: {
                [key: number]: number
            } = {};
            tempBalances.forEach(tempBalance => users[tempBalance.userId] = (users[tempBalance.userId] || 0) + tempBalance.amount);
            await server.database.tempBalance.deleteMany({
                where: {
                    availableAt: {
                        lte: new Date()
                    }
                }
            });
            for (const [userId, amount] of Object.entries(users)) {
                await server.database.user.update({
                    where: {
                        id: parseInt(userId)
                    },
                    data: {
                        balance: {
                            increment: amount
                        }
                    }
                });
            }
        }
    }
};