"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ShoppingCart, Minus, Plus, Tag, ArrowLeft, Check } from "lucide-react";
import { addToCart } from "@/lib/cart";
import { toast } from "sonner";
import { motion } from "framer-motion";

interface Props {
  slug: string;
}

export function ProductDetail({ slug }: Props) {
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [selectedVariant, setSelectedVariant] = useState<any>(null);

  useEffect(() => {
    if (!slug) return;
    fetch(`/api/products/${slug}`)
      .then((r) => r.json())
      .then((data: any) => {
        setProduct(data);
        if (data?.variants?.length > 0) setSelectedVariant(data.variants[0]);
      })
      .catch(() => setProduct(null))
      .finally(() => setLoading(false));
  }, [slug]);

  const formatPrice = (p: number) =>
    new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", minimumFractionDigits: 0 }).format(p ?? 0);

  const currentPrice = selectedVariant?.price ?? product?.price ?? 0;
  const isWholesaleQty = quantity >= (product?.wholesaleMinQty ?? 6);
  const effectivePrice = isWholesaleQty && product?.wholesalePrice ? product.wholesalePrice : currentPrice;

  const handleAddToCart = () => {
    if (!product) return;
    addToCart({
      id: `${product.id}-${selectedVariant?.id ?? "default"}`,
      productId: product.id,
      name: product.name,
      price: currentPrice,
      wholesalePrice: product.wholesalePrice ?? null,
      wholesaleMinQty: product.wholesaleMinQty ?? 6,
      quantity,
      imageUrl: product?.images?.[0]?.url ?? "/images/airpods-lineup.png",
      variantName: selectedVariant?.value ?? null,
    });
    toast.success(`${product.name} agregado al carrito`);
  };

  if (loading) {
    return (
      <div className="max-w-[1200px] mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="aspect-square bg-gray-100 rounded-lg animate-pulse" />
          <div className="space-y-4">
            <div className="h-8 bg-gray-100 rounded w-3/4 animate-pulse" />
            <div className="h-6 bg-gray-100 rounded w-1/4 animate-pulse" />
            <div className="h-20 bg-gray-100 rounded animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-[1200px] mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold" style={{ color: "#1B2B5E" }}>Producto no encontrado</h1>
        <Link href="/tienda" className="mt-4 inline-flex items-center gap-2 text-sm font-semibold" style={{ color: "#1B2B5E" }}>
          <ArrowLeft size={16} /> Volver a la tienda
        </Link>
      </div>
    );
  }

  const images = product?.images ?? [];

  return (
    <div className="py-8 md:py-12">
      <div className="max-w-[1200px] mx-auto px-4">
        {/* Breadcrumb */}
        <div className="mb-6">
          <Link href="/tienda" className="inline-flex items-center gap-1 text-sm opacity-60 hover:opacity-100 transition-opacity">
            <ArrowLeft size={14} /> Volver a la tienda
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
          {/* Image Gallery */}
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
            <div className="bg-gray-50 rounded-lg overflow-hidden aspect-square relative">
              <Image
                src={images?.[selectedImage]?.url ?? "/images/airpods-lineup.png"}
                alt={product?.name ?? "Producto"}
                fill
                className="object-contain p-4"
                sizes="(max-width: 768px) 100vw, 50vw"
                priority
              />
            </div>
            {images.length > 1 && (
              <div className="flex gap-2 mt-4 overflow-x-auto">
                {images.filter((_: any, idx: number) => idx !== selectedImage).map((img: any, i: number) => {
                  const realIndex = images.indexOf(img);
                  return (
                    <button
                      key={img?.id ?? i}
                      onClick={() => setSelectedImage(realIndex)}
                      className="flex-shrink-0 w-16 h-16 rounded-md overflow-hidden relative border-2 border-transparent hover:border-[#1B2B5E] transition-colors"
                    >
                      <Image src={img?.url ?? ""} alt="" fill className="object-cover" sizes="64px" />
                    </button>
                  );
                })}
              </div>
            )}
          </motion.div>

          {/* Product Info */}
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
            <p className="text-xs uppercase tracking-wider opacity-50 font-semibold">{product?.category?.name ?? ""}</p>
            <h1 className="text-2xl md:text-3xl font-extrabold font-display tracking-tight mt-1" style={{ color: "#1B2B5E" }}>
              {product?.name ?? "Producto"}
            </h1>

            {/* Pricing */}
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <span className="text-2xl font-bold" style={{ color: "#1B2B5E" }}>
                  {formatPrice(effectivePrice)}
                </span>
                {isWholesaleQty && product?.wholesalePrice && (
                  <span className="text-sm line-through opacity-40">{formatPrice(currentPrice)}</span>
                )}
              </div>
              {product?.wholesalePrice && (
                <div className="mt-2 flex items-center gap-2">
                  <Tag size={14} style={{ color: "#1B2B5E" }} />
                  <span className="text-sm">
                    <strong>Precio mayorista:</strong> {formatPrice(product.wholesalePrice)} (desde {product?.wholesaleMinQty ?? 6} uds.)
                  </span>
                </div>
              )}
            </div>

            {/* Description */}
            {product?.description && (
              <p className="mt-4 text-sm opacity-70 leading-relaxed">{product.description}</p>
            )}

            {/* Variants */}
            {(product?.variants ?? []).length > 0 && (
              <div className="mt-6">
                <label className="text-sm font-bold uppercase tracking-wider" style={{ color: "#1B2B5E" }}>Variante</label>
                <div className="flex gap-2 mt-2 flex-wrap">
                  {(product.variants ?? []).map((v: any) => (
                    <button
                      key={v?.id}
                      onClick={() => setSelectedVariant(v)}
                      className={`px-4 py-2 text-sm font-semibold rounded-md border-2 transition-colors ${
                        selectedVariant?.id === v?.id
                          ? "text-white"
                          : "border-gray-200 hover:border-gray-400"
                      }`}
                      style={
                        selectedVariant?.id === v?.id
                          ? { background: "#1B2B5E", borderColor: "#1B2B5E" }
                          : {}
                      }
                    >
                      {v?.value ?? v?.name ?? ""}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity */}
            <div className="mt-6">
              <label className="text-sm font-bold uppercase tracking-wider" style={{ color: "#1B2B5E" }}>Cantidad</label>
              <div className="flex items-center gap-3 mt-2">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-10 h-10 rounded-md border flex items-center justify-center hover:bg-gray-50"
                >
                  <Minus size={16} />
                </button>
                <span className="text-lg font-bold w-12 text-center">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="w-10 h-10 rounded-md border flex items-center justify-center hover:bg-gray-50"
                >
                  <Plus size={16} />
                </button>
              </div>
              {quantity >= (product?.wholesaleMinQty ?? 6) && product?.wholesalePrice && (
                <p className="mt-2 text-sm flex items-center gap-1 font-semibold" style={{ color: "#1B2B5E" }}>
                  <Check size={14} /> Precio mayorista aplicado
                </p>
              )}
            </div>

            {/* Total */}
            <div className="mt-6 p-4 rounded-lg border-2" style={{ borderColor: "#1B2B5E" }}>
              <div className="flex justify-between items-center">
                <span className="text-sm font-semibold opacity-60">Total</span>
                <span className="text-xl font-bold" style={{ color: "#1B2B5E" }}>
                  {formatPrice(effectivePrice * quantity)}
                </span>
              </div>
            </div>

            {/* Add to Cart */}
            <button
              onClick={handleAddToCart}
              className="mt-6 w-full flex items-center justify-center gap-2 py-3.5 text-white font-bold text-sm uppercase tracking-wider rounded-md hover:opacity-90 transition-opacity"
              style={{ background: "#1B2B5E" }}
            >
              <ShoppingCart size={18} />
              Agregar al Carrito
            </button>

            {/* SKU */}
            <p className="mt-4 text-xs opacity-40 font-mono">SKU: {product?.sku ?? ""}</p>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
