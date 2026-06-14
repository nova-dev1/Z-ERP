"use client";
import { useState, useEffect } from "react";
import { Search, Plus, Filter, X } from "lucide-react";
import { useApp } from "@/context/AppContext";
import Header from "@/components/Header";
import { supabase } from "@/lib/supabase";

type Product = { id: string; code: string; name: string; category: string; price_dzd: number; cost_price_dzd: number; stock: number; status: string; };

const statusStyle: Record<string, { bg: string; color: string }> = {
  active: { bg: "#DCFCE7", color: "#16a34a" }, low: { bg: "#FEF9C3", color: "#ca8a04" },
  critical: { bg: "#FEE2E2", color: "#dc2626" }, out: { bg: "#F3F4F6", color: "#6b7280" },
};
const statusKeys: Record<string, string> = { active: "active", low: "low", critical: "critical", out: "inactive" };
const emptyForm = { code: "", name: "", category: "", price_dzd: 0, cost_price_dzd: 0, stock: 0, status: "active" };

export default function Products() {
  const { t, fmt, darkMode } = useApp();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const card = darkMode ? "#1C1C1C" : "#fff";
  const border = darkMode ? "#2A2A2A" : "#F0F0F0";
  const text = darkMode ? "#F0F0F0" : "#1A1A1A";
  const muted = darkMode ? "#888" : "#aaa";
  const inputStyle = { width: "100%", padding: "9px 12px", border: `1.5px solid ${darkMode ? "#3A3A3A" : "#E5E7EB"}`, borderRadius: 8, fontSize: 13, outline: "none", boxSizing: "border-box" as const, background: darkMode ? "#2A2A2A" : "#fff", color: text };

  const load = async () => { setLoading(true); const { data } = await supabase.from("products").select("*").order("created_at", { ascending: false }); setProducts(data || []); setLoading(false); };
  useEffect(() => { load(); }, []);
  const openAdd = () => { setEditing(null); setForm(emptyForm); setModal(true); };
  const openEdit = (p: Product) => { setEditing(p); setForm({ code: p.code, name: p.name, category: p.category, price_dzd: p.price_dzd, cost_price_dzd: p.cost_price_dzd || 0, stock: p.stock, status: p.status }); setModal(true); };
  const save = async () => { setSaving(true); if (editing) { await supabase.from("products").update(form).eq("id", editing.id); } else { await supabase.from("products").insert(form); } setSaving(false); setModal(false); load(); };
  const del = async (id: string) => { if (!confirm("Supprimer ?")) return; await supabase.from("products").delete().eq("id", id); load(); };
  const filtered = products.filter(p => p.name.toLowerCase().includes(q.toLowerCase()));

  return (
    <div style={{ padding: "28px 32px" }}>
      <Header title={t("products")} subtitle={`${products.length} ${t("total_products")}`} />
      <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginBottom: 20 }}>
        <div style={{ position: "relative" }}>
          <Search size={14} style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: muted }} />
          <input value={q} onChange={e => setQ(e.target.value)} placeholder={t("search")} style={{ paddingLeft: 30, paddingRight: 12, paddingTop: 8, paddingBottom: 8, border: `1px solid ${darkMode ? "#3A3A3A" : "#E5E7EB"}`, borderRadius: 8, fontSize: 13, outline: "none", width: 200, background: card, color: text }} />
        </div>
        <button style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 14px", border: `1px solid ${darkMode ? "#3A3A3A" : "#E5E7EB"}`, borderRadius: 8, background: card, color: text, fontSize: 13, cursor: "pointer" }}><Filter size={14} /> {t("filter")}</button>
        <button onClick={openAdd} style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 16px", background: "#C8F000", border: "none", borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: "pointer", color: "#1C1C1C" }}><Plus size={14} /> {t("add_product")}</button>
      </div>

      <div style={{ background: card, borderRadius: 12, boxShadow: "0 1px 3px rgba(0,0,0,0.07)", overflow: "hidden" }}>
        {loading ? <div style={{ padding: 40, textAlign: "center", color: muted }}>Chargement...</div> : (
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead>
              <tr style={{ background: darkMode ? "#2A2A2A" : "#F9F9F9", borderBottom: `1px solid ${border}` }}>
                {["Code", t("product"), "Catégorie", t("cost_price"), t("sell_price"), t("profit"), t("qty"), t("status"), ""].map((h, i) => (
                  <th key={i} style={{ textAlign: "left", padding: "12px 16px", color: muted, fontWeight: 500, fontSize: 12 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={9} style={{ padding: 40, textAlign: "center", color: muted }}>Aucun produit</td></tr>
              ) : filtered.map(p => {
                const st = statusStyle[p.status] || statusStyle.active;
                const profit = (p.price_dzd || 0) - (p.cost_price_dzd || 0);
                const margin = p.price_dzd ? ((profit / p.price_dzd) * 100).toFixed(1) : "0";
                return (
                  <tr key={p.id} style={{ borderBottom: `1px solid ${border}` }}>
                    <td style={{ padding: "13px 16px", color: muted, fontSize: 12 }}>{p.code}</td>
                    <td style={{ padding: "13px 16px", fontWeight: 500, color: text }}>{p.name}</td>
                    <td style={{ padding: "13px 16px", color: muted }}>{p.category}</td>
                    <td style={{ padding: "13px 16px", color: muted }}>{fmt(p.cost_price_dzd || 0)}</td>
                    <td style={{ padding: "13px 16px", fontWeight: 600, color: text }}>{fmt(p.price_dzd)}</td>
                    <td style={{ padding: "13px 16px" }}>
                      <span style={{ color: profit >= 0 ? "#16a34a" : "#dc2626", fontWeight: 700 }}>{fmt(profit)}</span>
                      <span style={{ color: muted, fontSize: 11, marginLeft: 4 }}>({margin}%)</span>
                    </td>
                    <td style={{ padding: "13px 16px", color: text }}>{p.stock}</td>
                    <td style={{ padding: "13px 16px" }}><span style={{ background: st.bg, color: st.color, padding: "3px 10px", borderRadius: 10, fontSize: 11, fontWeight: 600 }}>{t(statusKeys[p.status] || "active")}</span></td>
                    <td style={{ padding: "13px 16px" }}><div style={{ display: "flex", gap: 6 }}>
                      <button onClick={() => openEdit(p)} style={{ fontSize: 12, color: "#C8F000", background: "#1C1C1C", border: "none", padding: "4px 12px", borderRadius: 6, cursor: "pointer", fontWeight: 600 }}>{t("edit")}</button>
                      <button onClick={() => del(p.id)} style={{ fontSize: 12, color: "#dc2626", background: "#FEE2E2", border: "none", padding: "4px 12px", borderRadius: 6, cursor: "pointer", fontWeight: 600 }}>✕</button>
                    </div></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {modal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100 }}>
          <div style={{ background: card, borderRadius: 16, padding: 28, width: 480, boxShadow: "0 20px 60px rgba(0,0,0,0.3)", maxHeight: "90vh", overflowY: "auto" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <h2 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: text }}>{editing ? t("edit") : t("add_product")}</h2>
              <button onClick={() => setModal(false)} style={{ background: "none", border: "none", cursor: "pointer", color: text }}><X size={18} /></button>
            </div>
            {([
              ["Code", "code", "text"],
              [t("product"), "name", "text"],
              ["Catégorie", "category", "text"],
              [t("cost_price"), "cost_price_dzd", "number"],
              [t("sell_price"), "price_dzd", "number"],
              [t("qty"), "stock", "number"],
            ] as [string, string, string][]).map(([label, key, type]) => (
              <div key={key} style={{ marginBottom: 14 }}>
                <label style={{ fontSize: 12, fontWeight: 600, color: muted, display: "block", marginBottom: 4 }}>{label}</label>
                <input type={type} value={(form as any)[key]} onChange={e => setForm({ ...form, [key]: type === "number" ? Number(e.target.value) : e.target.value })} style={inputStyle} />
                {(key === "price_dzd" || key === "cost_price_dzd") && form.price_dzd > 0 && form.cost_price_dzd > 0 && (
                  <p style={{ fontSize: 11, color: form.price_dzd > form.cost_price_dzd ? "#16a34a" : "#dc2626", margin: "4px 0 0" }}>
                    {t("profit")}: {fmt(form.price_dzd - form.cost_price_dzd)} ({((( form.price_dzd - form.cost_price_dzd) / form.price_dzd) * 100).toFixed(1)}%)
                  </p>
                )}
              </div>
            ))}
            <div style={{ marginBottom: 20 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: muted, display: "block", marginBottom: 4 }}>{t("status")}</label>
              <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })} style={inputStyle}>
                {["active", "low", "critical", "out"].map(s => <option key={s} value={s}>{t(statusKeys[s])}</option>)}
              </select>
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={() => setModal(false)} style={{ flex: 1, padding: "10px", border: `1.5px solid ${darkMode ? "#3A3A3A" : "#E5E7EB"}`, borderRadius: 8, background: card, color: text, fontSize: 13, cursor: "pointer" }}>Annuler</button>
              <button onClick={save} disabled={saving} style={{ flex: 1, padding: "10px", background: "#C8F000", border: "none", borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: "pointer", color: "#1C1C1C" }}>{saving ? "..." : "Enregistrer"}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
