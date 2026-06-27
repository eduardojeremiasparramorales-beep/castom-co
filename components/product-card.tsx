"use client";

import Link from "next/link";
import Image from "next/image";
import { ShoppingCart, Tag } from "lucide-react";
import { addToCart } from "@/lib/cart";
import { toast } from "sonner";
import { motion } from "framer-motion";

interface ProductCardProps {
  product: any;
}

export function ProductCard({ product }: ProductCardProps) {
  const mainImage = product?.images?.[0]?.url ?? "/images/airpods-lineup.png";
  const hasWholesale = product?.wholesalePrice != null;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart({
      id: `${product?.id}-default`,
      productId: product?.id ?? "",
      name: product?.name ?? "Producto",
      price: product?.price ?? 0,
      wholesalePrice: product?.wholesalePrice ?? null,
      wholesaleMinQty: product?.wholesaleMinQty ?? 6,
      quantity: 1,
      imageUrl: mainImage,
      variantName: null,
    });
    toast.success("Agregado al carrito");
  };

  const formatPrice = (p: number) => {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
    }).format(p ?? 0);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <Link href={`/producto/${product?.slug ?? ""}`} className="group block">
        <div className="bg-gray-50 rounded-lg overflow-hidden relative aspect-square">
          <div className="relative w-full h-full">
            <Image
              src={mainImage}
              alt={product?.name ?? "Producto"}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-500"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            />
          </div>
          {hasWholesale && (
            <span className="absolute top-3 left-3 text-white text-xs font-bold px-2 py-1 rounded flex items-center gap-1" style={{ background: "#1B2B5E" }}>
              <Tag size={12} />
              MAYORISTA
            </span>
          )}
          <button
            onClick={handleAddToCart}
            className="absolute bottom-3 right-3 w-10 h-10 rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-all duration-300 hover:scale-110"
            style={{ background: "#1B2B5E" }}
          >
            <ShoppingCart size={16} />
          </button>
        </div>
        <div className="mt-3 px-1">
          <p className="text-xs uppercase tracking-wider opacity-50 font-semibold">{product?.category?.name ?? ""}</p>
          <h3 className="font-bold text-sm mt-1 group-hover:opacity-70 transition-opacity" style={{ color: "#1B2B5E" }}>
            {product?.name ?? "Producto"}
          </h3>
          <div className="flex items-center gap-2 mt-1">
            <span className="font-bold text-base" style={{ color: "#1B2B5E" }}>
              {formatPrice(product?.price ?? 0)}
            </span>
            {hasWholesale && (
              <span className="text-xs opacity-50">
                Mayorista: {formatPrice(product?.wholesalePrice ?? 0)}
              </span>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
