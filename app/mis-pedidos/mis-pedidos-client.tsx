"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Loader2, Package } from "lucide-react";

export function MisPedidosClient() {
  const { data: session, status } = useSession() || {};
  const router = useRouter();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/login");
      return;
    }
    if (status === "authenticated") {
      fetch("/api/orders")
        .then((r) => r.json())
        .then((data) => setOrders(Array.isArray(data) ? data : []))
        .catch(() => setOrders([]))
        .finally(() => setLoading(false));
    }
  }, [status, router]);

  const formatPrice = (p: number) =>
    new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", minimumFractionDigits: 0 }).format(p ?? 0);

  const statusConfig: Record<string, { label: string; color: string }> = {
    pendiente: { label: "Pendiente", color: "bg-yellow-100 text-yellow-700" },
    pagado: { label: "Pagado", color: "bg-green-100 text-green-700" },
    confirmado: { label: "Confirmado", color: "bg-blue-100 text-blue-700" },
    enviado: { label: "Enviado", color: "bg-purple-100 text-purple-700" },
    entregado: { label: "Entregado", color: "bg-green-100 text-green-700" },
    cancelado: { label: "Cancelado", color: "bg-red-100 text-red-600" },
  };

  if (status === "loading" || loading) {
    return <div className="flex items-center justify-center min-h-[400px]"><Loader2 className="animate-spin" size={32} /></div>;
  }

  return (
    <div className="max-w-[800px] mx-auto px-4 py-8 md:py-12">
      <Link href="/" className="inline-flex items-center gap-1 text-sm opacity-60 hover:opacity-100 mb-6">
        <ArrowLeft size={14} /> Volver
      </Link>

      <h1 className="text-3xl font-extrabold font-display tracking-tight mb-8" style={{ color: "#1B2B5E" }}>
        Mis Pedidos
      </h1>

      {orders.length === 0 ? (
        <div className="text-center py-12">
          <Package size={48} className="mx-auto mb-4 opacity-20" />
          <p className="opacity-50">No tienes pedidos aún</p>
          <Link href="/tienda" className="inline-flex items-center gap-1 mt-4 text-sm font-semibold" style={{ color: "#1B2B5E" }}>
            Ir a la tienda
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order: any) => {
            const cfg = statusConfig[order?.status ?? ""] ?? { label: order?.status ?? "", color: "bg-gray-100 text-gray-600" };
            return (
              <div key={order?.id} className="bg-white p-5 rounded-lg border">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="font-bold font-mono" style={{ color: "#1B2B5E" }}>{order?.orderNumber ?? ""}</span>
                    <span className={`px-2 py-0.5 text-xs font-bold rounded ${cfg.color}`}>{cfg.label}</span>
                  </div>
                  <span className="text-xs opacity-50">
                    {order?.createdAt ? new Date(order.createdAt).toLocaleDateString("es-CO") : ""}
                  </span>
                </div>
                <div className="text-sm space-y-1">
                  {(order?.items ?? []).map((item: any) => (
                    <p key={item?.id} className="text-xs opacity-60">
                      {item?.productName ?? ""} {item?.variantName ? `(${item.variantName})` : ""} x{item?.quantity ?? 0} — {formatPrice(item?.totalPrice ?? 0)}
                    </p>
                  ))}
                </div>
                <div className="flex justify-between items-center mt-3 pt-3 border-t">
                  <span className="text-xs opacity-50">
                    {order?.paymentMethod === "transfer" && "Transferencia bancaria"}
                    {order?.paymentMethod === "contraentrega" && "Contraentrega"}
                    {(!order?.paymentMethod || order?.paymentMethod === "nequi") && "Nequi / Bancolombia"}
                  </span>
                  <span className="font-bold" style={{ color: "#1B2B5E" }}>{formatPrice(order?.total ?? 0)}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
