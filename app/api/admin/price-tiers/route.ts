export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { prisma } from "@/lib/db";

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any)?.role !== "admin") {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const productId = searchParams.get("productId");

  const where = productId ? { productId } : {};
  const tiers = await prisma.priceTier.findMany({
    where,
    orderBy: [{ productId: "asc" }, { minQty: "asc" }],
  });

  return NextResponse.json(tiers);
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any)?.role !== "admin") {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { productId, tiers } = body ?? {};

    if (!productId || !Array.isArray(tiers)) {
      return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });
    }

    await prisma.priceTier.deleteMany({ where: { productId } });

    if (tiers.length > 0) {
      await prisma.priceTier.createMany({
        data: tiers.map((t: any) => ({
          productId,
          minQty: t.minQty,
          maxQty: t.maxQty ?? null,
          price: parseFloat(t.price),
          membershipLevel: t.membershipLevel ?? null,
        })),
      });
    }

    const updated = await prisma.priceTier.findMany({
      where: { productId },
      orderBy: { minQty: "asc" },
    });

    return NextResponse.json(updated);
  } catch (error: any) {
    console.error("Price tiers error:", error);
    return NextResponse.json({ error: "Error al guardar niveles de precio" }, { status: 500 });
  }
}
