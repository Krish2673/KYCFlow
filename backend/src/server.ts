import app from "./app";
import { redisClient } from "./config/redis";
import "./workers/email.worker";

const PORT = 5000;

const startServer = async () => {
    try {
        app.listen(PORT, () => {
            console.log(
                `Server running on port ${PORT}`
            );
        });

    } catch (error) {
        console.error(error);
    }
};

startServer();