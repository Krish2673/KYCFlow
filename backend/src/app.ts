import express from "express";
import cors from "cors";
import tenantRoutes from "./modules/tenant/tenant.routes";

const app = express();

app.use(cors());
app.use(express.json());
app.use("/api/v1/tenants", tenantRoutes);

app.get("/health", (_, res) => {
  res.status(200).json({
    success: true,
    message: "KYCFlow API running"
  });
});

export default app;