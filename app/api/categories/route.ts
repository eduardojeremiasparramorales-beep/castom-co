export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      include: { _count: { select: { products: true } } },
      orderBy: { name: "asc" },
    });
    return NextResponse.json(categories);
  } catch (error: any) {
    console.error("Categories fetch error:", error);
    return NextResponse.json({ error: "Error" }, { status: 500 });
  }
}
