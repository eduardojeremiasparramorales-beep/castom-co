import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import bcrypt from "bcryptjs";

export async function GET() {
  try {
    const results: string[] = [];

    const hashedPassword = await bcrypt.hash("johndoe123", 10);
    await prisma.user.upsert({
      where: { email: "john@doe.com" },
      update: {},
      create: { email: "john@doe.com", name: "Admin", password: hashedPassword, role: "admin" },
    });
    results.push("Admin user created");

    const categories = [
      { name: "Tecnologia", slug: "tecnologia", description: "Lo ultimo en tecnologia y gadgets" },
      { name: "Ropa", slug: "ropa", description: "Moda y estilo para todos" },
      { name: "Accesorios", slug: "accesorios", description: "Complementa tu estilo" },
      { name: "Hogar", slug: "hogar", description: "Todo para tu hogar" },
    ];
    for (const cat of categories) {
      await prisma.category.upsert({ where: { slug: cat.slug }, update: {}, create: cat });
    }
    results.push("Categories created");

    const tech = await prisma.category.findUnique({ where: { slug: "tecnologia" } });
    const ropa = await prisma.category.findUnique({ where: { slug: "ropa" } });
    const acc = await prisma.category.findUnique({ where: { slug: "accesorios" } });

    const products = [
      { name: "AirPods Pro (2a Gen)", slug: "airpods-pro-2gen", description: "Cancelacion activa de ruido. Sonido adaptativo.", price: 899000, wholesalePrice: 749000, sku: "CASTOM-AP-PRO2", stock: 50, featured: true, categoryId: tech!.id },
      { name: "AirPods (3a Gen)", slug: "airpods-3gen", description: "Audio espacial con seguimiento dinamico.", price: 749000, wholesalePrice: 619000, sku: "CASTOM-AP-3G", stock: 80, featured: true, categoryId: tech!.id },
      { name: "AirPods (4a Gen)", slug: "airpods-4gen", description: "Nueva generacion. Estuche compacto USB-C.", price: 649000, wholesalePrice: 539000, sku: "CASTOM-AP-4G", stock: 100, featured: true, categoryId: tech!.id },
      { name: "Cargador Inalambrico MagSafe", slug: "cargador-magsafe", description: "Carga rapida y segura para tu iPhone.", price: 189000, wholesalePrice: 149000, sku: "CASTOM-CHG-MS", stock: 120, featured: false, categoryId: tech!.id },
      { name: "Camiseta CASTOM Oversize", slug: "camiseta-castom-oversize", description: "Camiseta premium oversize con logo bordado.", price: 129000, wholesalePrice: 89000, sku: "CASTOM-TEE-OV", stock: 200, featured: true, categoryId: ropa!.id },
      { name: "Hoodie CASTOM Premium", slug: "hoodie-castom-premium", description: "Hoodie premium con capucha ajustable.", price: 219000, wholesalePrice: 169000, sku: "CASTOM-HOOD-PR", stock: 150, featured: false, categoryId: ropa!.id },
      { name: "Case iPhone CASTOM", slug: "case-iphone-castom", description: "Proteccion premium compatible con MagSafe.", price: 89000, wholesalePrice: 59000, sku: "CASTOM-CASE-IP", stock: 300, featured: false, categoryId: acc!.id },
      { name: "Gorra CASTOM Snapback", slug: "gorra-castom-snapback", description: "Gorra snapback con logo del castor bordado.", price: 79000, wholesalePrice: 55000, sku: "CASTOM-CAP-SN", stock: 250, featured: true, categoryId: acc!.id },
    ];
    for (const p of products) {
      await prisma.product.upsert({ where: { slug: p.slug }, update: {}, create: p });
    }
    results.push("Products created");

    const images = [
      { slug: "airpods-pro-2gen", url: "/images/products/airpods-pro-2gen.jpg" },
      { slug: "airpods-3gen", url: "/images/products/airpods-3gen.jpg" },
      { slug: "airpods-4gen", url: "/images/products/airpods-4gen.jpg" },
      { slug: "cargador-magsafe", url: "/images/products/cargador-magsafe.jpg" },
      { slug: "camiseta-castom-oversize", url: "/images/products/camiseta-oversize.jpg" },
      { slug: "hoodie-castom-premium", url: "/images/products/hoodie-premium.jpg" },
      { slug: "case-iphone-castom", url: "/images/products/case-iphone.jpg" },
      { slug: "gorra-castom-snapback", url: "/images/products/gorra-snapback.jpg" },
    ];
    for (const img of images) {
      const product = await prisma.product.findUnique({ where: { slug: img.slug } });
      if (product) {
        const existing = await prisma.productImage.findFirst({ where: { productId: product.id } });
        if (!existing) {
          await prisma.productImage.create({ data: { url: img.url, alt: product.name, position: 0, isPublic: true, productId: product.id } });
        }
      }
    }
    results.push("Product images created");

    return NextResponse.json({ message: "Seed complete", results });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
