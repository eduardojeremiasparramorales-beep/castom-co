"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { CheckCircle, ArrowRight, Smartphone } from "lucide-react";
import { motion } from "framer-motion";
import { getNequiDeepLink } from "@/lib/nequi";

export function ConfirmacionClient() {
  const searchParams = useSearchParams();
  const orderNumber = searchParams?.get("order") ?? "";
  const totalStr = searchParams?.get("total") ?? "0";
  const total = parseInt(totalStr, 10);

  const formatPrice = (p: number) =>
    new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", minimumFractionDigits: 0 }).format(p ?? 0);

  return (
    <div className="max-w-[600px] mx-auto px-4 py-16 text-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        <CheckCircle size={64} className="mx-auto mb-6" style={{ color: "#1B2B5E" }} />
        <h1 className="text-3xl font-extrabold font-display tracking-tight" style={{ color: "#1B2B5E" }}>
          ¡Pedido Confirmado!
        </h1>
        <p className="mt-4 text-lg opacity-60">
          Gracias por tu compra. Tu pedido ha sido registrado.
        </p>
        {orderNumber && (
          <div className="mt-6 p-4 bg-gray-50 rounded-lg inline-block">
            <p className="text-sm opacity-50">Número de pedido</p>
            <p className="text-xl font-bold font-mono" style={{ color: "#1B2B5E" }}>{orderNumber}</p>
          </div>
        )}

        {/* Nequi payment */}
        {total > 0 && (
          <div className="mt-8 p-6 rounded-lg border-2" style={{ borderColor: "#1B2B5E", background: "#f8f9fa" }}>
            <h2 className="text-lg font-bold mb-2" style={{ color: "#1B2B5E" }}>
              Paga con Nequi
            </h2>
            <p className="text-3xl font-extrabold my-3" style={{ color: "#1B2B5E" }}>
              {formatPrice(total)}
            </p>
            <a
              href={getNequiDeepLink(total, `PEDIDO ${orderNumber}`)}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-flex items-center gap-2 px-6 py-3 text-white font-bold text-sm uppercase tracking-wider rounded-md hover:opacity-90 transition-opacity"
              style={{ background: "#1B2B5E" }}
            >
              <Smartphone size={18} />
              Pagar con Nequi
            </a>
            <p className="mt-4 text-xs opacity-50 text-left">
              <strong>Instrucciones:</strong><br />
              1. Haz clic en &quot;Pagar con Nequi&quot; (se abrirá la app)<br />
              2. Confirma el pago en Nequi<br />
              3. Vuelve aquí y te contactaremos para confirmar tu pedido
            </p>
          </div>
        )}

        <p className="mt-6 text-sm opacity-50">
          Recibirás un email con los detalles. Te contactaremos para coordinar la entrega.
        </p>
        <Link
          href="/tienda"
          className="mt-8 inline-flex items-center gap-2 px-6 py-3 text-white font-bold text-sm uppercase tracking-wider rounded-md"
          style={{ background: "#1B2B5E" }}
        >
          Seguir Comprando
          <ArrowRight size={16} />
        </Link>
      </motion.div>
    </div>
  );
}
