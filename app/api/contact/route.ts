export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, subject, message } = body ?? {};

    if (!name || !email || !message) {
      return NextResponse.json({ error: "Campos requeridos" }, { status: 400 });
    }

    await prisma.contactSubmission.create({
      data: { name, email, subject: subject ?? null, message },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Contact error:", error);
    return NextResponse.json({ error: "Error" }, { status: 500 });
  }
}
