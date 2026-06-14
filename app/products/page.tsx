"use client";
import { useState, useEffect } from "react";
import { Search, Plus, Filter, X } from "lucide-react";
import { useApp } from "@/context/AppContext";
import Header from "@/components/Header";
import { supabase } from "@/lib/supabase";

type Product = { id: string; code: string; name: string; category: string; price_dzd: number; stock: number; status: string; };
const statusStyle: Record<string, { bg: string; color: string }> = {
  active: { bg: "#DCFCE7", color: "#16a34a" }, low: { bg: "#FEF9C3", color: "#ca8a04" },
  critical: { bg: "#FEE2E2", color: "#dc2626" }, out: { bg: "#F3F4F6", color: "#6b7280" },
};
const statusKeys: Record<string, string> = { active: "active", low: "low", critical: "critical", out: "inactive" };
const emptyForm = { code: "", name: "", category: "", price_dzd: 0, stock: 0, status: "active" };

export default function Products() {
  const { t, fmt } = useApp();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const load = async () => { setLoading(true); const { data } = await supabase.from("products").select("*").order("created_at", { ascending: false }); setProducts(data || []); setLoading(false); };
  useEffect(() => { load(); }, []);
  const openAdd = () => { setEditing(null); setForm(emptyForm); setModal(true); };
  const openEdit = (p: Product) => { setEditing(p); setForm({ code: p.code, name: p.name, category: p.category, price_dzd: p.price_dzd, stock: p.stock, status: p.status }); setModal(true); };
  const save = async () => { setSaving(true); if (editing) { await supabase.from("products").update(form).eq("id", editing.id); } else { await supabase.from("products").insert(form); } setSaving(false); setModal(false); load(); };
  const del = async (id: string) => { if (!confirm("Supprimer ?")) return; await supabase.from("products").delete().eq("id", id); load(); };
  const filtered = products.filter(p => p.name.toLowerCase().includes(q.toLowerCase()));

  const inputStyle = { width: "100%", padding: "9px 12px", border: "1.5px solid #E5E7EB", borderRadius: 8, fontSize: 13, outline: "none", boxSizing: "border-box" as const };

  return (
    <div style={{ padding: "28px 32px" }}>
      <Header title={t("products")} subtitle={`${products.length} ${t("total_products")}`} />
      <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginBottom: 20 }}>
        <div style={{ position: "relative" }}>
          <Search size={14} style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "#aaa" }} />
          <input value={q} onChange={e => setQ(e.target.value)} placeholder={t("search")} style={{ paddingLeft: 30, paddingRight: 12, paddingTop: 8, paddingBottom: 8, border: "1px solid #E5E7EB", borderRadius: 8, fontSize: 13, outline: "none", width: 200 }} />
        </div>
        <button style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 14px", border: "1px solid #E5E7EB", borderRadius: 8, background: "#fff", fontSize: 13, cursor: "pointer" }}><Filter size={14} /> {t("filter")}</button>
        <button onClick={openAdd} style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 16px", background: "#C8F000", border: "none", borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: "pointer" }}><Plus size={14} /> {t("add_product")}</button>
      </div>
      <div style={{ background: "#fff", borderRadius: 12, boxShadow: "0 1px 3px rgba(0,0,0,0.07)", overflow: "hidden" }}>
        {loading ? <div style={{ padding: 40, textAlign: "center", color: "#aaa" }}>Chargement...</div> : (
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead><tr style={{ background: "#F9F9F9", borderBottom: "1px solid #F0F0F0" }}>
              {["Code", t("product"), "Catégorie", "Prix", t("qty"), t("status"), ""].map((h, i) => <th key={i} style={{ textAlign: "left", padding: "12px 16px", color: "#888", fontWeight: 500, fontSize: 12 }}>{h}</th>)}
            </tr></thead>
            <tbody>{filtered.map(p => { const st = statusStyle[p.status] || statusStyle.active; return (
              <tr key={p.id} style={{ borderBottom: "1px solid #F5F5F5" }}>
                <td style={{ padding: "13px 16px", color: "#aaa", fontSize: 12 }}>{p.code}</td>
                <td style={{ padding: "13px 16px", fontWeight: 500 }}>{p.name}</td>
                <td style={{ padding: "13px 16px", color: "#666" }}>{p.category}</td>
                <td style={{ padding: "13px 16px", fontWeight: 600 }}>{fmt(p.price_dzd)}</td>
                <td style={{ padding: "13px 16px" }}>{p.stock}</td>
                <td style={{ padding: "13px 16px" }}><span style={{ background: st.bg, color: st.color, padding: "3px 10px", borderRadius: 10, fontSize: 11, fontWeight: 600 }}>{t(statusKeys[p.status] || "active")}</span></td>
                <td style={{ padding: "13px 16px" }}><div style={{ display: "flex", gap: 6 }}>
                  <button onClick={() => openEdit(p)} style={{ fontSize: 12, color: "#C8F000", background: "#1C1C1C", border: "none", padding: "4px 12px", borderRadius: 6, cursor: "pointer", fontWeight: 600 }}>{t("edit")}</button>
                  <button onClick={() => del(p.id)} style={{ fontSize: 12, color: "#dc2626", background: "#FEE2E2", border: "none", padding: "4px 12px", borderRadius: 6, cursor: "pointer", fontWeight: 600 }}>✕</button>
                </div></td>
              </tr>); })}
            </tbody>
          </table>
        )}
      </div>
      {modal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100 }}>
          <div style={{ background: "#fff", borderRadius: 16, padding: 28, width: 460, boxShadow: "0 20px 60px rgba(0,0,0,0.2)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <h2 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>{editing ? t("edit") : t("add_product")}</h2>
              <button onClick={() => setModal(false)} style={{ background: "none", border: "none", cursor: "pointer" }}><X size={18} /></button>
            </div>
            {([["Code", "code", "text"], [t("product"), "name", "text"], ["Catégorie", "category", "text"], ["Prix (DZD)", "price_dzd", "number"], [t("qty"), "stock", "number"]] as [string,string,string][]).map(([label, key, type]) => (
              <div key={key} style={{ marginBottom: 14 }}>
                <label style={{ fontSize: 12, fontWeight: 600, color: "#555", display: "block", marginBottom: 4 }}>{label}</label>
                <input type={type} value={(form as any)[key]} onChange={e => setForm({ ...form, [key]: type === "number" ? Number(e.target.value) : e.target.value })} style={inputStyle} />
              </div>
            ))}
            <div style={{ marginBottom: 20 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: "#555", display: "block", marginBottom: 4 }}>{t("status")}</label>
              <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })} style={inputStyle}>
                {["active","low","critical","out"].map(s => <option key={s} value={s}>{t(statusKeys[s])}</option>)}
              </select>
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={() => setModal(false)} style={{ flex: 1, padding: "10px", border: "1.5px solid #E5E7EB", borderRadius: 8, background: "#fff", fontSize: 13, cursor: "pointer" }}>Annuler</button>
              <button onClick={save} disabled={saving} style={{ flex: 1, padding: "10px", background: "#C8F000", border: "none", borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: "pointer" }}>{saving ? "..." : "Enregistrer"}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
