import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const admin = await prisma.user.findUnique({ where: { email: "admin@castom.co" } });
  const demo = await prisma.user.findUnique({ where: { email: "john@doe.com" } });

  if (!admin) { console.log("❌ admin@castom.co not found"); return; }
  if (!demo) { console.log("❌ john@doe.com not found"); return; }

  const adminOk = await bcrypt.compare("castom.co", admin.password!);
  const demoOk = await bcrypt.compare("johndoe123", demo.password!);

  console.log(`admin@castom.co / castom.co: ${adminOk ? "✅ OK" : "❌ FAIL"}`);
  console.log(`john@doe.com / johndoe123: ${demoOk ? "✅ OK" : "❌ FAIL"}`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect().then(() => process.exit(0)));
