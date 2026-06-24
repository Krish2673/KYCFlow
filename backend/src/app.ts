import express from "express";
import cors from "cors";
import tenantRoutes from "./modules/tenant/tenant.routes";
import userRoutes from "./modules/user/user.routes";
import authRoutes from "./modules/auth/auth.routes";
import { authenticate } from "./middleware/auth.middleware";

const app = express();

app.use(cors());
app.use(express.json());

app.get("/health", (_, res) => {
  res.status(200).json({
    success: true,
    message: "KYCFlow API running"
  });
});

app.use("/api/v1/tenants", tenantRoutes);
app.use("/api/v1/users", userRoutes);
app.use("/api/v1/auth", authRoutes);
app.get(
  "/me",
  authenticate,
  (req, res) => {

    res.json({
      success: true,
      user: req.user,
    });

  }
);

export default app;