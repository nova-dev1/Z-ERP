"use client";
import { useState } from "react";
import { Search, Plus, Filter } from "lucide-react";

const products = [
  { id: "PRD-001", name: "ASUS ROG Strix G15 Laptop", category: "Laptops", price: 1299, stock: 225, status: "active" },
  { id: "PRD-002", name: "Logitech MX Keys Keyboard", category: "Accessories", price: 109, stock: 12, status: "low" },
  { id: "PRD-003", name: 'Samsung 27" 4K Monitor', category: "Monitors", price: 449, stock: 48, status: "active" },
  { id: "PRD-004", name: "TP-Link Archer AX3000 Router", category: "Networking", price: 89, stock: 5, status: "critical" },
  { id: "PRD-005", name: "Dell XPS 15 Laptop", category: "Laptops", price: 1799, stock: 31, status: "active" },
  { id: "PRD-006", name: "Razer DeathAdder V3 Mouse", category: "Accessories", price: 69, stock: 74, status: "active" },
  { id: "PRD-007", name: "SteelSeries Arctis 7 Headset", category: "Audio", price: 149, stock: 0, status: "out" },
  { id: "PRD-008", name: "Crucial 16GB DDR5 RAM", category: "Components", price: 79, stock: 110, status: "active" },
];

const statusStyle: Record<string, { bg: string; color: string }> = {
  active: { bg: "#DCFCE7", color: "#16a34a" },
  low: { bg: "#FEF9C3", color: "#ca8a04" },
  critical: { bg: "#FEE2E2", color: "#dc2626" },
  out: { bg: "#F3F4F6", color: "#6b7280" },
};

export default function Products() {
  const [q, setQ] = useState("");
  const filtered = products.filter(p => p.name.toLowerCase().includes(q.toLowerCase()));

  return (
    <div style={{ padding: "28px 32px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, margin: 0 }}>Products</h1>
          <p style={{ color: "#888", fontSize: 13, margin: "2px 0 0" }}>{products.length} total products</p>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <div style={{ position: "relative" }}>
            <Search size={14} style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "#aaa" }} />
            <input value={q} onChange={e => setQ(e.target.value)} placeholder="Search products..."
              style={{ paddingLeft: 30, paddingRight: 12, paddingTop: 8, paddingBottom: 8, border: "1px solid #E5E7EB", borderRadius: 8, fontSize: 13, outline: "none", width: 200 }} />
          </div>
          <button style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 14px", border: "1px solid #E5E7EB", borderRadius: 8, background: "#fff", fontSize: 13, cursor: "pointer" }}>
            <Filter size={14} /> Filter
          </button>
          <button style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 16px", background: "#C8F000", border: "none", borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
            <Plus size={14} /> Add Product
          </button>
        </div>
      </div>

      <div style={{ background: "#fff", borderRadius: 12, boxShadow: "0 1px 3px rgba(0,0,0,0.07)", overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
          <thead>
            <tr style={{ background: "#F9F9F9", borderBottom: "1px solid #F0F0F0" }}>
              {["ID", "Product Name", "Category", "Price", "Stock", "Status", "Actions"].map(h => (
                <th key={h} style={{ textAlign: "left", padding: "12px 16px", color: "#888", fontWeight: 500, fontSize: 12 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map(p => {
              const st = statusStyle[p.status];
              return (
                <tr key={p.id} style={{ borderBottom: "1px solid #F5F5F5" }}>
                  <td style={{ padding: "13px 16px", color: "#aaa", fontSize: 12 }}>{p.id}</td>
                  <td style={{ padding: "13px 16px", fontWeight: 500 }}>{p.name}</td>
                  <td style={{ padding: "13px 16px", color: "#666" }}>{p.category}</td>
                  <td style={{ padding: "13px 16px", fontWeight: 600 }}>${p.price.toLocaleString()}</td>
                  <td style={{ padding: "13px 16px" }}>{p.stock}</td>
                  <td style={{ padding: "13px 16px" }}>
                    <span style={{ background: st.bg, color: st.color, padding: "3px 10px", borderRadius: 10, fontSize: 11, fontWeight: 600, textTransform: "capitalize" }}>{p.status}</span>
                  </td>
                  <td style={{ padding: "13px 16px" }}>
                    <button style={{ fontSize: 12, color: "#C8F000", background: "#1C1C1C", border: "none", padding: "4px 12px", borderRadius: 6, cursor: "pointer", fontWeight: 600 }}>Edit</button>
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
