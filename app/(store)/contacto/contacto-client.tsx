"use client";

import { useState } from "react";
import { Send, Loader2, CheckCircle, Globe, Mail } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";

export function ContactoClient() {
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) {
      toast.error("Completa los campos requeridos");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        setSent(true);
        toast.success("Mensaje enviado exitosamente");
      } else {
        toast.error("Error al enviar el mensaje");
      }
    } catch {
      toast.error("Error al enviar el mensaje");
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <div className="max-w-[600px] mx-auto px-4 py-16 text-center">
        <CheckCircle size={48} className="mx-auto mb-4" style={{ color: "#1B2B5E" }} />
        <h1 className="text-2xl font-bold" style={{ color: "#1B2B5E" }}>¡Mensaje Enviado!</h1>
        <p className="mt-2 opacity-50">Nos pondremos en contacto contigo pronto.</p>
      </div>
    );
  }

  return (
    <div className="max-w-[800px] mx-auto px-4 py-12 md:py-16">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-extrabold font-display tracking-tight" style={{ color: "#1B2B5E" }}>Contacto</h1>
        <p className="mt-2 opacity-60">Escríbenos y cotiza tu pedido o resuelve tus dudas</p>
      </motion.div>

      <form onSubmit={handleSubmit} className="mt-8 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-semibold block mb-1">Nombre *</label>
            <input
              type="text" required value={form.name}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, name: e.target.value })}
              className="w-full px-3 py-2.5 border rounded-md text-sm focus:outline-none focus:ring-2"
            />
          </div>
          <div>
            <label className="text-sm font-semibold block mb-1">Email *</label>
            <input
              type="email" required value={form.email}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, email: e.target.value })}
              className="w-full px-3 py-2.5 border rounded-md text-sm focus:outline-none focus:ring-2"
            />
          </div>
        </div>
        <div>
          <label className="text-sm font-semibold block mb-1">Asunto</label>
          <input
            type="text" value={form.subject}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, subject: e.target.value })}
            className="w-full px-3 py-2.5 border rounded-md text-sm focus:outline-none focus:ring-2"
          />
        </div>
        <div>
          <label className="text-sm font-semibold block mb-1">Mensaje *</label>
          <textarea
            required value={form.message}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setForm({ ...form, message: e.target.value })}
            className="w-full px-3 py-2.5 border rounded-md text-sm focus:outline-none focus:ring-2 h-32 resize-none"
          />
        </div>
        <button
          type="submit" disabled={loading}
          className="flex items-center gap-2 px-6 py-3 text-white font-bold text-sm uppercase tracking-wider rounded-md hover:opacity-90 disabled:opacity-50"
          style={{ background: "#1B2B5E" }}
        >
          {loading ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
          Enviar Mensaje
        </button>
        <p className="text-xs opacity-40">Tu información será almacenada de forma segura.</p>
      </form>
    </div>
  );
}
