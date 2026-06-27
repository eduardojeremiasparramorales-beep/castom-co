export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { generatePresignedUploadUrl } from "@/lib/s3";

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any)?.role !== "admin") {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  try {
    const { fileName, contentType, isPublic } = await request.json();
    const result = await generatePresignedUploadUrl(fileName, contentType, isPublic ?? true);
    return NextResponse.json(result);
  } catch (error: any) {
    console.error("Presigned URL error:", error);
    return NextResponse.json({ error: "Error al generar URL" }, { status: 500 });
  }
}
