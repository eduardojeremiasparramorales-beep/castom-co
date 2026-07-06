import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import bcrypt from "bcryptjs";

export async function GET() {
  const results: Record<string, unknown> = {};

  try {
    results.step1 = "Conectando a DB...";
    const user = await prisma.user.findUnique({
      where: { email: "admin@castom.co" },
    });
    results.step2 = user ? "Usuario encontrado" : "Usuario NO encontrado";
    results.userEmail = user?.email || null;
    results.hasPassword = !!user?.password;
    results.role = user?.role || null;

    if (user?.password) {
      results.step3 = "Comparando password...";
      const isValid = await bcrypt.compare("castom.co", user.password);
      results.passwordValid = isValid;
      results.step4 = isValid ? "Password OK" : "Password INVALIDO";
    } else {
      results.step3 = "Saltando bcrypt (sin password)";
    }
  } catch (error) {
    results.error = String(error);
    results.errorMessage = error instanceof Error ? error.message : "Error desconocido";
    results.errorStack = error instanceof Error ? error.stack?.split("\n").slice(0, 3).join("\n") : "";
  }

  return NextResponse.json(results);
}
