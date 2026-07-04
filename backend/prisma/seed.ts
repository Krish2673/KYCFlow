import prisma from "../src/config/prisma";
import bcrypt from "bcrypt";

async function main() {
  const tenant = await prisma.tenant.create({
    data: {
      name: "Zerodha",
    },
  });

  const password = await bcrypt.hash("password123", 10);

  const admin = await prisma.user.create({
    data: {
      name: "Admin",
      email: "admin@zerodha.com",
      password,
      role: "TENANT_ADMIN",
      tenantId: tenant.id,
    },
  });

  await prisma.user.create({
    data: {
      name: "Reviewer",
      email: "reviewer@zerodha.com",
      password,
      role: "REVIEWER",
      tenantId: tenant.id,
    },
  });

  for (let i = 1; i <= 5; i++) {
    await prisma.application.create({
      data: {
        fullName: `User ${i}`,
        email: `user${i}@gmail.com`,
        tenantId: tenant.id,
        createdById: admin.id,
      },
    });
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });