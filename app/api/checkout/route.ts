export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { items, customerInfo } = body ?? {};
    const origin = request.headers.get("origin") ?? "";

    if (!items?.length || !customerInfo?.name || !customerInfo?.email) {
      return NextResponse.json({ error: "Datos incompletos" }, { status: 400 });
    }

    const session = await getServerSession(authOptions);
    const userId = (session?.user as any)?.id ?? null;

    // Calculate totals
    let subtotal = 0;
    let total = 0;
    const lineItems: any[] = [];

    for (const item of items) {
      const regularPrice = (item?.price ?? 0) * (item?.quantity ?? 1);
      subtotal += regularPrice;

      let unitPrice = item?.price ?? 0;
      if (item?.wholesalePrice && (item?.quantity ?? 0) >= (item?.wholesaleMinQty ?? 6)) {
        unitPrice = item.wholesalePrice;
      }
      total += unitPrice * (item?.quantity ?? 1);

      lineItems.push({
        price_data: {
          currency: "cop",
          product_data: {
            name: `${item?.name ?? "Producto"}${item?.variantName ? ` - ${item.variantName}` : ""}`,
          },
          unit_amount: Math.round(unitPrice * 100),
        },
        quantity: item?.quantity ?? 1,
      });
    }

    const orderNumber = `CST-${Date.now().toString(36).toUpperCase()}`;

    // Create order in DB
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

    // Create Stripe session
    if (!stripe) {
      return NextResponse.json({ error: "Pasarela de pago no configurada" }, { status: 500 });
    }
    const stripeSession = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: lineItems,
      mode: "payment",
      success_url: `${origin}/pedido/confirmacion?order=${order.orderNumber}`,
      cancel_url: `${origin}/carrito`,
      customer_email: customerInfo.email,
      metadata: {
        orderId: order.id,
        orderNumber: order.orderNumber,
      },
    });

    await prisma.order.update({
      where: { id: order.id },
      data: { stripeSessionId: stripeSession.id },
    });

    return NextResponse.json({ url: stripeSession.url, orderNumber: order.orderNumber });
  } catch (error: any) {
    console.error("Checkout error:", error);
    return NextResponse.json({ error: "Error al procesar el pago" }, { status: 500 });
  }
}
