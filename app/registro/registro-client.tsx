"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { UserPlus, Loader2, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";

export function RegistroClient() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [wantWholesale, setWantWholesale] = useState(false);
  const [companyName, setCompanyName] = useState("");
  const [companyNIT, setCompanyNIT] = useState("");
  const [ciudad, setCiudad] = useState("");
  const [departamento, setDepartamento] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password) {
      toast.error("Completa todos los campos");
      return;
    }
    if (password.length < 6) {
      toast.error("La contraseña debe tener al menos 6 caracteres");
      return;
    }
    if (wantWholesale && (!companyName || !companyNIT || !ciudad || !departamento)) {
      toast.error("Completa los datos de empresa para solicitar ser mayorista");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name, email, password,
          companyName: wantWholesale ? companyName : undefined,
          companyNIT: wantWholesale ? companyNIT : undefined,
          city: wantWholesale ? ciudad : undefined,
          department: wantWholesale ? departamento : undefined,
          wantWholesale,
        }),
      });
      const data = await res.json();

      if (!res.ok) {
        toast.error(data?.error ?? "Error al crear la cuenta");
        return;
      }

      const signInRes = await signIn?.("credentials", {
        email,
        password,
        redirect: false,
      });

      if (signInRes?.error) {
        toast.error("Cuenta creada. Por favor inicia sesión.");
        router.replace("/login");
      } else {
        if (wantWholesale) {
          toast.success("Solicitud enviada. Te contactaremos pronto.");
        }
        router.replace("/");
      }
    } catch {
      toast.error("Error al crear la cuenta");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: "#f8f9fa" }}>
      <div className="w-full max-w-md mx-4">
        <div className="text-center mb-8">
          <Link href="/">
            <h1 className="text-3xl font-extrabold font-display tracking-tight" style={{ color: "#1B2B5E" }}>
              CASTOM<span className="text-sm">.CO</span>
            </h1>
          </Link>
          <p className="text-xs font-mono uppercase tracking-[0.2em] opacity-40 mt-1">Built Different. Made For You.</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white p-8 rounded-lg shadow-sm border">
          <h2 className="text-xl font-bold mb-6" style={{ color: "#1B2B5E" }}>Crear Cuenta</h2>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-semibold block mb-1">Nombre</label>
              <input
                type="text" required value={name}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setName(e.target.value)}
                className="w-full px-3 py-2.5 border rounded-md text-sm focus:outline-none focus:ring-2"
              />
            </div>
            <div>
              <label className="text-sm font-semibold block mb-1">Email</label>
              <input
                type="email" required value={email}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
                className="w-full px-3 py-2.5 border rounded-md text-sm focus:outline-none focus:ring-2"
              />
            </div>
            <div>
              <label className="text-sm font-semibold block mb-1">Contraseña</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"} required value={password}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
                  className="w-full px-3 py-2.5 pr-10 border rounded-md text-sm focus:outline-none focus:ring-2"
                  placeholder="Mínimo 6 caracteres"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 opacity-40 hover:opacity-100"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div className="pt-2 border-t">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={wantWholesale}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setWantWholesale(e.target.checked)}
                  className="w-4 h-4"
                />
                <span className="text-sm font-semibold" style={{ color: "#1B2B5E" }}>
                  Quiero comprar al por mayor
                </span>
              </label>
            </div>

            {wantWholesale && (
              <div className="space-y-4 p-4 bg-gray-50 rounded-md border">
                <p className="text-xs font-semibold uppercase tracking-wider opacity-50">Datos de empresa</p>
                <div>
                  <label className="text-sm font-semibold block mb-1">Nombre de la empresa</label>
                  <input type="text" required value={companyName}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCompanyName(e.target.value)}
                    className="w-full px-3 py-2 border rounded-md text-sm" />
                </div>
                <div>
                  <label className="text-sm font-semibold block mb-1">NIT / RUT</label>
                  <input type="text" required value={companyNIT}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCompanyNIT(e.target.value)}
                    className="w-full px-3 py-2 border rounded-md text-sm" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-sm font-semibold block mb-1">Ciudad</label>
                    <input type="text" required value={ciudad}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCiudad(e.target.value)}
                      className="w-full px-3 py-2 border rounded-md text-sm" />
                  </div>
                  <div>
                    <label className="text-sm font-semibold block mb-1">Departamento</label>
                    <input type="text" required value={departamento}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDepartamento(e.target.value)}
                      className="w-full px-3 py-2 border rounded-md text-sm" />
                  </div>
                </div>
              </div>
            )}

            <button
              type="submit" disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3 text-white font-bold text-sm uppercase tracking-wider rounded-md hover:opacity-90 disabled:opacity-50"
              style={{ background: "#1B2B5E" }}
            >
              {loading ? <Loader2 size={16} className="animate-spin" /> : <UserPlus size={16} />}
              Crear Cuenta
            </button>
          </div>
          <p className="text-center text-sm mt-4 opacity-50">
            ¿Ya tienes cuenta?{" "}
            <Link href="/login" className="font-semibold hover:opacity-100" style={{ color: "#1B2B5E" }}>Iniciar Sesión</Link>
          </p>
        </form>
      </div>
    </div>
  );
}
