"use client";
import { useState, useEffect } from "react";
import { Search, Plus, X, Download, TrendingUp } from "lucide-react";
import { useApp } from "@/context/AppContext";
import Header from "@/components/Header";
import { supabase } from "@/lib/supabase";
import { exportToExcel } from "@/lib/exportExcel";

type Customer = { id: string; code: string; name: string; email: string; phone: string; status: string; total_spent_dzd?: number; total_orders?: number; last_order_at?: string; };

const statusStyle: Record<string, { bg: string; color: string; label: string }> = {
  active: { bg: "#DCFCE7", color: "#16a34a", label: "Actif" },
  vip: { bg: "#F3E8FF", color: "#9333ea", label: "VIP ⭐" },
  new: { bg: "#DBEAFE", color: "#2563eb", label: "Nouveau" },
  inactive: { bg: "#F3F4F6", color: "#6b7280", label: "Inactif" },
};

const emptyForm = { code: "", name: "", email: "", phone: "", status: "new" };

export default function Customers() {
  const { t, fmt, darkMode } = useApp();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState<Customer | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [filterStatus, setFilterStatus] = useState("all");

  const card = darkMode ? "#1C1C1C" : "#fff";
  const text = darkMode ? "#F0F0F0" : "#1A1A1A";
  const muted = darkMode ? "#777" : "#888";
  const border = darkMode ? "#2A2A2A" : "#F5F5F5";
  const headerBg = darkMode ? "#2A2A2A" : "#F9F9F9";
  const inputStyle = { width: "100%", padding: "9px 12px", border: `1.5px solid ${darkMode ? "#3A3A3A" : "#E5E7EB"}`, borderRadius: 8, fontSize: 13, outline: "none", boxSizing: "border-box" as const, background: darkMode ? "#2A2A2A" : "#fff", color: text };

  const load = async () => {
    setLoading(true);
    const { data } = await supabase.from("customers").select("*").order("total_spent_dzd", { ascending: false });
    setCustomers(data || []);
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const openAdd = () => { setEditing(null); setForm(emptyForm); setModal(true); };
  const openEdit = (c: Customer) => { setEditing(c); setForm({ code: c.code, name: c.name, email: c.email, phone: c.phone, status: c.status }); setModal(true); };
  const save = async () => {
    setSaving(true);
    if (editing) {
      await supabase.from("customers").update(form).eq("id", editing.id);
    } else {
      const code = `C-${String(customers.length + 1).padStart(3, "0")}`;
      await supabase.from("customers").insert({ ...form, code });
    }
    setSaving(false); setModal(false); load();
  };
  const del = async (id: string) => { if (!confirm("Supprimer ?")) return; await supabase.from("customers").delete().eq("id", id); load(); };

  const handleExcel = () => exportToExcel(customers, [
    { key: "code", label: "Code" }, { key: "name", label: "Nom" },
    { key: "email", label: "Email" }, { key: "phone", label: "Téléphone" },
    { key: "status", label: "Statut" }, { key: "total_spent_dzd", label: "Total Dépensé (DZD)" },
    { key: "total_orders", label: "Nb Commandes" },
  ], "Clients-ETS-ZAIMI");

  const filtered = customers
    .filter(c => filterStatus === "all" || c.status === filterStatus)
    .filter(c => c.name?.toLowerCase().includes(q.toLowerCase()) || c.email?.toLowerCase().includes(q.toLowerCase()));

  // Stats
  const vipCount = customers.filter(c => c.status === "vip").length;
  const activeCount = customers.filter(c => c.status === "active").length;
  const totalLTV = customers.reduce((a, c) => a + (c.total_spent_dzd || 0), 0);

  return (
    <div style={{ padding: "28px 32px" }}>
      <Header title={t("customers")} subtitle={`${customers.length} ${t("registered_customers")}`} />

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12, marginBottom: 20 }}>
        {[
          { label: "Total Clients", value: customers.length, color: text },
          { label: "VIP ⭐", value: vipCount, color: "#9333ea" },
          { label: "Actifs", value: activeCount, color: "#16a34a" },
          { label: "Valeur Totale", value: fmt(totalLTV), color: "#2563eb" },
        ].map(s => (
          <div key={s.label} style={{ background: card, borderRadius: 10, padding: "14px 16px", boxShadow: "0 1px 3px rgba(0,0,0,0.08)" }}>
            <p style={{ color: muted, fontSize: 11, margin: "0 0 4px" }}>{s.label}</p>
            <p style={{ fontSize: 20, fontWeight: 700, margin: 0, color: s.color }}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Filters + Actions */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, flexWrap: "wrap", gap: 10 }}>
        <div style={{ display: "flex", gap: 6 }}>
          {["all", "vip", "active", "new", "inactive"].map(s => (
            <button key={s} onClick={() => setFilterStatus(s)} style={{
              padding: "6px 14px", borderRadius: 20, border: `1.5px solid ${filterStatus === s ? "#C8F000" : darkMode ? "#3A3A3A" : "#E5E7EB"}`,
              background: filterStatus === s ? "#C8F000" : card, color: filterStatus === s ? "#1C1C1C" : muted,
              fontSize: 12, fontWeight: filterStatus === s ? 700 : 400, cursor: "pointer"
            }}>{s === "all" ? "Tous" : t(s)}</button>
          ))}
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <div style={{ position: "relative" }}>
            <Search size={14} style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: muted }} />
            <input value={q} onChange={e => setQ(e.target.value)} placeholder={t("search")}
              style={{ paddingLeft: 30, paddingRight: 12, paddingTop: 8, paddingBottom: 8, border: `1px solid ${darkMode ? "#3A3A3A" : "#E5E7EB"}`, borderRadius: 8, fontSize: 13, outline: "none", width: 180, background: card, color: text }} />
          </div>
          <button onClick={handleExcel} style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 14px", border: `1px solid ${darkMode ? "#3A3A3A" : "#E5E7EB"}`, borderRadius: 8, background: card, color: text, fontSize: 13, cursor: "pointer" }}>
            <Download size={14} /> Excel
          </button>
          <button onClick={openAdd} style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 16px", background: "#C8F000", border: "none", borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: "pointer", color: "#1C1C1C" }}>
            <Plus size={14} /> {t("add_customer")}
          </button>
        </div>
      </div>

      <div style={{ background: card, borderRadius: 12, boxShadow: "0 1px 3px rgba(0,0,0,0.1)", overflow: "hidden" }}>
        {loading ? <div style={{ padding: 40, textAlign: "center", color: muted }}>Chargement...</div> : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13, minWidth: 700 }}>
              <thead>
                <tr style={{ background: headerBg, borderBottom: `1px solid ${border}` }}>
                  {["Code", t("name"), t("email"), t("phone"), "Commandes", "Valeur Totale", "Dernier Achat", t("status"), ""].map((h, i) => (
                    <th key={i} style={{ textAlign: "left", padding: "12px 16px", color: muted, fontWeight: 500, fontSize: 11, whiteSpace: "nowrap" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr><td colSpan={9} style={{ padding: 40, textAlign: "center", color: muted }}>Aucun client</td></tr>
                ) : filtered.map(c => {
                  const st = statusStyle[c.status] || statusStyle.new;
                  return (
                    <tr key={c.id} style={{ borderBottom: `1px solid ${border}` }}>
                      <td style={{ padding: "12px 16px", color: muted, fontSize: 11 }}>{c.code}</td>
                      <td style={{ padding: "12px 16px", fontWeight: 600, color: text }}>{c.name}</td>
                      <td style={{ padding: "12px 16px", color: muted, fontSize: 12 }}>{c.email}</td>
                      <td style={{ padding: "12px 16px", color: muted, fontSize: 12 }}>{c.phone}</td>
                      <td style={{ padding: "12px 16px", color: text, fontWeight: 500 }}>{c.total_orders || 0}</td>
                      <td style={{ padding: "12px 16px", fontWeight: 700, color: (c.total_spent_dzd || 0) > 0 ? "#16a34a" : muted }}>
                        {fmt(c.total_spent_dzd || 0)}
                      </td>
                      <td style={{ padding: "12px 16px", color: muted, fontSize: 11 }}>
                        {c.last_order_at ? new Date(c.last_order_at).toLocaleDateString("fr-DZ") : "—"}
                      </td>
                      <td style={{ padding: "12px 16px" }}>
                        <span style={{ background: st.bg, color: st.color, padding: "3px 10px", borderRadius: 10, fontSize: 11, fontWeight: 600, whiteSpace: "nowrap" }}>{st.label}</span>
                      </td>
                      <td style={{ padding: "12px 16px" }}>
                        <div style={{ display: "flex", gap: 6 }}>
                          <button onClick={() => openEdit(c)} style={{ fontSize: 12, color: "#C8F000", background: "#1C1C1C", border: "none", padding: "4px 12px", borderRadius: 6, cursor: "pointer", fontWeight: 600 }}>{t("edit")}</button>
                          <button onClick={() => del(c.id)} style={{ fontSize: 12, color: "#dc2626", background: "#FEE2E2", border: "none", padding: "4px 12px", borderRadius: 6, cursor: "pointer", fontWeight: 600 }}>✕</button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
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
            {([["Nom complet", "name"], [t("email"), "email"], [t("phone"), "phone"]] as [string,string][]).map(([label, key]) => (
              <div key={key} style={{ marginBottom: 14 }}>
                <label style={{ fontSize: 12, fontWeight: 600, color: muted, display: "block", marginBottom: 4 }}>{label}</label>
                <input value={(form as any)[key]} onChange={e => setForm({ ...form, [key]: e.target.value })} style={inputStyle} />
              </div>
            ))}
            {editing && (
              <div style={{ marginBottom: 20 }}>
                <label style={{ fontSize: 12, fontWeight: 600, color: muted, display: "block", marginBottom: 4 }}>{t("status")}</label>
                <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })} style={inputStyle}>
                  {["active","vip","new","inactive"].map(s => <option key={s} value={s}>{t(s)}</option>)}
                </select>
                <p style={{ fontSize: 11, color: muted, marginTop: 4 }}>⚡ Le statut se met à jour automatiquement selon les achats</p>
              </div>
            )}
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
