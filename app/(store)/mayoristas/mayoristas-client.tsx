"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import { Package, Tag, ShoppingCart, Handshake, ArrowUpRight, Globe, TrendingDown, UserPlus } from "lucide-react";
import { ProductCard } from "@/components/product-card";
import { motion } from "framer-motion";

export function MayoristasClient() {
  const { data: session } = useSession() || {};
  const [products, setProducts] = useState<any[]>([]);

  const user = session?.user as any;
  const canWholesale = user?.wholesaleStatus === "approved" || user?.role === "admin";

  useEffect(() => {
    fetch("/api/products?limit=50")
      .then((r) => r.json())
      .then((data: any) => {
        const all = Array.isArray(data) ? data : [];
        setProducts(all.filter((p: any) => p?.wholesalePrice != null));
      })
      .catch(() => setProducts([]));
  }, []);

  const features = [
    { icon: Package, title: "Productos de Calidad", desc: "Garantía en todos nuestros productos" },
    { icon: Tag, title: "Precios Especiales", desc: "Descuentos exclusivos por volumen" },
    { icon: ShoppingCart, title: "Stock Disponible", desc: "Siempre listos para despacho" },
    { icon: Handshake, title: "Alianzas que Suman", desc: "Crecemos juntos con tu negocio" },
  ];

  return (
    <div>
      {/* Hero */}
      <section className="py-16 md:py-24 text-center" style={{ background: "#1B2B5E" }}>
        <div className="max-w-[1200px] mx-auto px-4">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <p className="text-white/50 text-xs font-mono uppercase tracking-[0.3em] mb-4">Para negocios que piensan diferente.</p>
            <h1 className="text-5xl md:text-7xl font-extrabold font-display text-white tracking-tight">
              VENTAS AL POR MAYOR
            </h1>
            <div className="flex items-center justify-center gap-4 mt-6">
              <p className="text-white/60 text-sm uppercase tracking-wider">A partir de</p>
              <span className="text-5xl font-extrabold bg-white px-4 py-2 rounded-lg" style={{ color: "#1B2B5E" }}>6</span>
              <p className="text-white/60 text-sm uppercase tracking-wider">unidades</p>
            </div>

            {/* CTA for non-approved users */}
            {!canWholesale && (
              <div className="mt-8">
                <Link
                  href={session ? "/mayoristas/solicitar" : "/registro"}
                  className="inline-flex items-center gap-2 px-6 py-3 text-[#1B2B5E] font-bold text-sm uppercase tracking-wider rounded-md bg-white hover:opacity-90 transition-opacity"
                >
                  <UserPlus size={18} />
                  {session ? "Solicitar Acceso Mayorista" : "Regístrate y Solicita Acceso"}
                </Link>
              </div>
            )}
            {canWholesale && (
              <div className="mt-8">
                <span className="inline-flex items-center gap-2 px-4 py-2 bg-green-500/20 text-green-300 text-sm font-bold rounded-md">
                  <Tag size={16} /> Acceso mayorista activo
                </span>
              </div>
            )}
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="py-12 md:py-16">
        <div className="max-w-[1200px] mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {features.map((f: any, i: number) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="text-center p-6 rounded-lg bg-gray-50"
              >
                <f.icon size={32} className="mx-auto mb-3" style={{ color: "#1B2B5E" }} />
                <h3 className="font-bold text-sm uppercase tracking-wider" style={{ color: "#1B2B5E" }}>{f.title}</h3>
                <p className="text-xs opacity-50 mt-1">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Condition for non-approved */}
      {!canWholesale && (
        <section className="py-12 text-center">
          <div className="max-w-[600px] mx-auto px-4">
            <div className="p-8 rounded-lg border-2 border-dashed" style={{ borderColor: "#1B2B5E" }}>
              <TrendingDown size={48} className="mx-auto mb-4" style={{ color: "#1B2B5E" }} />
              <h2 className="text-xl font-bold font-display mb-2" style={{ color: "#1B2B5E" }}>
                Precios Exclusivos para Mayoristas
              </h2>
              <p className="text-sm opacity-60 mb-6">
                Registra tu empresa y obtén acceso a precios especiales por volumen.
                Una vez aprobado, podrás ver todos los precios mayoristas y niveles de precio.
              </p>
              <Link
                href={session ? "/mayoristas/solicitar" : "/registro"}
                className="inline-flex items-center gap-2 px-6 py-3 text-white font-bold text-sm uppercase tracking-wider rounded-md"
                style={{ background: "#1B2B5E" }}
              >
                <UserPlus size={18} />
                {session ? "Solicitar Acceso" : "Registrarme"}
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Wholesale Products */}
      {products.length > 0 && (
        <section className={`py-12 md:py-16 ${canWholesale ? "bg-gray-50" : "opacity-50 pointer-events-none"}`}>
          <div className="max-w-[1200px] mx-auto px-4">
            <h2 className="text-2xl font-extrabold font-display tracking-tight mb-8 text-center" style={{ color: "#1B2B5E" }}>
              Productos con Precio Mayorista
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {(products ?? []).map((product: any) => (
                <ProductCard key={product?.id} product={product} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="py-16 text-center">
        <div className="max-w-[600px] mx-auto px-4">
          <div className="p-6 border-2 rounded-lg" style={{ borderColor: "#1B2B5E" }}>
            <Globe size={32} className="mx-auto mb-3" style={{ color: "#1B2B5E" }} />
            <h3 className="font-bold text-lg" style={{ color: "#1B2B5E" }}>
              Escríbenos y Cotiza tu Pedido
            </h3>
            <p className="text-sm opacity-50 mt-1 mb-4">Compras más. Ganas más.</p>
            <Link
              href="/contacto"
              className="inline-flex items-center gap-2 px-6 py-3 text-white font-bold text-sm uppercase tracking-wider rounded-md"
              style={{ background: "#1B2B5E" }}
            >
              Contactar
              <ArrowUpRight size={16} />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
