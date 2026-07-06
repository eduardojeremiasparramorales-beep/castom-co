export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import bcrypt from "bcryptjs";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, name, companyName, companyNIT, city, department, wantWholesale } = body ?? {};

    if (!email || !password) {
      return NextResponse.json({ error: "Email y contraseña son requeridos" }, { status: 400 });
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ error: "El email ya está registrado" }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const wholesaleStatus = wantWholesale ? "pending" : "none";

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name: name ?? "",
        role: "customer",
        wholesaleStatus,
        companyName: companyName ?? null,
        companyNIT: companyNIT ?? null,
        city: city ?? null,
        department: department ?? null,
      },
    });

    if (wantWholesale && companyName && companyNIT && city && department) {
      await prisma.wholesaleRequest.create({
        data: {
          userId: user.id,
          companyName,
          companyNIT,
          companyPhone: null,
          city,
          department,
        },
      });
    }

    return NextResponse.json({
      id: user.id,
      email: user.email,
      name: user.name,
      wholesaleStatus: user.wholesaleStatus,
    });
  } catch (error: any) {
    console.error("Signup error:", error);
    return NextResponse.json({ error: "Error al crear la cuenta" }, { status: 500 });
  }
}
