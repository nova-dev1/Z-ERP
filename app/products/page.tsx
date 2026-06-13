"use client";
import { useState } from "react";
import { Search, Plus, Filter } from "lucide-react";
import { useApp } from "@/context/AppContext";
import Header from "@/components/Header";

const products = [
  { id: "PRD-001", nameKey: "ASUS ROG Strix G15 Laptop", category: "Laptops", priceDZD: 175365, stock: 225, status: "active" },
  { id: "PRD-002", nameKey: "Logitech MX Keys Keyboard", category: "Accessories", priceDZD: 14715, stock: 12, status: "low" },
  { id: "PRD-003", nameKey: 'Samsung 27" 4K Monitor', category: "Monitors", priceDZD: 60615, stock: 48, status: "active" },
  { id: "PRD-004", nameKey: "TP-Link Archer AX3000", category: "Networking", priceDZD: 12015, stock: 5, status: "critical" },
  { id: "PRD-005", nameKey: "Dell XPS 15 Laptop", category: "Laptops", priceDZD: 242865, stock: 31, status: "active" },
  { id: "PRD-006", nameKey: "Razer DeathAdder V3 Mouse", category: "Accessories", priceDZD: 9315, stock: 74, status: "active" },
  { id: "PRD-007", nameKey: "SteelSeries Arctis 7 Headset", category: "Audio", priceDZD: 20115, stock: 0, status: "out" },
  { id: "PRD-008", nameKey: "Crucial 16GB DDR5 RAM", category: "Components", priceDZD: 10665, stock: 110, status: "active" },
];

const statusStyle: Record<string, { bg: string; color: string }> = {
  active: { bg: "#DCFCE7", color: "#16a34a" },
  low: { bg: "#FEF9C3", color: "#ca8a04" },
  critical: { bg: "#FEE2E2", color: "#dc2626" },
  out: { bg: "#F3F4F6", color: "#6b7280" },
};

const statusKeys: Record<string, string> = {
  active: "active", low: "low", critical: "critical", out: "inactive"
};

export default function Products() {
  const { t, fmt } = useApp();
  const [q, setQ] = useState("");
  const filtered = products.filter(p => p.nameKey.toLowerCase().includes(q.toLowerCase()));

  return (
    <div style={{ padding: "28px 32px" }}>
      <Header title={t("products")} subtitle={`${products.length} ${t("total_products")}`} />

      <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginBottom: 20 }}>
        <div style={{ position: "relative" }}>
          <Search size={14} style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "#aaa" }} />
          <input value={q} onChange={e => setQ(e.target.value)} placeholder={t("search")}
            style={{ paddingLeft: 30, paddingRight: 12, paddingTop: 8, paddingBottom: 8, border: "1px solid #E5E7EB", borderRadius: 8, fontSize: 13, outline: "none", width: 200 }} />
        </div>
        <button style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 14px", border: "1px solid #E5E7EB", borderRadius: 8, background: "#fff", fontSize: 13, cursor: "pointer" }}>
          <Filter size={14} /> {t("filter")}
        </button>
        <button style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 16px", background: "#C8F000", border: "none", borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
          <Plus size={14} /> {t("add_product")}
        </button>
      </div>

      <div style={{ background: "#fff", borderRadius: 12, boxShadow: "0 1px 3px rgba(0,0,0,0.07)", overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
          <thead>
            <tr style={{ background: "#F9F9F9", borderBottom: "1px solid #F0F0F0" }}>
              {["ID", t("product"), "Category", t("total"), t("qty"), t("status"), ""].map((h, i) => (
                <th key={i} style={{ textAlign: "left", padding: "12px 16px", color: "#888", fontWeight: 500, fontSize: 12 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map(p => {
              const st = statusStyle[p.status];
              return (
                <tr key={p.id} style={{ borderBottom: "1px solid #F5F5F5" }}>
                  <td style={{ padding: "13px 16px", color: "#aaa", fontSize: 12 }}>{p.id}</td>
                  <td style={{ padding: "13px 16px", fontWeight: 500 }}>{p.nameKey}</td>
                  <td style={{ padding: "13px 16px", color: "#666" }}>{p.category}</td>
                  <td style={{ padding: "13px 16px", fontWeight: 600 }}>{fmt(p.priceDZD)}</td>
                  <td style={{ padding: "13px 16px" }}>{p.stock}</td>
                  <td style={{ padding: "13px 16px" }}>
                    <span style={{ background: st.bg, color: st.color, padding: "3px 10px", borderRadius: 10, fontSize: 11, fontWeight: 600 }}>{t(statusKeys[p.status])}</span>
                  </td>
                  <td style={{ padding: "13px 16px" }}>
                    <button style={{ fontSize: 12, color: "#C8F000", background: "#1C1C1C", border: "none", padding: "4px 12px", borderRadius: 6, cursor: "pointer", fontWeight: 600 }}>{t("edit")}</button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
