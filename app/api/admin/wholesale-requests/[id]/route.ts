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
    const { status, notes } = body ?? {};

    if (!status || !["approved", "rejected"].includes(status)) {
      return NextResponse.json({ error: "Estado inválido" }, { status: 400 });
    }

    const wholesaleRequest = await prisma.wholesaleRequest.findUnique({
      where: { id: params.id },
    });
    if (!wholesaleRequest) {
      return NextResponse.json({ error: "Solicitud no encontrada" }, { status: 404 });
    }

    await prisma.wholesaleRequest.update({
      where: { id: params.id },
      data: { status, notes: notes ?? null },
    });

    const userStatus = status === "approved" ? "approved" : "rejected";
    await prisma.user.update({
      where: { id: wholesaleRequest.userId },
      data: { wholesaleStatus: userStatus },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Update wholesale request error:", error);
    return NextResponse.json({ error: "Error al actualizar" }, { status: 500 });
  }
}
