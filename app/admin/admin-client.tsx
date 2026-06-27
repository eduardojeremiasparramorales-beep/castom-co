"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Package, ShoppingBag, Plus, Edit, Trash2, Eye, EyeOff, Loader2, X, Upload, Image as ImageIcon } from "lucide-react";
import { toast } from "sonner";
import Image from "next/image";

export function AdminClient() {
  const { data: session, status } = useSession() || {};
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"products" | "orders">("products");
  const [products, setProducts] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [categories, setCategories] = useState<any[]>([]);

  const isAdmin = (session?.user as any)?.role === "admin";

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/login");
    }
  }, [status, router]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [prodRes, orderRes, catRes] = await Promise.all([
        fetch("/api/admin/products"),
        fetch("/api/admin/orders"),
        fetch("/api/categories"),
      ]);
      const prodData = await prodRes.json();
      const orderData = await orderRes.json();
      const catData = await catRes.json();
      setProducts(Array.isArray(prodData) ? prodData : []);
      setOrders(Array.isArray(orderData) ? orderData : []);
      setCategories(Array.isArray(catData) ? catData : []);
    } catch {
      toast.error("Error al cargar datos");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isAdmin) fetchData();
  }, [isAdmin, fetchData]);

  const formatPrice = (p: number) =>
    new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", minimumFractionDigits: 0 }).format(p ?? 0);

  if (status === "loading") {
    return <div className="flex items-center justify-center min-h-[400px]"><Loader2 className="animate-spin" size={32} /></div>;
  }

  if (!isAdmin) {
    return (
      <div className="max-w-[1200px] mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold" style={{ color: "#1B2B5E" }}>Acceso Denegado</h1>
        <p className="mt-2 opacity-50">No tienes permisos de administrador.</p>
      </div>
    );
  }

  const handleToggleActive = async (id: string, currentActive: boolean) => {
    try {
      await fetch(`/api/admin/products/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ active: !currentActive }),
      });
      fetchData();
      toast.success(currentActive ? "Producto desactivado" : "Producto activado");
    } catch {
      toast.error("Error al actualizar");
    }
  };

  const handleUpdateStock = async (id: string, stock: number) => {
    try {
      await fetch(`/api/admin/products/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stock }),
      });
      fetchData();
      toast.success("Stock actualizado");
    } catch {
      toast.error("Error al actualizar stock");
    }
  };

  return (
    <div className="max-w-[1200px] mx-auto px-4 py-8">
      <h1 className="text-3xl font-extrabold font-display tracking-tight" style={{ color: "#1B2B5E" }}>
        Panel de Administración
      </h1>

      {/* Tabs */}
      <div className="flex gap-2 mt-6 mb-8">
        <button
          onClick={() => setActiveTab("products")}
          className={`flex items-center gap-2 px-4 py-2 text-sm font-bold uppercase tracking-wider rounded-md transition-colors ${
            activeTab === "products" ? "text-white" : "text-gray-600 bg-white border"
          }`}
          style={activeTab === "products" ? { background: "#1B2B5E" } : {}}
        >
          <Package size={16} /> Productos ({products?.length ?? 0})
        </button>
        <button
          onClick={() => setActiveTab("orders")}
          className={`flex items-center gap-2 px-4 py-2 text-sm font-bold uppercase tracking-wider rounded-md transition-colors ${
            activeTab === "orders" ? "text-white" : "text-gray-600 bg-white border"
          }`}
          style={activeTab === "orders" ? { background: "#1B2B5E" } : {}}
        >
          <ShoppingBag size={16} /> Pedidos ({orders?.length ?? 0})
        </button>
      </div>

      {/* Products Tab */}
      {activeTab === "products" && (
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-bold text-lg" style={{ color: "#1B2B5E" }}>Productos</h2>
            <button
              onClick={() => { setEditingProduct(null); setShowForm(true); }}
              className="flex items-center gap-2 px-4 py-2 text-white text-sm font-bold rounded-md"
              style={{ background: "#1B2B5E" }}
            >
              <Plus size={16} /> Nuevo Producto
            </button>
          </div>

          {loading ? (
            <div className="text-center py-8"><Loader2 className="animate-spin mx-auto" /></div>
          ) : (
            <div className="bg-white rounded-lg border overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-gray-50">
                    <th className="text-left p-3 font-semibold">Producto</th>
                    <th className="text-left p-3 font-semibold">Categoría</th>
                    <th className="text-right p-3 font-semibold">Precio</th>
                    <th className="text-right p-3 font-semibold">Mayorista</th>
                    <th className="text-right p-3 font-semibold">Stock</th>
                    <th className="text-center p-3 font-semibold">Estado</th>
                    <th className="text-center p-3 font-semibold">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {(products ?? []).map((p: any) => (
                    <tr key={p?.id} className="border-b hover:bg-gray-50">
                      <td className="p-3">
                        <div className="flex items-center gap-3">
                          {p?.images?.[0]?.url && (
                            <div className="relative w-10 h-10 rounded bg-gray-100 overflow-hidden flex-shrink-0">
                              <Image src={p.images[0].url} alt="" fill className="object-cover" sizes="40px" />
                            </div>
                          )}
                          <div>
                            <span className="font-semibold" style={{ color: "#1B2B5E" }}>{p?.name ?? ""}</span>
                            <p className="text-xs opacity-40 font-mono">{p?.sku ?? ""}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-3 opacity-60">{p?.category?.name ?? ""}</td>
                      <td className="p-3 text-right font-semibold">{formatPrice(p?.price ?? 0)}</td>
                      <td className="p-3 text-right">{p?.wholesalePrice ? formatPrice(p.wholesalePrice) : "-"}</td>
                      <td className="p-3 text-right">
                        <input
                          type="number"
                          defaultValue={p?.stock ?? 0}
                          className="w-16 px-2 py-1 border rounded text-right text-sm"
                          onBlur={(e: React.FocusEvent<HTMLInputElement>) => {
                            const val = parseInt(e.target.value);
                            if (!isNaN(val) && val !== p?.stock) handleUpdateStock(p?.id, val);
                          }}
                        />
                      </td>
                      <td className="p-3 text-center">
                        <span className={`px-2 py-1 text-xs font-bold rounded ${p?.active ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"}`}>
                          {p?.active ? "Activo" : "Inactivo"}
                        </span>
                      </td>
                      <td className="p-3 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => { setEditingProduct(p); setShowForm(true); }}
                            className="p-1.5 rounded hover:bg-gray-100"
                            title="Editar"
                          >
                            <Edit size={14} />
                          </button>
                          <button
                            onClick={() => handleToggleActive(p?.id, p?.active)}
                            className="p-1.5 rounded hover:bg-gray-100"
                            title={p?.active ? "Desactivar" : "Activar"}
                          >
                            {p?.active ? <EyeOff size={14} /> : <Eye size={14} />}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Orders Tab */}
      {activeTab === "orders" && (
        <div>
          <h2 className="font-bold text-lg mb-4" style={{ color: "#1B2B5E" }}>Pedidos</h2>
          {loading ? (
            <div className="text-center py-8"><Loader2 className="animate-spin mx-auto" /></div>
          ) : (orders ?? []).length === 0 ? (
            <p className="text-center py-8 opacity-50">No hay pedidos aún</p>
          ) : (
            <div className="space-y-4">
              {(orders ?? []).map((order: any) => (
                <div key={order?.id} className="bg-white p-4 rounded-lg border">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 mb-3">
                    <div>
                      <span className="font-bold font-mono" style={{ color: "#1B2B5E" }}>{order?.orderNumber ?? ""}</span>
                      <span className={`ml-2 px-2 py-0.5 text-xs font-bold rounded ${
                        order?.status === "pagado" ? "bg-green-100 text-green-700" :
                        order?.status === "pendiente" ? "bg-yellow-100 text-yellow-700" :
                        "bg-gray-100 text-gray-600"
                      }`}>
                        {order?.status ?? ""}
                      </span>
                    </div>
                    <span className="text-sm opacity-50">
                      {order?.createdAt ? new Date(order.createdAt).toLocaleDateString("es-CO", { timeZone: "America/Bogota" }) : ""}
                    </span>
                  </div>
                  <div className="text-sm space-y-1">
                    <p><strong>Cliente:</strong> {order?.customerName ?? ""} ({order?.customerEmail ?? ""})</p>
                    {order?.shippingAddress && <p><strong>Dirección:</strong> {order.shippingAddress}, {order?.city ?? ""}</p>}
                    <div className="mt-2">
                      {(order?.items ?? []).map((item: any) => (
                        <p key={item?.id} className="text-xs opacity-60">
                          {item?.productName ?? ""} {item?.variantName ? `(${item.variantName})` : ""} x{item?.quantity ?? 0} — {formatPrice(item?.totalPrice ?? 0)}
                        </p>
                      ))}
                    </div>
                    <div className="border-t pt-2 mt-2 flex justify-between">
                      <span className="font-bold" style={{ color: "#1B2B5E" }}>Total</span>
                      <span className="font-bold" style={{ color: "#1B2B5E" }}>{formatPrice(order?.total ?? 0)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Product Form Modal */}
      {showForm && (
        <ProductFormModal
          product={editingProduct}
          categories={categories}
          onClose={() => { setShowForm(false); setEditingProduct(null); }}
          onSaved={() => { setShowForm(false); setEditingProduct(null); fetchData(); }}
        />
      )}
    </div>
  );
}

function ProductFormModal({ product, categories, onClose, onSaved }: {
  product: any;
  categories: any[];
  onClose: () => void;
  onSaved: () => void;
}) {
  const isEdit = !!product;
  const [form, setForm] = useState({
    name: product?.name ?? "",
    description: product?.description ?? "",
    price: product?.price?.toString() ?? "",
    wholesalePrice: product?.wholesalePrice?.toString() ?? "",
    wholesaleMinQty: product?.wholesaleMinQty ?? 6,
    sku: product?.sku ?? "",
    stock: product?.stock ?? 0,
    categoryId: product?.categoryId ?? (categories?.[0]?.id ?? ""),
    featured: product?.featured ?? false,
  });
  const [imageUrls, setImageUrls] = useState<string[]>(
    (product?.images ?? []).map((img: any) => img?.url ?? "")
  );
  const [newImageUrl, setNewImageUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  const handleUploadImage = async (file: File) => {
    setUploading(true);
    try {
      const res = await fetch("/api/upload/presigned", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fileName: file.name, contentType: file.type, isPublic: true }),
      });
      const { uploadUrl, cloud_storage_path } = await res.json();

      await fetch(uploadUrl, {
        method: "PUT",
        headers: { "Content-Type": file.type },
        body: file,
      });

      const urlRes = await fetch("/api/upload/get-url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cloud_storage_path, contentType: file.type, isPublic: true }),
      });
      const { url } = await urlRes.json();
      setImageUrls((prev: string[]) => [...prev, url]);
      toast.success("Imagen subida exitosamente");
    } catch {
      toast.error("Error al subir imagen");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.price || !form.sku || !form.categoryId) {
      toast.error("Completa los campos requeridos");
      return;
    }
    setLoading(true);
    try {
      const payload = {
        ...form,
        images: imageUrls.map((url: string, i: number) => ({ url, alt: form.name, position: i, isPublic: true })),
      };

      if (isEdit) {
        await fetch(`/api/admin/products/${product.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        toast.success("Producto actualizado");
      } else {
        await fetch("/api/admin/products", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        toast.success("Producto creado");
      }
      onSaved();
    } catch {
      toast.error("Error al guardar");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold" style={{ color: "#1B2B5E" }}>
            {isEdit ? "Editar Producto" : "Nuevo Producto"}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded"><X size={20} /></button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-semibold block mb-1">Nombre *</label>
              <input type="text" required value={form.name}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, name: e.target.value })}
                className="w-full px-3 py-2 border rounded-md text-sm" />
            </div>
            <div>
              <label className="text-sm font-semibold block mb-1">SKU *</label>
              <input type="text" required value={form.sku}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, sku: e.target.value })}
                className="w-full px-3 py-2 border rounded-md text-sm" />
            </div>
            <div>
              <label className="text-sm font-semibold block mb-1">Precio *</label>
              <input type="number" required value={form.price}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, price: e.target.value })}
                className="w-full px-3 py-2 border rounded-md text-sm" />
            </div>
            <div>
              <label className="text-sm font-semibold block mb-1">Precio Mayorista</label>
              <input type="number" value={form.wholesalePrice}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, wholesalePrice: e.target.value })}
                className="w-full px-3 py-2 border rounded-md text-sm" />
            </div>
            <div>
              <label className="text-sm font-semibold block mb-1">Mínimo Mayorista</label>
              <input type="number" value={form.wholesaleMinQty}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, wholesaleMinQty: parseInt(e.target.value) || 6 })}
                className="w-full px-3 py-2 border rounded-md text-sm" />
            </div>
            <div>
              <label className="text-sm font-semibold block mb-1">Stock</label>
              <input type="number" value={form.stock}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, stock: parseInt(e.target.value) || 0 })}
                className="w-full px-3 py-2 border rounded-md text-sm" />
            </div>
            <div>
              <label className="text-sm font-semibold block mb-1">Categoría *</label>
              <select value={form.categoryId}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setForm({ ...form, categoryId: e.target.value })}
                className="w-full px-3 py-2 border rounded-md text-sm">
                {(categories ?? []).map((c: any) => <option key={c?.id} value={c?.id}>{c?.name ?? ""}</option>)}
              </select>
            </div>
            <div className="flex items-center gap-2 pt-6">
              <input type="checkbox" checked={form.featured}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, featured: e.target.checked })}
                className="w-4 h-4" />
              <label className="text-sm font-semibold">Destacado</label>
            </div>
          </div>

          <div>
            <label className="text-sm font-semibold block mb-1">Descripción</label>
            <textarea value={form.description}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setForm({ ...form, description: e.target.value })}
              className="w-full px-3 py-2 border rounded-md text-sm h-20 resize-none" />
          </div>

          {/* Images */}
          <div>
            <label className="text-sm font-semibold block mb-2">Imágenes</label>
            <div className="flex gap-2 flex-wrap mb-2">
              {(imageUrls ?? []).map((url: string, i: number) => (
                <div key={i} className="relative w-16 h-16 rounded border overflow-hidden group">
                  <Image src={url} alt="" fill className="object-cover" sizes="64px" />
                  <button
                    type="button"
                    onClick={() => setImageUrls((prev: string[]) => prev.filter((_: string, idx: number) => idx !== i))}
                    className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X size={14} className="text-white" />
                  </button>
                </div>
              ))}
              <label className="w-16 h-16 border-2 border-dashed rounded flex items-center justify-center cursor-pointer hover:bg-gray-50">
                {uploading ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} className="opacity-40" />}
                <input type="file" accept="image/*" className="hidden"
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    const file = e.target.files?.[0];
                    if (file) handleUploadImage(file);
                  }} />
              </label>
            </div>
            <div className="flex gap-2">
              <input type="text" placeholder="O pega URL de imagen" value={newImageUrl}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewImageUrl(e.target.value)}
                className="flex-1 px-3 py-1.5 border rounded-md text-sm" />
              <button type="button" onClick={() => {
                if (newImageUrl) { setImageUrls((prev: string[]) => [...prev, newImageUrl]); setNewImageUrl(""); }
              }} className="px-3 py-1.5 text-xs font-bold rounded-md border hover:bg-gray-50">Agregar</button>
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button type="button" onClick={onClose}
              className="px-4 py-2 text-sm font-semibold border rounded-md hover:bg-gray-50">Cancelar</button>
            <button type="submit" disabled={loading}
              className="flex items-center gap-2 px-6 py-2 text-white text-sm font-bold rounded-md disabled:opacity-50"
              style={{ background: "#1B2B5E" }}>
              {loading ? <Loader2 size={14} className="animate-spin" /> : null}
              {isEdit ? "Actualizar" : "Crear Producto"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
