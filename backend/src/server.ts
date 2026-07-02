import app from "./app";
import { redisClient } from "./config/redis";

const PORT = 5000;

const startServer = async () => {
    try {
        await redisClient.connect();

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