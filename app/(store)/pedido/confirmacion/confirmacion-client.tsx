"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { CheckCircle, ArrowRight, Smartphone, Copy, Landmark, Truck } from "lucide-react";
import { motion } from "framer-motion";
import { getNequiDeepLink, getNequiConfig } from "@/lib/nequi";
import { toast } from "sonner";

export function ConfirmacionClient() {
  const searchParams = useSearchParams();
  const orderNumber = searchParams?.get("order") ?? "";
  const totalStr = searchParams?.get("total") ?? "0";
  const method = searchParams?.get("method") ?? "nequi";
  const total = parseInt(totalStr, 10);
  const nequi = getNequiConfig();

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

        {/* Payment instructions based on method */}
        {method === "nequi" && total > 0 && nequi.phone && (
          <div className="mt-8 p-6 rounded-lg border-2" style={{ borderColor: "#1B2B5E", background: "#f8f9fa" }}>
            <h2 className="text-lg font-bold mb-2" style={{ color: "#1B2B5E" }}>
              Paga con Nequi
            </h2>
            <p className="text-3xl font-extrabold my-3" style={{ color: "#1B2B5E" }}>
              {formatPrice(total)}
            </p>
            <div className="bg-white rounded-md p-3 mb-4 text-sm">
              <p className="opacity-50">Paga a esta cuenta de Nequi:</p>
              <div className="flex items-center justify-center gap-2 mt-1">
                <span className="text-lg font-bold font-mono" style={{ color: "#1B2B5E" }}>{nequi.phone}</span>
                <button
                  onClick={() => { navigator.clipboard.writeText(nequi.phone); toast.success("Número copiado"); }}
                  className="p-1.5 rounded-md hover:bg-gray-100 transition-colors"
                  title="Copiar número"
                >
                  <Copy size={16} style={{ color: "#1B2B5E" }} />
                </button>
              </div>
              {nequi.name && <p className="opacity-40 text-xs mt-1">Titular: {nequi.name}</p>}
            </div>
            <a
              href={getNequiDeepLink(total, `PEDIDO ${orderNumber}`)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 text-white font-bold text-sm uppercase tracking-wider rounded-md hover:opacity-90 transition-opacity"
              style={{ background: "#1B2B5E" }}
            >
              <Smartphone size={18} />
              Abrir Nequi
            </a>
            <p className="mt-4 text-xs opacity-50 text-left">
              <strong>Instrucciones:</strong><br />
              1. Abre Nequi y envía <strong>{formatPrice(total)}</strong> al número de arriba<br />
              2. Usa como referencia: <strong>{orderNumber}</strong><br />
              3. Te contactaremos para confirmar tu pedido
            </p>
          </div>
        )}

        {method === "transfer" && (
          <div className="mt-8 p-6 rounded-lg border-2" style={{ borderColor: "#1B2B5E", background: "#f8f9fa" }}>
            <Landmark size={32} className="mx-auto mb-3" style={{ color: "#1B2B5E" }} />
            <h2 className="text-lg font-bold mb-2" style={{ color: "#1B2B5E" }}>
              Transferencia Bancaria
            </h2>
            <p className="text-3xl font-extrabold my-3" style={{ color: "#1B2B5E" }}>
              {formatPrice(total)}
            </p>
            <div className="bg-white rounded-md p-4 text-sm text-left space-y-2">
              <p><strong>Instrucciones:</strong></p>
              <p className="opacity-70">Te enviaremos un correo electrónico con los datos bancarios para realizar la transferencia por <strong>{formatPrice(total)}</strong>.</p>
              <p className="opacity-70">Usa como referencia: <strong className="font-mono">{orderNumber}</strong></p>
              <p className="opacity-70">Una vez recibamos tu transferencia, procesaremos tu pedido.</p>
            </div>
          </div>
        )}

        {method === "contraentrega" && (
          <div className="mt-8 p-6 rounded-lg border-2" style={{ borderColor: "#1B2B5E", background: "#f8f9fa" }}>
            <Truck size={32} className="mx-auto mb-3" style={{ color: "#1B2B5E" }} />
            <h2 className="text-lg font-bold mb-2" style={{ color: "#1B2B5E" }}>
              Pago Contraentrega
            </h2>
            <p className="text-3xl font-extrabold my-3" style={{ color: "#1B2B5E" }}>
              {formatPrice(total)}
            </p>
            <div className="bg-white rounded-md p-4 text-sm text-left space-y-2">
              <p><strong>Detalles de entrega:</strong></p>
              <p className="opacity-70">Tu pedido será enviado a <strong>Acacías, Meta</strong>.</p>
              <p className="opacity-70">Paga en efectivo al recibir tu pedido.</p>
              <p className="opacity-70">Te contactaremos para coordinar la entrega.</p>
            </div>
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
