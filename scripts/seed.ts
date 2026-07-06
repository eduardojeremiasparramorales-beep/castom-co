import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Create admin user
  const hashedPassword = await bcrypt.hash('castom.co', 10);
  await prisma.user.upsert({
    where: { email: 'admin@castom.co' },
    update: {},
    create: {
      email: 'admin@castom.co',
      name: 'Omar',
      password: hashedPassword,
      role: 'admin',
      wholesaleStatus: 'approved',
    },
  });

  // Demo customer user
  const demoPassword = await bcrypt.hash('johndoe123', 10);
  await prisma.user.upsert({
    where: { email: 'john@doe.com' },
    update: {},
    create: {
      email: 'john@doe.com',
      name: 'Demo Cliente',
      password: demoPassword,
      role: 'customer',
      wholesaleStatus: 'approved',
      companyName: 'Demo Company SAS',
      companyNIT: '900.123.456-7',
      city: 'Acacías',
      department: 'Meta',
    },
  });

  // Create categories
  const categories = [
    { name: 'Tecnología', slug: 'tecnologia', description: 'Lo último en tecnología y gadgets' },
    { name: 'Ropa', slug: 'ropa', description: 'Moda y estilo para todos' },
    { name: 'Accesorios', slug: 'accesorios', description: 'Complementa tu estilo' },
    { name: 'Hogar', slug: 'hogar', description: 'Todo para tu hogar' },
  ];

  for (const cat of categories) {
    await prisma.category.upsert({
      where: { slug: cat.slug },
      update: {},
      create: cat,
    });
  }

  const techCategory = await prisma.category.findUnique({ where: { slug: 'tecnologia' } });
  const ropaCategory = await prisma.category.findUnique({ where: { slug: 'ropa' } });
  const accCategory = await prisma.category.findUnique({ where: { slug: 'accesorios' } });

  if (!techCategory || !ropaCategory || !accCategory) {
    throw new Error('Categories not found');
  }

  // Products
  const products = [
    {
      name: 'AirPods Pro (2ª Gen)',
      slug: 'airpods-pro-2gen',
      description: 'Cancelación activa de ruido. Sonido adaptativo. Resistentes al sudor y al agua. Carga Lightning.',
      price: 899000,
      wholesalePrice: 749000,
      wholesaleMinQty: 6,
      sku: 'CASTOM-AP-PRO2',
      stock: 50,
      featured: true,
      categoryId: techCategory.id,
    },
    {
      name: 'AirPods (3ª Gen)',
      slug: 'airpods-3gen',
      description: 'Audio espacial con seguimiento dinámico de la cabeza. Ecualización adaptativa. Sonido que te rodea.',
      price: 749000,
      wholesalePrice: 619000,
      wholesaleMinQty: 6,
      sku: 'CASTOM-AP-3G',
      stock: 80,
      featured: true,
      categoryId: techCategory.id,
    },
    {
      name: 'AirPods (4ª Gen)',
      slug: 'airpods-4gen',
      description: 'Nueva generación. Misma esencia. Estuche compacto con carga USB-C. Diseño ergonómico rediseñado.',
      price: 649000,
      wholesalePrice: 539000,
      wholesaleMinQty: 6,
      sku: 'CASTOM-AP-4G',
      stock: 100,
      featured: true,
      categoryId: techCategory.id,
    },
    {
      name: 'Cargador Inalámbrico MagSafe',
      slug: 'cargador-magsafe',
      description: 'Carga rápida y segura para tu iPhone. Alineación magnética perfecta.',
      price: 189000,
      wholesalePrice: 149000,
      wholesaleMinQty: 6,
      sku: 'CASTOM-CHG-MS',
      stock: 120,
      featured: false,
      categoryId: techCategory.id,
    },
    {
      name: 'Camiseta CASTOM Oversize',
      slug: 'camiseta-castom-oversize',
      description: 'Camiseta premium oversize con logo CASTOM bordado. 100% algodón peinado.',
      price: 129000,
      wholesalePrice: 89000,
      wholesaleMinQty: 6,
      sku: 'CASTOM-TEE-OV',
      stock: 200,
      featured: true,
      categoryId: ropaCategory.id,
    },
    {
      name: 'Hoodie CASTOM Premium',
      slug: 'hoodie-castom-premium',
      description: 'Hoodie premium con capucha ajustable. Diseño urbano CASTOM. Material suave y resistente.',
      price: 219000,
      wholesalePrice: 169000,
      wholesaleMinQty: 6,
      sku: 'CASTOM-HOOD-PR',
      stock: 150,
      featured: false,
      categoryId: ropaCategory.id,
    },
    {
      name: 'Case iPhone CASTOM',
      slug: 'case-iphone-castom',
      description: 'Protección premium con diseño exclusivo CASTOM. Compatible con MagSafe.',
      price: 89000,
      wholesalePrice: 59000,
      wholesaleMinQty: 6,
      sku: 'CASTOM-CASE-IP',
      stock: 300,
      featured: false,
      categoryId: accCategory.id,
    },
    {
      name: 'Gorra CASTOM Snapback',
      slug: 'gorra-castom-snapback',
      description: 'Gorra snapback con logo del castor CASTOM bordado. Ajuste universal.',
      price: 79000,
      wholesalePrice: 55000,
      wholesaleMinQty: 6,
      sku: 'CASTOM-CAP-SN',
      stock: 250,
      featured: true,
      categoryId: accCategory.id,
    },
  ];

  for (const product of products) {
    await prisma.product.upsert({
      where: { slug: product.slug },
      update: {},
      create: product,
    });
  }

  // Add product images
  const productImageMap: Record<string, string> = {
    'airpods-pro-2gen': '/images/products/airpods-pro-2gen.jpg',
    'airpods-3gen': '/images/products/airpods-3gen.jpg',
    'airpods-4gen': '/images/products/airpods-4gen.jpg',
    'cargador-magsafe': '/images/products/cargador-magsafe.jpg',
    'camiseta-castom-oversize': '/images/products/camiseta-oversize.jpg',
    'hoodie-castom-premium': '/images/products/hoodie-premium.jpg',
    'case-iphone-castom': '/images/products/case-iphone.jpg',
    'gorra-castom-snapback': '/images/products/gorra-snapback.jpg',
  };

  for (const [slug, imageUrl] of Object.entries(productImageMap)) {
    const prod = await prisma.product.findUnique({ where: { slug } });
    if (prod) {
      const existingImage = await prisma.productImage.findFirst({
        where: { productId: prod.id },
      });
      if (!existingImage) {
        await prisma.productImage.create({
          data: {
            url: imageUrl,
            alt: prod.name,
            position: 0,
            isPublic: true,
            productId: prod.id,
          },
        });
      }
    }
  }

  // Add price tiers to select products
  const airpodsPro = await prisma.product.findUnique({ where: { slug: 'airpods-pro-2gen' } });
  if (airpodsPro) {
    const existingTiers = await prisma.priceTier.count({ where: { productId: airpodsPro.id } });
    if (existingTiers === 0) {
      await prisma.priceTier.createMany({
        data: [
          { productId: airpodsPro.id, minQty: 1, maxQty: 5, price: 899000 },
          { productId: airpodsPro.id, minQty: 6, maxQty: 11, price: 749000 },
          { productId: airpodsPro.id, minQty: 12, maxQty: 23, price: 699000 },
          { productId: airpodsPro.id, minQty: 24, maxQty: null, price: 649000 },
        ],
      });
    }
  }

  const hoodie = await prisma.product.findUnique({ where: { slug: 'hoodie-castom-premium' } });
  if (hoodie) {
    const existingTiers = await prisma.priceTier.count({ where: { productId: hoodie.id } });
    if (existingTiers === 0) {
      await prisma.priceTier.createMany({
        data: [
          { productId: hoodie.id, minQty: 1, maxQty: 5, price: 219000 },
          { productId: hoodie.id, minQty: 6, maxQty: 11, price: 169000 },
          { productId: hoodie.id, minQty: 12, maxQty: null, price: 149000 },
        ],
      });
    }
  }

  const tee = await prisma.product.findUnique({ where: { slug: 'camiseta-castom-oversize' } });
  if (tee) {
    const existingTiers = await prisma.priceTier.count({ where: { productId: tee.id } });
    if (existingTiers === 0) {
      await prisma.priceTier.createMany({
        data: [
          { productId: tee.id, minQty: 1, maxQty: 5, price: 129000 },
          { productId: tee.id, minQty: 6, maxQty: 11, price: 89000 },
          { productId: tee.id, minQty: 12, maxQty: null, price: 79000 },
        ],
      });
    }
  }

  console.log('Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
