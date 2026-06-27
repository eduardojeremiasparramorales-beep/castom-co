import { NextRequest, NextResponse } from "next/server";
import { createWompiTransaction } from "@/lib/wompi";
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

    const wompiTx = await createWompiTransaction({
      amountInCents: Math.round(total),
      currency: "COP",
      customerEmail: customerInfo.email,
      reference: orderNumber,
      redirectUrl: `${origin}/pedido/confirmacion?order=${orderNumber}`,
    });

    if (!wompiTx) {
      return NextResponse.json({ error: "Pasarela de pago no disponible" }, { status: 500 });
    }

    await prisma.order.update({
      where: { id: order.id },
      data: { stripeSessionId: wompiTx.id },
    });

    return NextResponse.json({ url: wompiTx?.redirect_url ?? wompiTx?.url });
  } catch (error: any) {
    console.error("Checkout error:", error);
    return NextResponse.json({ error: "Error al procesar el pago" }, { status: 500 });
  }
}
