import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import bcrypt from "bcryptjs";

export async function GET() {
  const results: Record<string, unknown> = {};

  const dbUrl = process.env.DATABASE_URL || "";
  results.dbHost = dbUrl ? dbUrl.replace(/\/\/[^:]+:[^@]+@/, "//user:pass@").replace(/\?.*/, "") : "NOT SET";
  results.hasDbUrl = !!process.env.DATABASE_URL;

  try {
    results.step1 = "Listando columnas de User...";
    const columns: Array<{ column_name: string }> = await prisma.$queryRawUnsafe(
      "SELECT column_name FROM information_schema.columns WHERE table_name = 'User' ORDER BY ordinal_position"
    );
    results.columns = columns.map((c) => c.column_name);

    results.step2 = "Buscando admin@castom.co...";
    const user = await prisma.user.findUnique({
      where: { email: "admin@castom.co" },
    });
    results.step3 = user ? "Usuario encontrado" : "Usuario NO encontrado";
    results.userEmail = user?.email || null;
    results.hasPassword = !!user?.password;
    results.role = user?.role || null;

    if (user?.password) {
      results.step4 = "Comparando password...";
      const isValid = await bcrypt.compare("castom.co", user.password);
      results.passwordValid = isValid;
      results.step5 = isValid ? "Password OK" : "Password INVALIDO";
    } else {
      results.step4 = "Saltando bcrypt (sin password)";
    }
  } catch (error) {
    results.error = String(error);
    results.errorMessage = error instanceof Error ? error.message : "Error desconocido";
    results.errorStack = error instanceof Error ? error.stack?.split("\n").slice(0, 3).join("\n") : "";
  }

  return NextResponse.json(results);
}
