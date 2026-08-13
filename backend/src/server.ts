import "./config/env";
import app from "./app";
import prisma from "./config/prisma";

const PORT = Number(process.env.PORT) || 5000;

const startServer = async () => {
  try {
    await prisma.$connect();
    console.log("PostgreSQL connected");

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("\nFailed to connect to PostgreSQL.");
    console.error("Check DATABASE_URL in backend/.env — get it from Supabase → Project Settings → Database.\n");
    console.error(error);
    process.exit(1);
  }
};

startServer();
