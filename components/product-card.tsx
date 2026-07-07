"use client";

import { useRef, useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSession } from "next-auth/react";
import { ShoppingCart, Tag, TrendingDown } from "lucide-react";
import { addToCart } from "@/lib/cart";
import { toast } from "sonner";
import { motion } from "framer-motion";

interface ProductCardProps {
  product: any;
}

export function ProductCard({ product }: ProductCardProps) {
  const { data: session } = useSession() || {};
  const cardRef = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const [glowPos, setGlowPos] = useState({ x: 50, y: 50 });

  const mainImage = product?.images?.[0]?.url ?? "/images/airpods-lineup.png";
  const hasWholesale = product?.wholesalePrice != null;
  const user = session?.user as any;
  const canWholesale = user?.wholesaleStatus === "approved" || user?.role === "admin";
  const lowStock = product?.stock != null && product.stock > 0 && product.stock <= 5;

  const handleMouseMove = (e: React.MouseEvent) => {
    const rect = cardRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    setTilt({ x: (y - 0.5) * 25, y: (x - 0.5) * -25 });
    setGlowPos({ x: x * 100, y: y * 100 });
  };

  const handleMouseLeave = () => {
    setTilt({ x: 0, y: 0 });
    setIsHovered(false);
  };

  // Simulated 360 rotation on idle (only on desktop, pauses on hover)
  const [idleRotate, setIdleRotate] = useState(0);
  useEffect(() => {
    const isTouchDevice = "ontouchstart" in window || navigator.maxTouchPoints > 0;
    if (isTouchDevice) return;
    let frame: number;
    let start = Date.now();
    const animate = () => {
      if (!isHovered) {
        const elapsed = (Date.now() - start) / 1000;
        setIdleRotate((elapsed * 15) % 360);
      } else {
        start = Date.now();
      }
      frame = requestAnimationFrame(animate);
    };
    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, [isHovered]);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart({
      id: `${product?.id}-default`,
      productId: product?.id ?? "",
      name: product?.name ?? "Producto",
      price: product?.price ?? 0,
      wholesalePrice: canWholesale ? (product?.wholesalePrice ?? null) : null,
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
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.5, ease: [0.2, 0, 0, 1] }}
      style={{ perspective: "1200px" }}
    >
      <Link href={`/producto/${product?.slug ?? ""}`} className="group block">
        <div
          ref={cardRef}
          onMouseMove={handleMouseMove}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={handleMouseLeave}
          className="card-space liquid-glass-card rounded-xl overflow-hidden"
          style={{
            transform: isHovered
              ? `rotateX(${tilt.x}deg) rotateY(${tilt.y}deg) translateY(-8px) scale(1.02)`
              : `perspective(800px) rotateY(${idleRotate}deg)`,
            transition: isHovered
              ? "transform 0.1s cubic-bezier(0.2, 0, 0, 1), box-shadow 0.3s ease"
              : "transform 0.8s cubic-bezier(0.2, 0, 0, 1), box-shadow 0.3s ease",
            boxShadow: isHovered
              ? "0 25px 50px -12px rgba(27, 43, 94, 0.4), 0 0 0 1px rgba(27, 43, 94, 0.2), 0 0 60px rgba(27, 43, 94, 0.08)"
              : "0 2px 8px rgba(0,0,0,0.3)",
            transformStyle: "preserve-3d",
            "--mouse-x": `${glowPos.x}%`,
            "--mouse-y": `${glowPos.y}%`,
            borderRadius: "var(--radius-xl)",
          } as React.CSSProperties}
        >
            <div className="relative aspect-square overflow-hidden">
            <div className="relative w-full h-full transition-transform duration-1000"
              style={{
                transform: isHovered ? "scale(1.12)" : "scale(1)",
              }}
            >
              <Image
                src={mainImage}
                alt={product?.name ?? "Producto"}
                fill
                className="object-cover"
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
              />
            </div>

            {/* Overlay gradient on hover */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

            {/* 3D floating badges layer */}
            <div style={{ transform: isHovered ? "translateZ(40px)" : "translateZ(20px)", transition: "transform 0.3s ease" }}>
              {hasWholesale && (
                <span className="absolute top-3 left-3 text-white text-xs font-bold px-2 py-1 rounded flex items-center gap-1" style={{ background: "#1B2B5E" }}>
                  <Tag size={12} />
                  MAYORISTA
                </span>
              )}
              {lowStock && (
                <span className="absolute top-3 right-3 text-xs font-bold px-2 py-1 rounded bg-destructive/20 text-destructive-foreground animate-pulse">
                  ¡Quedan {product.stock}!
                </span>
              )}
            </div>

            <button
              onClick={handleAddToCart}
              className="absolute bottom-3 right-3 w-10 h-10 rounded-full flex items-center justify-center text-white transition-all duration-300 shadow-lg"
              style={{
                background: "#1B2B5E",
                opacity: isHovered ? 1 : 0,
                transform: isHovered ? "translateZ(50px) scale(1.15)" : "translateZ(0) scale(0.85)",
              }}
            >
              <ShoppingCart size={16} />
            </button>
          </div>
        </div>
        <div className="mt-3 px-1">
          <p className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">{product?.category?.name ?? ""}</p>
          <h3 className="font-bold text-sm mt-1 text-foreground group-hover:text-primary transition-colors">
            {product?.name ?? "Producto"}
          </h3>
          <div className="flex items-center gap-2 mt-1">
            <span className="font-bold text-base text-foreground">
              {formatPrice(product?.price ?? 0)}
            </span>
            {canWholesale && hasWholesale && (
              <span className="text-xs text-muted-foreground">
                Mayorista: {formatPrice(product?.wholesalePrice ?? 0)}
              </span>
            )}
            {!canWholesale && hasWholesale && (
              <span className="text-xs flex items-center gap-1 text-muted-foreground">
                <TrendingDown size={12} /> Precio especial
              </span>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
