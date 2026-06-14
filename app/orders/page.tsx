"use client";
import { useState, useEffect } from "react";
import { Search, Plus, X } from "lucide-react";
import { useApp } from "@/context/AppContext";
import Header from "@/components/Header";
import { supabase } from "@/lib/supabase";

type Order = { id: string; code: string; customer_name: string; product: string; qty: number; total_dzd: number; status: string; created_at: string; };

const statusStyle: Record<string, { bg: string; color: string }> = {
  delivered: { bg: "#DCFCE7", color: "#16a34a" },
  processing: { bg: "#DBEAFE", color: "#2563eb" },
  pending: { bg: "#FEF9C3", color: "#ca8a04" },
  cancelled: { bg: "#FEE2E2", color: "#dc2626" },
};
const emptyForm = { code: "", customer_name: "", product: "", qty: 1, total_dzd: 0, status: "pending" };

export default function Orders() {
  const { t, fmt, darkMode } = useApp();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState<Order | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const card = darkMode ? "#1C1C1C" : "#fff";
  const text = darkMode ? "#F0F0F0" : "#1A1A1A";
  const muted = darkMode ? "#777" : "#888";
  const border = darkMode ? "#2A2A2A" : "#F5F5F5";
  const headerBg = darkMode ? "#2A2A2A" : "#F9F9F9";
  const inputStyle = { width: "100%", padding: "9px 12px", border: `1.5px solid ${darkMode ? "#3A3A3A" : "#E5E7EB"}`, borderRadius: 8, fontSize: 13, outline: "none", boxSizing: "border-box" as const, background: darkMode ? "#2A2A2A" : "#fff", color: text };

  const load = async () => { setLoading(true); const { data } = await supabase.from("orders").select("*").order("created_at", { ascending: false }); setOrders(data || []); setLoading(false); };
  useEffect(() => { load(); }, []);

  const openAdd = () => { setEditing(null); setForm(emptyForm); setModal(true); };
  const openEdit = (o: Order) => { setEditing(o); setForm({ code: o.code, customer_name: o.customer_name, product: o.product, qty: o.qty, total_dzd: o.total_dzd, status: o.status }); setModal(true); };
  const save = async () => { setSaving(true); if (editing) { await supabase.from("orders").update(form).eq("id", editing.id); } else { await supabase.from("orders").insert(form); } setSaving(false); setModal(false); load(); };
  const del = async (id: string) => { if (!confirm("Supprimer ?")) return; await supabase.from("orders").delete().eq("id", id); load(); };
  const filtered = orders.filter(o => o.customer_name?.toLowerCase().includes(q.toLowerCase()) || o.code?.toLowerCase().includes(q.toLowerCase()));

  return (
    <div style={{ padding: "28px 32px" }}>
      <Header title={t("orders")} subtitle={t("manage_orders")} />

      <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginBottom: 20 }}>
        <div style={{ position: "relative" }}>
          <Search size={14} style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: muted }} />
          <input value={q} onChange={e => setQ(e.target.value)} placeholder={t("search")}
            style={{ paddingLeft: 30, paddingRight: 12, paddingTop: 8, paddingBottom: 8, border: `1px solid ${darkMode ? "#3A3A3A" : "#E5E7EB"}`, borderRadius: 8, fontSize: 13, outline: "none", width: 200, background: card, color: text }} />
        </div>
        <button onClick={openAdd} style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 16px", background: "#C8F000", border: "none", borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: "pointer", color: "#1C1C1C" }}>
          <Plus size={14} /> {t("new_order")}
        </button>
      </div>

      <div style={{ background: card, borderRadius: 12, boxShadow: "0 1px 3px rgba(0,0,0,0.1)", overflow: "hidden", transition: "background 0.2s" }}>
        {loading ? <div style={{ padding: 40, textAlign: "center", color: muted }}>Chargement...</div> : (
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead>
              <tr style={{ background: headerBg, borderBottom: `1px solid ${border}` }}>
                {[t("order_id"), t("customer"), t("product"), t("qty"), t("total"), t("date"), t("status"), ""].map((h, i) => (
                  <th key={i} style={{ textAlign: "left", padding: "12px 16px", color: muted, fontWeight: 500, fontSize: 12 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={8} style={{ padding: 40, textAlign: "center", color: muted }}>Aucune commande</td></tr>
              ) : filtered.map(o => {
                const st = statusStyle[o.status] || statusStyle.pending;
                return (
                  <tr key={o.id} style={{ borderBottom: `1px solid ${border}` }}>
                    <td style={{ padding: "13px 16px", fontWeight: 600, color: text }}>{o.code}</td>
                    <td style={{ padding: "13px 16px", color: text }}>{o.customer_name}</td>
                    <td style={{ padding: "13px 16px", color: muted }}>{o.product}</td>
                    <td style={{ padding: "13px 16px", color: text }}>{o.qty}</td>
                    <td style={{ padding: "13px 16px", fontWeight: 600, color: text }}>{fmt(o.total_dzd)}</td>
                    <td style={{ padding: "13px 16px", color: muted, fontSize: 12 }}>{new Date(o.created_at).toLocaleDateString("fr-DZ")}</td>
                    <td style={{ padding: "13px 16px" }}>
                      <span style={{ background: st.bg, color: st.color, padding: "3px 10px", borderRadius: 10, fontSize: 11, fontWeight: 600 }}>{t(o.status)}</span>
                    </td>
                    <td style={{ padding: "13px 16px" }}>
                      <div style={{ display: "flex", gap: 6 }}>
                        <button onClick={() => openEdit(o)} style={{ fontSize: 12, color: "#C8F000", background: "#1C1C1C", border: "none", padding: "4px 12px", borderRadius: 6, cursor: "pointer", fontWeight: 600 }}>{t("edit")}</button>
                        <button onClick={() => del(o.id)} style={{ fontSize: 12, color: "#dc2626", background: "#FEE2E2", border: "none", padding: "4px 12px", borderRadius: 6, cursor: "pointer", fontWeight: 600 }}>✕</button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {modal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100 }}>
          <div style={{ background: card, borderRadius: 16, padding: 28, width: 460, boxShadow: "0 20px 60px rgba(0,0,0,0.3)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <h2 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: text }}>{editing ? t("edit") : t("new_order")}</h2>
              <button onClick={() => setModal(false)} style={{ background: "none", border: "none", cursor: "pointer", color: text }}><X size={18} /></button>
            </div>
            {([["Code", "code", "text"], [t("customer"), "customer_name", "text"], [t("product"), "product", "text"], [t("qty"), "qty", "number"], [`${t("total")} (DZD)`, "total_dzd", "number"]] as [string,string,string][]).map(([label, key, type]) => (
              <div key={key} style={{ marginBottom: 14 }}>
                <label style={{ fontSize: 12, fontWeight: 600, color: muted, display: "block", marginBottom: 4 }}>{label}</label>
                <input type={type} value={(form as any)[key]} onChange={e => setForm({ ...form, [key]: type === "number" ? Number(e.target.value) : e.target.value })} style={inputStyle} />
              </div>
            ))}
            <div style={{ marginBottom: 20 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: muted, display: "block", marginBottom: 4 }}>{t("status")}</label>
              <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })} style={inputStyle}>
                {["pending", "processing", "delivered", "cancelled"].map(s => <option key={s} value={s}>{t(s)}</option>)}
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
