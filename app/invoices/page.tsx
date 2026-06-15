"use client";
import { useEffect, useState } from "react";
import { FileText, Download, Search } from "lucide-react";
import { useApp } from "@/context/AppContext";
import Header from "@/components/Header";
import { supabase } from "@/lib/supabase";
import { generateInvoicePDF } from "@/lib/generateInvoice";

const statusStyle: Record<string, { bg: string; color: string }> = {
  delivered: { bg: "#DCFCE7", color: "#16a34a" },
  processing: { bg: "#DBEAFE", color: "#2563eb" },
  pending: { bg: "#FEF9C3", color: "#ca8a04" },
  cancelled: { bg: "#FEE2E2", color: "#dc2626" },
};

export default function Invoices() {
  const { t, fmt, darkMode } = useApp();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");

  const card = darkMode ? "#1C1C1C" : "#fff";
  const text = darkMode ? "#F0F0F0" : "#1A1A1A";
  const muted = darkMode ? "#777" : "#888";
  const border = darkMode ? "#2A2A2A" : "#F5F5F5";
  const headerBg = darkMode ? "#2A2A2A" : "#F9F9F9";

  useEffect(() => {
    supabase.from("orders").select("*").order("created_at", { ascending: false })
      .then(({ data }) => { setOrders(data || []); setLoading(false); });
  }, []);

  const filtered = orders.filter(o =>
    o.code?.toLowerCase().includes(q.toLowerCase()) ||
    o.customer_name?.toLowerCase().includes(q.toLowerCase())
  );

  return (
    <div style={{ padding: "28px 32px" }}>
      <Header title="Factures" subtitle="Générer et télécharger les factures PDF" />

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 16, marginBottom: 24 }}>
        {[
          { label: "Total Factures", value: orders.length, color: "#1C1C1C" },
          { label: "Livrées", value: orders.filter(o => o.status === "delivered").length, color: "#16a34a" },
          { label: "Revenu Total", value: fmt(orders.filter(o => o.status === "delivered").reduce((a, o) => a + (o.total_dzd || 0), 0)), color: "#2563eb" },
        ].map(s => (
          <div key={s.label} style={{ background: card, borderRadius: 12, padding: "18px 20px", boxShadow: "0 1px 3px rgba(0,0,0,0.1)" }}>
            <p style={{ color: muted, fontSize: 12, margin: "0 0 6px" }}>{s.label}</p>
            <p style={{ fontSize: 24, fontWeight: 700, margin: 0, color: s.color }}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Search */}
      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 16 }}>
        <div style={{ position: "relative" }}>
          <Search size={14} style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: muted }} />
          <input value={q} onChange={e => setQ(e.target.value)} placeholder="Rechercher une facture..."
            style={{ paddingLeft: 30, paddingRight: 12, paddingTop: 8, paddingBottom: 8, border: `1px solid ${darkMode ? "#3A3A3A" : "#E5E7EB"}`, borderRadius: 8, fontSize: 13, outline: "none", width: 240, background: card, color: text }} />
        </div>
      </div>

      {/* Table */}
      <div style={{ background: card, borderRadius: 12, boxShadow: "0 1px 3px rgba(0,0,0,0.1)", overflow: "hidden" }}>
        {loading ? <div style={{ padding: 40, textAlign: "center", color: muted }}>Chargement...</div> : (
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead>
              <tr style={{ background: headerBg, borderBottom: `1px solid ${border}` }}>
                {["N° Facture", "Client", "Produit", "Montant", "Date", "Statut", "PDF"].map((h, i) => (
                  <th key={i} style={{ textAlign: "left", padding: "12px 16px", color: muted, fontWeight: 500, fontSize: 12 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={7} style={{ padding: 40, textAlign: "center", color: muted }}>Aucune facture</td></tr>
              ) : filtered.map(o => {
                const st = statusStyle[o.status] || statusStyle.pending;
                return (
                  <tr key={o.id} style={{ borderBottom: `1px solid ${border}` }}>
                    <td style={{ padding: "13px 16px", fontWeight: 700, color: "#C8F000", background: "#1C1C1C", fontSize: 12 }}>{o.code}</td>
                    <td style={{ padding: "13px 16px", fontWeight: 600, color: text }}>{o.customer_name}</td>
                    <td style={{ padding: "13px 16px", color: muted }}>{o.product}</td>
                    <td style={{ padding: "13px 16px", fontWeight: 700, color: text }}>{fmt(o.total_dzd)}</td>
                    <td style={{ padding: "13px 16px", color: muted, fontSize: 12 }}>{new Date(o.created_at).toLocaleDateString("fr-DZ")}</td>
                    <td style={{ padding: "13px 16px" }}>
                      <span style={{ background: st.bg, color: st.color, padding: "3px 10px", borderRadius: 10, fontSize: 11, fontWeight: 600 }}>{t(o.status)}</span>
                    </td>
                    <td style={{ padding: "13px 16px" }}>
                      <button onClick={() => generateInvoicePDF(o)}
                        style={{ display: "flex", alignItems: "center", gap: 6, padding: "6px 12px", background: "#C8F000", border: "none", borderRadius: 6, fontSize: 12, fontWeight: 600, cursor: "pointer", color: "#1C1C1C" }}>
                        <Download size={13} /> PDF
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
