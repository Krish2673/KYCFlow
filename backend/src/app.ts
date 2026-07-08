import express from "express";
import cors from "cors";
import tenantRoutes from "./modules/tenant/tenant.routes";
import userRoutes from "./modules/user/user.routes";
import authRoutes from "./modules/auth/auth.routes";
import { authenticate } from "./middleware/auth.middleware";
import applicationRoutes from "./modules/application/application.routes";
import { errorHandler } from "./middleware/error.middleware";
import documentRoutes from "./modules/document/document.routes";
import swaggerUi from "swagger-ui-express";
import { swaggerSpec } from "./config/swagger";
import helmet from "helmet";
import morgan from "morgan";
import prisma from "./config/prisma";
import { redisClient } from "./config/redis";


const app = express();

app.use(morgan("dev"));
app.use(helmet({contentSecurityPolicy: false}));
app.use(
    cors({
        origin: [
            process.env.FRONTEND_URL!,
        ],
        credentials: true,
        methods: [
            "GET",
            "POST",
            "PUT",
            "PATCH",
            "DELETE",
        ],
        allowedHeaders: [
            "Content-Type",
            "Authorization",
        ],
    })
);
app.use(express.json());
app.use(
  "/api-docs",
  swaggerUi.serve,
  swaggerUi.setup(swaggerSpec)
);

app.get("/health", async (_, res) => {

    try {

        await prisma.$queryRaw`SELECT 1`;

        await redisClient.ping();

        return res.status(200).json({
            status: "healthy",
            postgres: "connected",
            redis: "connected",
            timestamp:
                new Date().toISOString(),
        });

    } catch {

        return res.status(503).json({
            status: "unhealthy",
        });

    }

});

app.use("/api/v1/tenants", tenantRoutes);
app.use("/api/v1/users", userRoutes);
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/applications", applicationRoutes);
app.get("/me",authenticate,(req, res) => {
    res.json({
      success: true,
      user: req.user,
    });
  }
);
app.use("/api/v1/documents", documentRoutes);
app.use(errorHandler);

export default app;