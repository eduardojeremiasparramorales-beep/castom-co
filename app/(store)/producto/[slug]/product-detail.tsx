"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import { ShoppingCart, Minus, Plus, Tag, ArrowLeft, Check, TrendingDown, Rotate3D } from "lucide-react";
import { addToCart } from "@/lib/cart";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { Product360View } from "@/components/product-360-view";

interface Props {
  slug: string;
}

export function ProductDetail({ slug }: Props) {
  const { data: session } = useSession() || {};
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [selectedVariant, setSelectedVariant] = useState<any>(null);
  const [show360, setShow360] = useState(false);

  const user = session?.user as any;
  const canWholesale = user?.wholesaleStatus === "approved" || user?.role === "admin";

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
  const effectivePrice = canWholesale && isWholesaleQty && product?.wholesalePrice ? product.wholesalePrice : currentPrice;

  const getTierPrice = () => {
    if (!product?.priceTiers || product.priceTiers.length === 0) return null;
    const sorted = [...product.priceTiers].sort((a: any, b: any) => a.minQty - b.minQty);
    for (const tier of sorted) {
      if (quantity >= tier.minQty && (!tier.maxQty || quantity <= tier.maxQty)) return tier;
    }
    const last = sorted[sorted.length - 1];
    if (last && quantity >= last.minQty) return last;
    return null;
  };

  const tierPrice = getTierPrice();
  const displayPrice = tierPrice ? tierPrice.price : effectivePrice;
  const images = product?.images ?? [];
  const tiers = product?.priceTiers ?? [];

  const handleAddToCart = () => {
    if (!product) return;
    addToCart({
      id: `${product.id}-${selectedVariant?.id ?? "default"}`,
      productId: product.id,
      name: product.name,
      price: currentPrice,
      wholesalePrice: canWholesale ? (product.wholesalePrice ?? null) : null,
      wholesaleMinQty: product.wholesaleMinQty ?? 6,
      quantity,
      imageUrl: images?.[0]?.url ?? "/images/airpods-lineup.png",
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

  return (
    <div className="py-8 md:py-12">
      <div className="max-w-[1200px] mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <Link href="/tienda" className="inline-flex items-center gap-1 text-sm opacity-60 hover:opacity-100 transition-opacity">
            <ArrowLeft size={14} /> Volver a la tienda
          </Link>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
          {/* Image Gallery with 360 toggle */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, ease: [0.2, 0, 0, 1] }}
          >
            {show360 ? (
              <div>
                <Product360View images={images.length > 0 ? images.map((img: any) => ({ url: img.url, alt: img.alt })) : [{ url: "/images/airpods-lineup.png", alt: product.name }]} />
                <button
                  onClick={() => setShow360(false)}
                  className="mt-3 flex items-center gap-1 text-xs font-semibold opacity-50 hover:opacity-100 transition-opacity"
                >
                  <Rotate3D size={14} /> Ver imagen estática
                </button>
              </div>
            ) : (
              <>
                <div className="bg-gray-50 rounded-lg overflow-hidden aspect-square relative group">
                  <Image
                    src={images?.[selectedImage]?.url ?? "/images/airpods-lineup.png"}
                    alt={product?.name ?? "Producto"}
                    fill
                    className="object-contain p-4 transition-transform duration-500 group-hover:scale-105"
                    sizes="(max-width: 768px) 100vw, 50vw"
                    priority
                  />
                  {images.length > 1 && (
                    <button
                      onClick={() => setShow360(true)}
                      className="absolute bottom-4 right-4 px-3 py-2 rounded-lg bg-white/90 backdrop-blur-sm shadow-md flex items-center gap-1.5 text-xs font-semibold hover:bg-white transition-all opacity-0 group-hover:opacity-100"
                      style={{ color: "#1B2B5E" }}
                    >
                      <Rotate3D size={14} /> Vista 360°
                    </button>
                  )}
                </div>
                {images.length > 1 && (
                  <div className="flex gap-2 mt-4 overflow-x-auto scrollbar-none">
                    {images.map((img: any, i: number) => (
                      <button
                        key={img?.id ?? i}
                        onClick={() => { setSelectedImage(i); setShow360(false); }}
                        className={`flex-shrink-0 w-16 h-16 rounded-md overflow-hidden relative border-2 transition-all duration-200 ${
                          i === selectedImage ? "border-[#1B2B5E] shadow-md" : "border-transparent hover:border-[#1B2B5E]/40"
                        }`}
                      >
                        <Image src={img?.url ?? ""} alt="" fill className="object-cover" sizes="64px" />
                      </button>
                    ))}
                  </div>
                )}
              </>
            )}
          </motion.div>

          {/* Product Info */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1, ease: [0.2, 0, 0, 1] }}
          >
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="text-xs uppercase tracking-wider opacity-50 font-semibold"
            >
              {product?.category?.name ?? ""}
            </motion.p>
            <motion.h1
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-2xl md:text-3xl font-extrabold font-display tracking-tight mt-1"
              style={{ color: "#1B2B5E" }}
            >
              {product?.name ?? "Producto"}
            </motion.h1>

            {/* Pricing */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
              className="mt-4 p-4 bg-gray-50 rounded-lg"
            >
              <div className="flex items-center gap-3">
                <motion.span
                  key={displayPrice}
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="text-2xl font-bold"
                  style={{ color: "#1B2B5E" }}
                >
                  {formatPrice(displayPrice)}
                </motion.span>
                {(tierPrice || (canWholesale && isWholesaleQty && product?.wholesalePrice)) && (
                  <span className="text-sm line-through opacity-40">{formatPrice(currentPrice)}</span>
                )}
              </div>
              {canWholesale && product?.wholesalePrice && (
                <div className="mt-2 flex items-center gap-2">
                  <Tag size={14} style={{ color: "#1B2B5E" }} />
                  <span className="text-sm">
                    <strong>Precio mayorista:</strong> {formatPrice(product.wholesalePrice)} (desde {product?.wholesaleMinQty ?? 6} uds.)
                  </span>
                </div>
              )}
              {!canWholesale && product?.wholesalePrice && (
                <div className="mt-2">
                  <Link href="/mayoristas/solicitar" className="text-sm font-semibold underline" style={{ color: "#1B2B5E" }}>
                    <TrendingDown size={14} className="inline mr-1" />
                    Solicita precio mayorista
                  </Link>
                </div>
              )}
            </motion.div>

            {/* Price Tiers */}
            {tiers.length > 0 && canWholesale && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="mt-4 p-4 rounded-lg border-2 border-[#1B2B5E]/20 bg-[#1B2B5E]/5"
              >
                <h3 className="text-sm font-bold uppercase tracking-wider flex items-center gap-1 mb-3" style={{ color: "#1B2B5E" }}>
                  <TrendingDown size={16} /> Precios por Volumen
                </h3>
                <div className="space-y-1">
                  <div className="flex justify-between text-xs font-semibold opacity-50 pb-1 border-b">
                    <span>Cantidad</span>
                    <span>Precio unitario</span>
                  </div>
                  {[...tiers].sort((a: any, b: any) => a.minQty - b.minQty).map((tier: any, i: number) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.35 + i * 0.05 }}
                      className={`flex justify-between text-sm py-1 px-2 rounded ${
                        quantity >= tier.minQty && (!tier.maxQty || quantity <= tier.maxQty)
                          ? "font-bold bg-[#1B2B5E]/10" : ""
                      }`}
                    >
                      <span>{tier.minQty}{tier.maxQty ? ` - ${tier.maxQty}` : "+"} uds.</span>
                      <span style={{ color: "#1B2B5E" }}>{formatPrice(tier.price)}</span>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Description */}
            {product?.description && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.35 }}
                className="mt-4 text-sm opacity-70 leading-relaxed"
              >
                {product.description}
              </motion.p>
            )}

            {/* Variants */}
            {(product?.variants ?? []).length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="mt-6"
              >
                <label className="text-sm font-bold uppercase tracking-wider" style={{ color: "#1B2B5E" }}>Variante</label>
                <div className="flex gap-2 mt-2 flex-wrap">
                  {(product.variants ?? []).map((v: any) => (
                    <motion.button
                      key={v?.id}
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
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
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Quantity + Add to Cart */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.45 }}
              className="mt-6"
            >
              <label className="text-sm font-bold uppercase tracking-wider" style={{ color: "#1B2B5E" }}>Cantidad</label>
              <div className="flex items-center gap-3 mt-2">
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-10 h-10 rounded-md border flex items-center justify-center hover:bg-gray-50"
                >
                  <Minus size={16} />
                </motion.button>
                <motion.span
                  key={quantity}
                  initial={{ scale: 1.3 }}
                  animate={{ scale: 1 }}
                  className="text-lg font-bold w-12 text-center"
                >
                  {quantity}
                </motion.span>
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setQuantity(quantity + 1)}
                  className="w-10 h-10 rounded-md border flex items-center justify-center hover:bg-gray-50"
                >
                  <Plus size={16} />
                </motion.button>
              </div>
            </motion.div>

            {/* Wholesale / Tier indicators */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              {canWholesale && quantity >= (product?.wholesaleMinQty ?? 6) && product?.wholesalePrice && (
                <motion.p
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="mt-2 text-sm flex items-center gap-1 font-semibold"
                  style={{ color: "#1B2B5E" }}
                >
                  <Check size={14} /> Precio mayorista aplicado
                </motion.p>
              )}
              {tierPrice && (
                <motion.p
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="mt-1 text-sm flex items-center gap-1 font-semibold"
                  style={{ color: "#1B2B5E" }}
                >
                  <Check size={14} /> Precio por volumen aplicado
                </motion.p>
              )}
            </motion.div>

            {/* Total + Cart button */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.55 }}
            >
              <div className="mt-6 p-4 rounded-lg border-2" style={{ borderColor: "#1B2B5E" }}>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-semibold opacity-60">Total</span>
                  <motion.span
                    key={displayPrice * quantity}
                    initial={{ scale: 1.1, opacity: 0.7 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="text-xl font-bold"
                    style={{ color: "#1B2B5E" }}
                  >
                    {formatPrice(displayPrice * quantity)}
                  </motion.span>
                </div>
              </div>

              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                onClick={handleAddToCart}
                className="mt-6 w-full flex items-center justify-center gap-2 py-3.5 text-white font-bold text-sm uppercase tracking-wider rounded-md hover:opacity-90 transition-opacity"
                style={{ background: "#1B2B5E" }}
              >
                <ShoppingCart size={18} />
                Agregar al Carrito
              </motion.button>
            </motion.div>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="mt-4 text-xs opacity-40 font-mono"
            >
              SKU: {product?.sku ?? ""}
            </motion.p>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
