export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const featured = searchParams.get("featured");
    const search = searchParams.get("search");
    const limit = parseInt(searchParams.get("limit") ?? "50");

    const where: any = { active: true };
    if (category) where.category = { slug: category };
    if (featured === "true") where.featured = true;
    if (search) where.name = { contains: search, mode: "insensitive" };

    const products = await prisma.product.findMany({
      where,
      include: {
        images: { orderBy: { position: "asc" } },
        category: true,
        variants: true,
        priceTiers: { orderBy: { minQty: "asc" } },
      },
      orderBy: { createdAt: "desc" },
      take: limit,
    });

    return NextResponse.json(products);
  } catch (error: any) {
    console.error("Products fetch error:", error);
    return NextResponse.json({ error: "Error al obtener productos" }, { status: 500 });
  }
}
