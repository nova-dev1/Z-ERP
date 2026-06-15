"use client";
import { useState, useEffect } from "react";
import { Search, Plus, X, Download } from "lucide-react";
import { useApp } from "@/context/AppContext";
import Header from "@/components/Header";
import { supabase } from "@/lib/supabase";
import { exportToExcel } from "@/lib/exportExcel";

type Customer = { id: string; code: string; name: string; email: string; phone: string; status: string; };
const statusStyle: Record<string, { bg: string; color: string }> = {
  active: { bg: "#DCFCE7", color: "#16a34a" }, vip: { bg: "#F3E8FF", color: "#9333ea" },
  new: { bg: "#DBEAFE", color: "#2563eb" }, inactive: { bg: "#F3F4F6", color: "#6b7280" },
};
const emptyForm = { code: "", name: "", email: "", phone: "", status: "active" };

export default function Customers() {
  const { t, darkMode } = useApp();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState<Customer | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const card = darkMode ? "#1C1C1C" : "#fff";
  const text = darkMode ? "#F0F0F0" : "#1A1A1A";
  const muted = darkMode ? "#777" : "#888";
  const border = darkMode ? "#2A2A2A" : "#F5F5F5";
  const headerBg = darkMode ? "#2A2A2A" : "#F9F9F9";
  const inputStyle = { width: "100%", padding: "9px 12px", border: `1.5px solid ${darkMode ? "#3A3A3A" : "#E5E7EB"}`, borderRadius: 8, fontSize: 13, outline: "none", boxSizing: "border-box" as const, background: darkMode ? "#2A2A2A" : "#fff", color: text };

  const load = async () => { setLoading(true); const { data } = await supabase.from("customers").select("*").order("created_at", { ascending: false }); setCustomers(data || []); setLoading(false); };
  useEffect(() => { load(); }, []);
  const openAdd = () => { setEditing(null); setForm(emptyForm); setModal(true); };
  const openEdit = (c: Customer) => { setEditing(c); setForm({ code: c.code, name: c.name, email: c.email, phone: c.phone, status: c.status }); setModal(true); };
  const save = async () => { setSaving(true); if (editing) { await supabase.from("customers").update(form).eq("id", editing.id); } else { await supabase.from("customers").insert(form); } setSaving(false); setModal(false); load(); };
  const del = async (id: string) => { if (!confirm("Supprimer ?")) return; await supabase.from("customers").delete().eq("id", id); load(); };
  const filtered = customers.filter(c => c.name?.toLowerCase().includes(q.toLowerCase()));

  const handleExcel = () => exportToExcel(customers, [
    { key: "code", label: "Code" }, { key: "name", label: "Nom" },
    { key: "email", label: "Email" }, { key: "phone", label: "Téléphone" },
    { key: "status", label: "Statut" },
  ], "Clients-ETS-ZAIMI");

  return (
    <div style={{ padding: "28px 32px" }}>
      <Header title={t("customers")} subtitle={`${customers.length} ${t("registered_customers")}`} />
      <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginBottom: 20, flexWrap: "wrap" }}>
        <div style={{ position: "relative" }}>
          <Search size={14} style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: muted }} />
          <input value={q} onChange={e => setQ(e.target.value)} placeholder={t("search")} style={{ paddingLeft: 30, paddingRight: 12, paddingTop: 8, paddingBottom: 8, border: `1px solid ${darkMode ? "#3A3A3A" : "#E5E7EB"}`, borderRadius: 8, fontSize: 13, outline: "none", width: 200, background: card, color: text }} />
        </div>
        <button onClick={handleExcel} style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 14px", border: `1px solid ${darkMode ? "#3A3A3A" : "#E5E7EB"}`, borderRadius: 8, background: card, color: text, fontSize: 13, cursor: "pointer" }}>
          <Download size={14} /> Excel
        </button>
        <button onClick={openAdd} style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 16px", background: "#C8F000", border: "none", borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: "pointer", color: "#1C1C1C" }}>
          <Plus size={14} /> {t("add_customer")}
        </button>
      </div>
      <div style={{ background: card, borderRadius: 12, boxShadow: "0 1px 3px rgba(0,0,0,0.1)", overflow: "hidden" }}>
        {loading ? <div style={{ padding: 40, textAlign: "center", color: muted }}>Chargement...</div> : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13, minWidth: 600 }}>
              <thead><tr style={{ background: headerBg, borderBottom: `1px solid ${border}` }}>
                {["Code", t("name"), t("email"), t("phone"), t("status"), ""].map((h, i) => <th key={i} style={{ textAlign: "left", padding: "12px 16px", color: muted, fontWeight: 500, fontSize: 12 }}>{h}</th>)}
              </tr></thead>
              <tbody>{filtered.length === 0 ? (
                <tr><td colSpan={6} style={{ padding: 40, textAlign: "center", color: muted }}>Aucun client</td></tr>
              ) : filtered.map(c => { const st = statusStyle[c.status] || statusStyle.active; return (
                <tr key={c.id} style={{ borderBottom: `1px solid ${border}` }}>
                  <td style={{ padding: "13px 16px", color: muted, fontSize: 12 }}>{c.code}</td>
                  <td style={{ padding: "13px 16px", fontWeight: 600, color: text }}>{c.name}</td>
                  <td style={{ padding: "13px 16px", color: muted }}>{c.email}</td>
                  <td style={{ padding: "13px 16px", color: muted }}>{c.phone}</td>
                  <td style={{ padding: "13px 16px" }}><span style={{ background: st.bg, color: st.color, padding: "3px 10px", borderRadius: 10, fontSize: 11, fontWeight: 600 }}>{t(c.status)}</span></td>
                  <td style={{ padding: "13px 16px" }}><div style={{ display: "flex", gap: 6 }}>
                    <button onClick={() => openEdit(c)} style={{ fontSize: 12, color: "#C8F000", background: "#1C1C1C", border: "none", padding: "4px 12px", borderRadius: 6, cursor: "pointer", fontWeight: 600 }}>{t("edit")}</button>
                    <button onClick={() => del(c.id)} style={{ fontSize: 12, color: "#dc2626", background: "#FEE2E2", border: "none", padding: "4px 12px", borderRadius: 6, cursor: "pointer", fontWeight: 600 }}>✕</button>
                  </div></td>
                </tr>); })}
              </tbody>
            </table>
          </div>
        )}
      </div>
      {modal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100, padding: 16 }}>
          <div style={{ background: card, borderRadius: 16, padding: 28, width: "100%", maxWidth: 460, boxShadow: "0 20px 60px rgba(0,0,0,0.3)", maxHeight: "90vh", overflowY: "auto" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <h2 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: text }}>{editing ? t("edit") : t("add_customer")}</h2>
              <button onClick={() => setModal(false)} style={{ background: "none", border: "none", cursor: "pointer", color: text }}><X size={18} /></button>
            </div>
            {([["Code", "code"], [t("name"), "name"], [t("email"), "email"], [t("phone"), "phone"]] as [string,string][]).map(([label, key]) => (
              <div key={key} style={{ marginBottom: 14 }}>
                <label style={{ fontSize: 12, fontWeight: 600, color: muted, display: "block", marginBottom: 4 }}>{label}</label>
                <input value={(form as any)[key]} onChange={e => setForm({ ...form, [key]: e.target.value })} style={inputStyle} />
              </div>
            ))}
            <div style={{ marginBottom: 20 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: muted, display: "block", marginBottom: 4 }}>{t("status")}</label>
              <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })} style={inputStyle}>
                {["active","vip","new","inactive"].map(s => <option key={s} value={s}>{t(s)}</option>)}
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
