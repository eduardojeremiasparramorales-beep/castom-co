import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  // Hash the passwords
  const adminHash = await bcrypt.hash("castom.co", 10);
  const demoHash = await bcrypt.hash("johndoe123", 10);

  // Create or update admin@castom.co
  await prisma.user.upsert({
    where: { email: "admin@castom.co" },
    update: {
      name: "Omar",
      password: adminHash,
      role: "admin",
      wholesaleStatus: "approved",
    },
    create: {
      email: "admin@castom.co",
      name: "Omar",
      password: adminHash,
      role: "admin",
      wholesaleStatus: "approved",
    },
  });
  console.log("✅ Admin user created: admin@castom.co / castom.co");

  // Update demo user
  await prisma.user.upsert({
    where: { email: "john@doe.com" },
    update: {
      name: "Demo Cliente",
      password: demoHash,
      role: "customer",
      wholesaleStatus: "approved",
      companyName: "Demo Company SAS",
      companyNIT: "900.123.456-7",
      city: "Acacías",
      department: "Meta",
    },
    create: {
      email: "john@doe.com",
      name: "Demo Cliente",
      password: demoHash,
      role: "customer",
      wholesaleStatus: "approved",
      companyName: "Demo Company SAS",
      companyNIT: "900.123.456-7",
      city: "Acacías",
      department: "Meta",
    },
  });
  console.log("✅ Demo user ready: john@doe.com / johndoe123");

  // Verify
  const users = await prisma.user.findMany({
    select: { email: true, name: true, role: true, wholesaleStatus: true },
  });
  console.log("\n📋 Users in DB:");
  users.forEach((u) => console.log(`   ${u.email} — ${u.name} — ${u.role} — ${u.wholesaleStatus}`));
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect().then(() => process.exit(0)));
