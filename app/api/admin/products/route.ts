export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { prisma } from "@/lib/db";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any)?.role !== "admin") {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const products = await prisma.product.findMany({
    include: { images: { orderBy: { position: "asc" } }, category: true, variants: true },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(products);
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any)?.role !== "admin") {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { name, description, price, wholesalePrice, wholesaleMinQty, sku, stock, categoryId, featured, images, variants } = body ?? {};

    if (!name || !price || !sku || !categoryId) {
      return NextResponse.json({ error: "Campos requeridos faltantes" }, { status: 400 });
    }

    const slug = (name as string)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

    const product = await prisma.product.create({
      data: {
        name,
        slug: `${slug}-${Date.now().toString(36)}`,
        description: description ?? null,
        price: parseFloat(price),
        wholesalePrice: wholesalePrice ? parseFloat(wholesalePrice) : null,
        wholesaleMinQty: wholesaleMinQty ?? 6,
        sku,
        stock: stock ?? 0,
        featured: featured ?? false,
        categoryId,
        images: {
          create: (images ?? []).map((img: any, i: number) => ({
            url: img.url,
            cloudStoragePath: img.cloudStoragePath ?? null,
            isPublic: img.isPublic ?? true,
            alt: img.alt ?? name,
            position: i,
          })),
        },
        variants: {
          create: (variants ?? []).map((v: any) => ({
            name: v.name,
            value: v.value,
            price: v.price ? parseFloat(v.price) : null,
            stock: v.stock ?? 0,
          })),
        },
      },
      include: { images: true, category: true, variants: true },
    });

    return NextResponse.json(product);
  } catch (error: any) {
    console.error("Create product error:", error);
    return NextResponse.json({ error: "Error al crear producto" }, { status: 500 });
  }
}
