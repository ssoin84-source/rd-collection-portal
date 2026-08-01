import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  await prisma.setting.upsert({
    where: { key: "penaltyPerMonth" },
    create: { key: "penaltyPerMonth", value: "10" },
    update: {},
  });

  const customer = await prisma.customer.upsert({
    where: { accountNumber: "RD-10001" },
    create: {
      customerName: "Ramesh Kumar",
      accountNumber: "RD-10001",
      denomination: 1000,
      openingDate: new Date("2025-01-05"),
      monthPaidUpto: new Date("2025-01-05"),
      status: "ACTIVE",
    },
    update: {},
  });

  const passwordHash = await bcrypt.hash("Customer@123", 10);
  await prisma.customerLogin.upsert({
    where: { username: "ramesh.kumar" },
    create: {
      username: "ramesh.kumar",
      passwordHash,
      accounts: { create: { customerId: customer.id } },
    },
    update: {},
  });

  console.log("Seed complete. Sample customer login -> username: ramesh.kumar / password: Customer@123");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
