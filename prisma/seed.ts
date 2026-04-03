import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  await prisma.role.createMany({
    data: [
      { name: "VIEWER", description: "Basic user" },
      { name: "ANALYST", description: "Can view data" },
      { name: "ADMIN", description: "Full access" },
    ],
    skipDuplicates: true,
  });

  console.log("Roles seeded");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());