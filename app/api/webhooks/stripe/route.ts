import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const event = body?.event;
    const transaction = body?.data?.transaction;

    if (!event || !transaction) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    if (event === "transaction.updated" && transaction.status === "APPROVED") {
      const reference = transaction.reference;
      if (reference) {
        await prisma.order.update({
          where: { orderNumber: reference },
          data: { status: "pagado" },
        });
      }
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error("Webhook error:", error);
    return NextResponse.json({ error: "Webhook error" }, { status: 500 });
  }
}
