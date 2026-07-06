export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { prisma } from "@/lib/db";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Debes iniciar sesión" }, { status: 401 });
    }

    const body = await request.json();
    const { companyName, companyNIT, companyPhone, ciudad, departamento } = body ?? {};

    if (!companyName || !companyNIT || !ciudad || !departamento) {
      return NextResponse.json({ error: "Completa todos los campos" }, { status: 400 });
    }

    const userId = (session.user as any).id;

    const existing = await prisma.wholesaleRequest.findFirst({
      where: { userId, status: "pending" },
    });
    if (existing) {
      return NextResponse.json({ error: "Ya tienes una solicitud pendiente" }, { status: 400 });
    }

    await prisma.wholesaleRequest.create({
      data: {
        userId,
        companyName,
        companyNIT,
        companyPhone: companyPhone ?? null,
        city: ciudad,
        department: departamento,
      },
    });

    await prisma.user.update({
      where: { id: userId },
      data: {
        wholesaleStatus: "pending",
        companyName,
        companyNIT,
        city: ciudad,
        department: departamento,
      },
    });

    return NextResponse.json({ success: true, message: "Solicitud enviada. Te contactaremos pronto." });
  } catch (error: any) {
    console.error("Wholesale request error:", error);
    return NextResponse.json({ error: "Error al enviar solicitud" }, { status: 500 });
  }
}
