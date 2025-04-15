import type Server from "@/interfaces/Server";
import fs from "fs";
import path from "path";
module.exports = (server: Server) => {
    return {
        name: "Garbage Collection (Tmp Files)",
        enabled: true,
        cron: "0 0 * * *",
        run: async () => {
            try {
                let dir = "tmp";
                fs.readdir(dir, (err, files) => {
                    if (err) {
                        return console.error(err);
                    } else if (files == null || files.length === 0) {
                        return;
                    }
                    files.forEach((file) => {
                        fs.stat(path.join(dir, file), (err, stats) => {
                            var endTime, now;
                            if (err) {
                                return console.error(err);
                            }
                            now = new Date().getTime();
                            endTime = new Date(stats.ctime).getTime() + 86400000;
                            if (now > endTime) {
                                // delete file
                                fs.unlink(path.join(dir, file), (err) => {
                                    if (err) {
                                        return console.error(err);
                                    }
                                });
                            }
                        });
                    });
                });
            } catch (error) {
                console.error(error);
            }
        }
    }
};