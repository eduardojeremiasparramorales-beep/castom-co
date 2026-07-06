export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { prisma } from "@/lib/db";

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any)?.role !== "admin") {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { name, description, price, wholesalePrice, wholesaleMinQty, stock, featured, active, images } = body ?? {};

    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (price !== undefined) updateData.price = parseFloat(price);
    if (wholesalePrice !== undefined) updateData.wholesalePrice = wholesalePrice ? parseFloat(wholesalePrice) : null;
    if (wholesaleMinQty !== undefined) updateData.wholesaleMinQty = wholesaleMinQty;
    if (stock !== undefined) updateData.stock = parseInt(stock);
    if (featured !== undefined) updateData.featured = featured;
    if (active !== undefined) updateData.active = active;

    const product = await prisma.product.update({
      where: { id: params.id },
      data: updateData,
      include: { images: true, category: true, variants: true, priceTiers: true },
    });

    // Handle images update if provided
    if (images && Array.isArray(images)) {
      await prisma.productImage.deleteMany({ where: { productId: params.id } });
      for (let i = 0; i < images.length; i++) {
        await prisma.productImage.create({
          data: {
            url: images[i].url,
            cloudStoragePath: images[i].cloudStoragePath ?? null,
            isPublic: images[i].isPublic ?? true,
            alt: images[i].alt ?? product.name,
            position: i,
            productId: params.id,
          },
        });
      }
    }

    const updated = await prisma.product.findUnique({
      where: { id: params.id },
      include: { images: true, category: true, variants: true, priceTiers: true },
    });

    return NextResponse.json(updated);
  } catch (error: any) {
    console.error("Update product error:", error);
    return NextResponse.json({ error: "Error al actualizar" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any)?.role !== "admin") {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  try {
    await prisma.product.update({
      where: { id: params.id },
      data: { active: false },
    });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Delete product error:", error);
    return NextResponse.json({ error: "Error al eliminar" }, { status: 500 });
  }
}
