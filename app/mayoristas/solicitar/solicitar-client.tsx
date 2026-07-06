"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Loader2, ArrowLeft, TrendingDown, CheckCircle, Clock } from "lucide-react";
import { toast } from "sonner";

export function SolicitarMayoristaClient() {
  const { data: session, status } = useSession() || {};
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({
    companyName: "",
    companyNIT: "",
    companyPhone: "",
    ciudad: "",
    departamento: "",
  });

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/login");
      return;
    }
    if (session?.user) {
      const user = session.user as any;
      if (user.wholesaleStatus === "approved") {
        setSubmitted(true);
      }
      if (user.wholesaleStatus === "pending") {
        setSubmitted(true);
      }
    }
  }, [status, session, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.companyName || !form.companyNIT || !form.ciudad || !form.departamento) {
      toast.error("Completa todos los campos requeridos");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/wholesale/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data?.error ?? "Error al enviar solicitud");
        return;
      }
      toast.success("Solicitud enviada correctamente");
      setSubmitted(true);
    } catch {
      toast.error("Error al enviar solicitud");
    } finally {
      setLoading(false);
    }
  };

  if (status === "loading") {
    return <div className="flex items-center justify-center min-h-[400px]"><Loader2 className="animate-spin" size={32} /></div>;
  }

  if (submitted) {
    const user = session?.user as any;
    const isApproved = user?.wholesaleStatus === "approved";
    const isPending = user?.wholesaleStatus === "pending";
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#f8f9fa" }}>
        <div className="max-w-md mx-auto px-4 text-center">
          {isApproved ? (
            <>
              <CheckCircle size={64} className="mx-auto mb-4 text-green-500" />
              <h1 className="text-2xl font-bold font-display mb-2" style={{ color: "#1B2B5E" }}>¡Ya tienes acceso mayorista!</h1>
              <p className="text-sm opacity-60 mb-6">Disfruta de precios especiales en todos nuestros productos.</p>
              <Link href="/mayoristas" className="inline-flex items-center gap-2 px-6 py-3 text-white font-bold rounded-md" style={{ background: "#1B2B5E" }}>
                Ver productos mayoristas
              </Link>
            </>
          ) : (
            <>
              <Clock size={64} className="mx-auto mb-4" style={{ color: "#1B2B5E" }} />
              <h1 className="text-2xl font-bold font-display mb-2" style={{ color: "#1B2B5E" }}>Solicitud Enviada</h1>
              <p className="text-sm opacity-60 mb-2">Hemos recibido tu solicitud para ser mayorista.</p>
              <p className="text-sm opacity-60 mb-6">Te contactaremos pronto para confirmar tu acceso.</p>
              <Link href="/" className="text-sm font-semibold underline" style={{ color: "#1B2B5E" }}>Volver al inicio</Link>
            </>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: "#f8f9fa" }}>
      <div className="w-full max-w-md mx-4">
        <Link href="/mayoristas" className="inline-flex items-center gap-1 text-sm opacity-60 hover:opacity-100 mb-6">
          <ArrowLeft size={14} /> Volver
        </Link>

        <div className="bg-white p-8 rounded-lg shadow-sm border">
          <div className="text-center mb-6">
            <TrendingDown size={32} className="mx-auto mb-2" style={{ color: "#1B2B5E" }} />
            <h1 className="text-xl font-bold font-display" style={{ color: "#1B2B5E" }}>Solicitar Acceso Mayorista</h1>
            <p className="text-sm opacity-50 mt-1">Completa los datos de tu empresa</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm font-semibold block mb-1">Nombre de la empresa *</label>
              <input type="text" required value={form.companyName}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, companyName: e.target.value })}
                className="w-full px-3 py-2.5 border rounded-md text-sm focus:outline-none focus:ring-2" />
            </div>
            <div>
              <label className="text-sm font-semibold block mb-1">NIT / RUT *</label>
              <input type="text" required value={form.companyNIT}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, companyNIT: e.target.value })}
                className="w-full px-3 py-2.5 border rounded-md text-sm focus:outline-none focus:ring-2" />
            </div>
            <div>
              <label className="text-sm font-semibold block mb-1">Teléfono</label>
              <input type="tel" value={form.companyPhone}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, companyPhone: e.target.value })}
                className="w-full px-3 py-2.5 border rounded-md text-sm focus:outline-none focus:ring-2" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-semibold block mb-1">Ciudad *</label>
                <input type="text" required value={form.ciudad}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, ciudad: e.target.value })}
                  className="w-full px-3 py-2.5 border rounded-md text-sm focus:outline-none focus:ring-2" />
              </div>
              <div>
                <label className="text-sm font-semibold block mb-1">Departamento *</label>
                <input type="text" required value={form.departamento}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, departamento: e.target.value })}
                  className="w-full px-3 py-2.5 border rounded-md text-sm focus:outline-none focus:ring-2" />
              </div>
            </div>
            <button type="submit" disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3 text-white font-bold text-sm uppercase tracking-wider rounded-md hover:opacity-90 disabled:opacity-50"
              style={{ background: "#1B2B5E" }}>
              {loading ? <Loader2 size={16} className="animate-spin" /> : null}
              Enviar Solicitud
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
