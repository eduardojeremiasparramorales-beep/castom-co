export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { items, customerInfo } = body ?? {};
    const origin = request.headers.get("origin") ?? "https://castom.co";

    if (!items?.length || !customerInfo?.name || !customerInfo?.email) {
      return NextResponse.json({ error: "Datos incompletos" }, { status: 400 });
    }

    const session = await getServerSession(authOptions);
    const userId = (session?.user as any)?.id ?? null;

    let subtotal = 0;
    let total = 0;

    for (const item of items) {
      const regularPrice = (item?.price ?? 0) * (item?.quantity ?? 1);
      subtotal += regularPrice;
      let unitPrice = item?.price ?? 0;
      if (item?.wholesalePrice && (item?.quantity ?? 0) >= (item?.wholesaleMinQty ?? 6)) {
        unitPrice = item.wholesalePrice;
      }
      total += unitPrice * (item?.quantity ?? 1);
    }

    const orderNumber = `CST-${Date.now().toString(36).toUpperCase()}`;

    const order = await prisma.order.create({
      data: {
        orderNumber,
        status: "pendiente",
        subtotal,
        total,
        discount: subtotal - total,
        customerName: customerInfo.name,
        customerEmail: customerInfo.email,
        customerPhone: customerInfo.phone ?? null,
        shippingAddress: customerInfo.address ?? null,
        city: customerInfo.city ?? null,
        department: customerInfo.department ?? null,
        notes: customerInfo.notes ?? null,
        userId,
        items: {
          create: items.map((item: any) => {
            let unitPrice = item?.price ?? 0;
            if (item?.wholesalePrice && (item?.quantity ?? 0) >= (item?.wholesaleMinQty ?? 6)) {
              unitPrice = item.wholesalePrice;
            }
            return {
              quantity: item?.quantity ?? 1,
              unitPrice,
              totalPrice: unitPrice * (item?.quantity ?? 1),
              productName: item?.name ?? "Producto",
              variantName: item?.variantName ?? null,
              productId: item?.productId ?? null,
            };
          }),
        },
      },
    });

    return NextResponse.json({
      url: `${origin}/pedido/confirmacion?order=${orderNumber}&total=${Math.round(total)}`,
      orderNumber,
      total,
    });
  } catch (error: any) {
    console.error("Checkout error:", error);
    return NextResponse.json({ error: "Error al procesar el pedido" }, { status: 500 });
  }
}
