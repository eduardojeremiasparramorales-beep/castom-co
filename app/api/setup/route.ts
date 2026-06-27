import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

const SQL = [
  'CREATE TABLE IF NOT EXISTS "User" ("id" TEXT PRIMARY KEY, "name" TEXT, "email" TEXT NOT NULL UNIQUE, "emailVerified" TIMESTAMP, "image" TEXT, "password" TEXT, "role" TEXT NOT NULL DEFAULT \'customer\', "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP NOT NULL)',
  'CREATE TABLE IF NOT EXISTS "Account" ("id" TEXT PRIMARY KEY, "userId" TEXT NOT NULL REFERENCES "User"(id) ON DELETE CASCADE, "type" TEXT NOT NULL, "provider" TEXT NOT NULL, "providerAccountId" TEXT NOT NULL, "refresh_token" TEXT, "access_token" TEXT, "expires_at" INTEGER, "token_type" TEXT, "scope" TEXT, "id_token" TEXT, "session_state" TEXT, UNIQUE("provider", "providerAccountId"))',
  'CREATE TABLE IF NOT EXISTS "Session" ("id" TEXT PRIMARY KEY, "sessionToken" TEXT NOT NULL UNIQUE, "userId" TEXT NOT NULL REFERENCES "User"(id) ON DELETE CASCADE, "expires" TIMESTAMP NOT NULL)',
  'CREATE TABLE IF NOT EXISTS "VerificationToken" ("identifier" TEXT NOT NULL, "token" TEXT NOT NULL UNIQUE, "expires" TIMESTAMP NOT NULL, UNIQUE("identifier", "token"))',
  'CREATE TABLE IF NOT EXISTS "Category" ("id" TEXT PRIMARY KEY, "name" TEXT NOT NULL UNIQUE, "slug" TEXT NOT NULL UNIQUE, "description" TEXT, "imageUrl" TEXT, "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP NOT NULL)',
  'CREATE TABLE IF NOT EXISTS "Product" ("id" TEXT PRIMARY KEY, "name" TEXT NOT NULL, "slug" TEXT NOT NULL UNIQUE, "description" TEXT, "price" REAL NOT NULL, "wholesalePrice" REAL, "wholesaleMinQty" INTEGER NOT NULL DEFAULT 6, "sku" TEXT NOT NULL UNIQUE, "stock" INTEGER NOT NULL DEFAULT 0, "featured" BOOLEAN NOT NULL DEFAULT false, "active" BOOLEAN NOT NULL DEFAULT true, "categoryId" TEXT NOT NULL REFERENCES "Category"(id), "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP NOT NULL)',
  'CREATE INDEX IF NOT EXISTS "Product_categoryId_idx" ON "Product"("categoryId")',
  'CREATE INDEX IF NOT EXISTS "Product_slug_idx" ON "Product"("slug")',
  'CREATE TABLE IF NOT EXISTS "ProductImage" ("id" TEXT PRIMARY KEY, "url" TEXT NOT NULL, "cloudStoragePath" TEXT, "isPublic" BOOLEAN NOT NULL DEFAULT true, "alt" TEXT, "position" INTEGER NOT NULL DEFAULT 0, "productId" TEXT NOT NULL REFERENCES "Product"(id) ON DELETE CASCADE)',
  'CREATE INDEX IF NOT EXISTS "ProductImage_productId_idx" ON "ProductImage"("productId")',
  'CREATE TABLE IF NOT EXISTS "ProductVariant" ("id" TEXT PRIMARY KEY, "name" TEXT NOT NULL, "value" TEXT NOT NULL, "price" REAL, "stock" INTEGER NOT NULL DEFAULT 0, "productId" TEXT NOT NULL REFERENCES "Product"(id) ON DELETE CASCADE)',
  'CREATE INDEX IF NOT EXISTS "ProductVariant_productId_idx" ON "ProductVariant"("productId")',
  'CREATE TABLE IF NOT EXISTS "Order" ("id" TEXT PRIMARY KEY, "orderNumber" TEXT NOT NULL UNIQUE, "status" TEXT NOT NULL DEFAULT \'pendiente\', "total" REAL NOT NULL, "subtotal" REAL NOT NULL, "discount" REAL NOT NULL DEFAULT 0, "customerName" TEXT NOT NULL, "customerEmail" TEXT NOT NULL, "customerPhone" TEXT, "shippingAddress" TEXT, "city" TEXT, "department" TEXT, "notes" TEXT, "stripeSessionId" TEXT UNIQUE, "userId" TEXT REFERENCES "User"(id), "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP NOT NULL)',
  'CREATE INDEX IF NOT EXISTS "Order_userId_idx" ON "Order"("userId")',
  'CREATE INDEX IF NOT EXISTS "Order_status_idx" ON "Order"("status")',
  'CREATE TABLE IF NOT EXISTS "OrderItem" ("id" TEXT PRIMARY KEY, "quantity" INTEGER NOT NULL, "unitPrice" REAL NOT NULL, "totalPrice" REAL NOT NULL, "productName" TEXT NOT NULL, "variantName" TEXT, "orderId" TEXT NOT NULL REFERENCES "Order"(id) ON DELETE CASCADE, "productId" TEXT REFERENCES "Product"(id) ON DELETE SET NULL)',
  'CREATE INDEX IF NOT EXISTS "OrderItem_orderId_idx" ON "OrderItem"("orderId")',
  'CREATE TABLE IF NOT EXISTS "ContactSubmission" ("id" TEXT PRIMARY KEY, "name" TEXT NOT NULL, "email" TEXT NOT NULL, "subject" TEXT, "message" TEXT NOT NULL, "status" TEXT NOT NULL DEFAULT \'nuevo\', "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP)',
];

export async function GET() {
  const results: string[] = [];
  for (const sql of SQL) {
    try {
      await prisma.$executeRawUnsafe(sql);
      results.push("OK");
    } catch (e: any) {
      results.push("ERROR: " + e.message);
    }
  }
  return NextResponse.json({ message: "Setup complete", results });
}
