"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { CheckCircle, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

export function ConfirmacionClient() {
  const searchParams = useSearchParams();
  const orderNumber = searchParams?.get("order") ?? "";

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
          Gracias por tu compra. Tu pedido ha sido procesado exitosamente.
        </p>
        {orderNumber && (
          <div className="mt-6 p-4 bg-gray-50 rounded-lg inline-block">
            <p className="text-sm opacity-50">Número de pedido</p>
            <p className="text-xl font-bold font-mono" style={{ color: "#1B2B5E" }}>{orderNumber}</p>
          </div>
        )}
        <p className="mt-6 text-sm opacity-50">
          Recibirás un email con los detalles de tu pedido. Te contactaremos para coordinar el pago por Nequi o Bancolombia.
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
