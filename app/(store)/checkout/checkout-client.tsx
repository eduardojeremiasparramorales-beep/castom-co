"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { getCart, getCartTotal, clearCart, type CartItem } from "@/lib/cart";
import { CreditCard, ArrowLeft, Loader2, Landmark, Truck } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { motion } from "framer-motion";

export function CheckoutClient() {
  const router = useRouter();
  const { data: session } = useSession() || {};
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<string>("nequi");
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    department: "",
    notes: "",
  });

  useEffect(() => {
    setItems(getCart());
    if (session?.user?.name) setForm((f: any) => ({ ...f, name: session?.user?.name ?? "" }));
    if (session?.user?.email) setForm((f: any) => ({ ...f, email: session?.user?.email ?? "" }));
  }, [session]);

  const totals = getCartTotal(items);

  const formatPrice = (p: number) =>
    new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", minimumFractionDigits: 0 }).format(p ?? 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email) {
      toast.error("Nombre y email son requeridos");
      return;
    }
    if ((items ?? []).length === 0) {
      toast.error("El carrito está vacío");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items, customerInfo: form, paymentMethod }),
      });
      const data = await res.json();

      if (!res.ok) {
        toast.error(data?.error ?? "Error al procesar el pago");
        return;
      }

      if (data?.url) {
        clearCart();
        if (paymentMethod === "transfer" || paymentMethod === "contraentrega") {
          window.location.href = data.url;
        } else {
          window.location.href = data.url;
        }
      } else {
        toast.error("No se pudo iniciar el pago");
      }
    } catch (error: any) {
      console.error("Checkout error:", error);
      toast.error("Error al procesar el pago");
    } finally {
      setLoading(false);
    }
  };

  if ((items ?? []).length === 0) {
    return (
      <div className="max-w-[1200px] mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold" style={{ color: "#1B2B5E" }}>No hay productos en el carrito</h1>
        <Link href="/tienda" className="mt-4 inline-flex items-center gap-2 text-sm font-semibold" style={{ color: "#1B2B5E" }}>
          <ArrowLeft size={16} /> Ir a la tienda
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-[1200px] mx-auto px-4 py-8 md:py-12">
      <Link href="/carrito" className="inline-flex items-center gap-1 text-sm opacity-60 hover:opacity-100 mb-6">
        <ArrowLeft size={14} /> Volver al carrito
      </Link>

      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-3xl font-extrabold font-display tracking-tight mb-8"
        style={{ color: "#1B2B5E" }}
      >
        Checkout
      </motion.h1>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Form */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <h2 className="font-bold text-lg mb-4" style={{ color: "#1B2B5E" }}>Datos de Contacto</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-semibold block mb-1">Nombre completo *</label>
                  <input
                    type="text"
                    required
                    value={form.name}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, name: e.target.value })}
                    className="w-full px-3 py-2.5 border rounded-md text-sm focus:outline-none focus:ring-2"
                  />
                </div>
                <div>
                  <label className="text-sm font-semibold block mb-1">Email *</label>
                  <input
                    type="email"
                    required
                    value={form.email}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, email: e.target.value })}
                    className="w-full px-3 py-2.5 border rounded-md text-sm focus:outline-none focus:ring-2"
                  />
                </div>
                <div>
                  <label className="text-sm font-semibold block mb-1">Teléfono</label>
                  <input
                    type="tel"
                    value={form.phone}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, phone: e.target.value })}
                    className="w-full px-3 py-2.5 border rounded-md text-sm focus:outline-none focus:ring-2"
                  />
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <h2 className="font-bold text-lg mb-4" style={{ color: "#1B2B5E" }}>Dirección de Envío</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="text-sm font-semibold block mb-1">Dirección</label>
                  <input
                    type="text"
                    value={form.address}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, address: e.target.value })}
                    className="w-full px-3 py-2.5 border rounded-md text-sm focus:outline-none focus:ring-2"
                  />
                </div>
                <div>
                  <label className="text-sm font-semibold block mb-1">Ciudad</label>
                  <input
                    type="text"
                    value={form.city}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, city: e.target.value })}
                    className="w-full px-3 py-2.5 border rounded-md text-sm focus:outline-none focus:ring-2"
                  />
                </div>
                <div>
                  <label className="text-sm font-semibold block mb-1">Departamento</label>
                  <input
                    type="text"
                    value={form.department}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, department: e.target.value })}
                    className="w-full px-3 py-2.5 border rounded-md text-sm focus:outline-none focus:ring-2"
                  />
                </div>
              </div>
              <div className="mt-4">
                <label className="text-sm font-semibold block mb-1">Notas del pedido</label>
                <textarea
                  value={form.notes}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setForm({ ...form, notes: e.target.value })}
                  className="w-full px-3 py-2.5 border rounded-md text-sm focus:outline-none focus:ring-2 h-20 resize-none"
                />
              </div>
            </div>

            {/* Payment Method */}
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <h2 className="font-bold text-lg mb-4" style={{ color: "#1B2B5E" }}>Método de Pago</h2>
              <div className="space-y-3">
                <label className={`flex items-center gap-3 p-4 rounded-md border-2 cursor-pointer transition-all ${paymentMethod === "nequi" ? "border-[#1B2B5E] bg-gray-50" : "border-gray-200 hover:border-gray-400"}`}>
                  <input type="radio" name="payment" value="nequi" checked={paymentMethod === "nequi"} onChange={() => setPaymentMethod("nequi")} className="w-4 h-4" />
                  <CreditCard size={20} style={{ color: "#1B2B5E" }} />
                  <div>
                    <span className="text-sm font-bold block">Nequi / Bancolombia</span>
                    <span className="text-xs opacity-50">Te contactaremos para coordinar el pago</span>
                  </div>
                </label>

                <label className={`flex items-center gap-3 p-4 rounded-md border-2 cursor-pointer transition-all ${paymentMethod === "transfer" ? "border-[#1B2B5E] bg-gray-50" : "border-gray-200 hover:border-gray-400"}`}>
                  <input type="radio" name="payment" value="transfer" checked={paymentMethod === "transfer"} onChange={() => setPaymentMethod("transfer")} className="w-4 h-4" />
                  <Landmark size={20} style={{ color: "#1B2B5E" }} />
                  <div>
                    <span className="text-sm font-bold block">Transferencia Bancaria</span>
                    <span className="text-xs opacity-50">Recibirás los datos para la transferencia</span>
                  </div>
                </label>

                <label className={`flex items-center gap-3 p-4 rounded-md border-2 cursor-pointer transition-all ${paymentMethod === "contraentrega" ? "border-[#1B2B5E] bg-gray-50" : "border-gray-200 hover:border-gray-400"}`}>
                  <input type="radio" name="payment" value="contraentrega" checked={paymentMethod === "contraentrega"} onChange={() => setPaymentMethod("contraentrega")} className="w-4 h-4" />
                  <Truck size={20} style={{ color: "#1B2B5E" }} />
                  <div>
                    <span className="text-sm font-bold block">Pago Contraentrega</span>
                    <span className="text-xs opacity-50">Solo disponible en Acacías, Meta - pagas al recibir</span>
                  </div>
                </label>
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="p-6 rounded-lg sticky top-24" style={{ background: "#f8f9fa" }}>
              <h2 className="font-bold text-lg mb-4" style={{ color: "#1B2B5E" }}>Resumen del Pedido</h2>
              <div className="space-y-3 mb-4">
                {(items ?? []).map((item: CartItem) => (
                  <div key={item?.id} className="flex justify-between text-sm">
                    <span className="truncate mr-2">{item?.name ?? ""} x{item?.quantity ?? 0}</span>
                    <span className="font-semibold flex-shrink-0">
                      {formatPrice(
                        ((item?.wholesalePrice && (item?.quantity ?? 0) >= (item?.wholesaleMinQty ?? 6))
                          ? (item?.wholesalePrice ?? 0)
                          : (item?.price ?? 0)) * (item?.quantity ?? 0)
                      )}
                    </span>
                  </div>
                ))}
              </div>
              <div className="border-t pt-3 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="opacity-60">Subtotal</span>
                  <span>{formatPrice(totals?.subtotal ?? 0)}</span>
                </div>
                {(totals?.discount ?? 0) > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Descuento</span>
                    <span>-{formatPrice(totals.discount)}</span>
                  </div>
                )}
                <div className="flex justify-between font-bold text-lg pt-2 border-t">
                  <span style={{ color: "#1B2B5E" }}>Total</span>
                  <span style={{ color: "#1B2B5E" }}>{formatPrice(totals?.total ?? 0)}</span>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="mt-6 w-full flex items-center justify-center gap-2 py-3.5 text-white font-bold text-sm uppercase tracking-wider rounded-md hover:opacity-90 transition-opacity disabled:opacity-50"
                style={{ background: "#1B2B5E" }}
              >
                {loading ? (
                  <Loader2 size={18} className="animate-spin" />
                ) : (
                  <>
                    {paymentMethod === "transfer" ? <Landmark size={18} /> : paymentMethod === "contraentrega" ? <Truck size={18} /> : <CreditCard size={18} />}
                    Confirmar Pedido
                  </>
                )}
              </button>

              {paymentMethod === "transfer" && (
                <div className="mt-4 p-3 bg-blue-50 rounded-md text-xs text-blue-800 border border-blue-200">
                  <p className="font-semibold mb-1">Transferencia Bancaria:</p>
                  <p>Te enviaremos un correo con los datos bancarios para realizar la transferencia. Una vez confirmado el pago, procesaremos tu pedido.</p>
                </div>
              )}
              {paymentMethod === "contraentrega" && (
                <div className="mt-4 p-3 bg-green-50 rounded-md text-xs text-green-800 border border-green-200">
                  <p className="font-semibold mb-1">Pago Contraentrega:</p>
                  <p>Solo disponible para entregas en <strong>Acacías, Meta</strong>. Pagas en efectivo cuando recibas tu pedido.</p>
                </div>
              )}
              {paymentMethod === "nequi" && (
                <div className="mt-4 p-3 bg-purple-50 rounded-md text-xs text-purple-800 border border-purple-200">
                  <p>Te contactaremos para coordinar el pago por Nequi o Bancolombia.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
