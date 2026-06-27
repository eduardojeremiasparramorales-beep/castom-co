"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Trash2, Minus, Plus, ShoppingBag, ArrowRight, Tag } from "lucide-react";
import { getCart, removeFromCart, updateCartQuantity, getCartTotal, type CartItem } from "@/lib/cart";
import { motion } from "framer-motion";

export function CarritoClient() {
  const [items, setItems] = useState<CartItem[]>([]);

  useEffect(() => {
    setItems(getCart());
    const update = () => setItems(getCart());
    window.addEventListener("cart-updated", update);
    return () => window.removeEventListener("cart-updated", update);
  }, []);

  const formatPrice = (p: number) =>
    new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", minimumFractionDigits: 0 }).format(p ?? 0);

  const totals = getCartTotal(items);

  if ((items ?? []).length === 0) {
    return (
      <div className="max-w-[1200px] mx-auto px-4 py-16 text-center">
        <ShoppingBag size={48} className="mx-auto opacity-20 mb-4" />
        <h1 className="text-2xl font-bold" style={{ color: "#1B2B5E" }}>Tu carrito está vacío</h1>
        <p className="mt-2 opacity-50">Explora nuestro catálogo y agrega productos</p>
        <Link
          href="/tienda"
          className="mt-6 inline-flex items-center gap-2 px-6 py-3 text-white font-bold text-sm uppercase rounded-md"
          style={{ background: "#1B2B5E" }}
        >
          Ir a la Tienda
          <ArrowRight size={16} />
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-[1200px] mx-auto px-4 py-8 md:py-12">
      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-3xl font-extrabold font-display tracking-tight mb-8"
        style={{ color: "#1B2B5E" }}
      >
        Carrito de Compras
      </motion.h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Items */}
        <div className="lg:col-span-2 space-y-4">
          {(items ?? []).map((item: CartItem) => {
            const isWholesale = item?.wholesalePrice && (item?.quantity ?? 0) >= (item?.wholesaleMinQty ?? 6);
            const unitPrice = isWholesale ? (item?.wholesalePrice ?? 0) : (item?.price ?? 0);

            return (
              <motion.div
                key={item?.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex gap-4 p-4 bg-white rounded-lg shadow-sm border"
              >
                <div className="relative w-20 h-20 bg-gray-50 rounded-md overflow-hidden flex-shrink-0">
                  <Image
                    src={item?.imageUrl ?? "/images/airpods-lineup.png"}
                    alt={item?.name ?? ""}
                    fill
                    className="object-cover"
                    sizes="80px"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-sm truncate" style={{ color: "#1B2B5E" }}>{item?.name ?? ""}</h3>
                  {item?.variantName && <p className="text-xs opacity-50">{item.variantName}</p>}
                  <div className="flex items-center gap-2 mt-1">
                    <span className="font-bold text-sm" style={{ color: "#1B2B5E" }}>{formatPrice(unitPrice)}</span>
                    {isWholesale && (
                      <span className="text-xs text-white px-1.5 py-0.5 rounded flex items-center gap-1" style={{ background: "#1B2B5E" }}>
                        <Tag size={10} /> Mayorista
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <button
                      onClick={() => updateCartQuantity(item?.id ?? "", (item?.quantity ?? 1) - 1)}
                      className="w-7 h-7 rounded border flex items-center justify-center hover:bg-gray-50"
                    >
                      <Minus size={12} />
                    </button>
                    <span className="text-sm font-bold w-8 text-center">{item?.quantity ?? 0}</span>
                    <button
                      onClick={() => updateCartQuantity(item?.id ?? "", (item?.quantity ?? 1) + 1)}
                      className="w-7 h-7 rounded border flex items-center justify-center hover:bg-gray-50"
                    >
                      <Plus size={12} />
                    </button>
                    <button
                      onClick={() => removeFromCart(item?.id ?? "")}
                      className="ml-auto w-7 h-7 rounded flex items-center justify-center hover:bg-red-50 text-red-500"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Summary */}
        <div className="lg:col-span-1">
          <div className="p-6 rounded-lg sticky top-24" style={{ background: "#f8f9fa" }}>
            <h2 className="font-bold text-lg mb-4" style={{ color: "#1B2B5E" }}>Resumen</h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="opacity-60">Subtotal</span>
                <span>{formatPrice(totals?.subtotal ?? 0)}</span>
              </div>
              {(totals?.discount ?? 0) > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Descuento mayorista</span>
                  <span>-{formatPrice(totals.discount)}</span>
                </div>
              )}
              <div className="border-t pt-2 mt-2">
                <div className="flex justify-between font-bold text-lg">
                  <span style={{ color: "#1B2B5E" }}>Total</span>
                  <span style={{ color: "#1B2B5E" }}>{formatPrice(totals?.total ?? 0)}</span>
                </div>
              </div>
            </div>
            <Link
              href="/checkout"
              className="mt-6 w-full flex items-center justify-center gap-2 py-3 text-white font-bold text-sm uppercase tracking-wider rounded-md hover:opacity-90 transition-opacity"
              style={{ background: "#1B2B5E" }}
            >
              Proceder al Pago
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
