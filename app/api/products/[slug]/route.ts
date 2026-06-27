export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const product = await prisma.product.findUnique({
      where: { slug: params.slug },
      include: {
        images: { orderBy: { position: "asc" } },
        category: true,
        variants: true,
      },
    });

    if (!product) {
      return NextResponse.json({ error: "Producto no encontrado" }, { status: 404 });
    }

    return NextResponse.json(product);
  } catch (error: any) {
    console.error("Product fetch error:", error);
    return NextResponse.json({ error: "Error al obtener producto" }, { status: 500 });
  }
}
