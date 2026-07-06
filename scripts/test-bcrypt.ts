import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
const prisma = new PrismaClient();
async function main() {
  const user = await prisma.user.findUnique({ where: { email: 'john@doe.com' } });
  if (!user) { console.log('USER NOT FOUND'); return; }
  console.log('Found user:', user.email, 'role:', user.role);
  const valid = await bcrypt.compare('johndoe123', user.password!);
  console.log('Password valid:', valid);
  await prisma.$disconnect();
}
main().catch(e => { console.error(e.message); prisma.$disconnect(); });
