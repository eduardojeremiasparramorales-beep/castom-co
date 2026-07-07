export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { prisma } from "@/lib/db";

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  const role = (session?.user as any)?.role;
  if (!session || (role !== "admin" && role !== "seller")) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { status, notes, paymentStatus } = body ?? {};

    const updateData: any = {};
    if (status) updateData.status = status;
    if (notes !== undefined) updateData.notes = notes;
    if (paymentStatus !== undefined) updateData.paymentStatus = paymentStatus;

    const order = await prisma.order.update({
      where: { id: params.id },
      data: updateData,
    });

    return NextResponse.json(order);
  } catch (error: any) {
    console.error("Update order error:", error);
    return NextResponse.json({ error: "Error al actualizar pedido" }, { status: 500 });
  }
}
