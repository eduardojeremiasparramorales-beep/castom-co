export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { getFileUrl } from "@/lib/s3";

export async function POST(request: NextRequest) {
  try {
    const { cloud_storage_path, contentType, isPublic } = await request.json();
    const url = await getFileUrl(cloud_storage_path, contentType ?? "image/jpeg", isPublic ?? true);
    return NextResponse.json({ url });
  } catch (error: any) {
    console.error("Get URL error:", error);
    return NextResponse.json({ error: "Error" }, { status: 500 });
  }
}
