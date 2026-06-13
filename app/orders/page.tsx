"use client";
import { Search, Plus } from "lucide-react";

const orders = [
  { id: "#ORD-4821", customer: "Mourad B.", product: "ASUS ROG Laptop", qty: 1, total: 1299, date: "Jun 13, 2025", status: "delivered" },
  { id: "#ORD-4820", customer: "Yasmine K.", product: "Samsung Monitor x2", qty: 2, total: 898, date: "Jun 12, 2025", status: "processing" },
  { id: "#ORD-4819", customer: "Karim A.", product: "TP-Link Router", qty: 5, total: 445, date: "Jun 12, 2025", status: "pending" },
  { id: "#ORD-4818", customer: "Salim T.", product: "Logitech MX Keys", qty: 3, total: 327, date: "Jun 11, 2025", status: "delivered" },
  { id: "#ORD-4817", customer: "Nadia H.", product: "Dell XPS 15", qty: 1, total: 1799, date: "Jun 11, 2025", status: "cancelled" },
  { id: "#ORD-4816", customer: "Amine Z.", product: "Razer Mouse", qty: 2, total: 138, date: "Jun 10, 2025", status: "processing" },
];

const statusStyle: Record<string, { bg: string; color: string }> = {
  delivered: { bg: "#DCFCE7", color: "#16a34a" },
  processing: { bg: "#DBEAFE", color: "#2563eb" },
  pending: { bg: "#FEF9C3", color: "#ca8a04" },
  cancelled: { bg: "#FEE2E2", color: "#dc2626" },
};

export default function Orders() {
  return (
    <div style={{ padding: "28px 32px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, margin: 0 }}>Orders</h1>
          <p style={{ color: "#888", fontSize: 13, margin: "2px 0 0" }}>Manage and track all orders</p>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <div style={{ position: "relative" }}>
            <Search size={14} style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "#aaa" }} />
            <input placeholder="Search orders..." style={{ paddingLeft: 30, paddingRight: 12, paddingTop: 8, paddingBottom: 8, border: "1px solid #E5E7EB", borderRadius: 8, fontSize: 13, outline: "none", width: 200 }} />
          </div>
          <button style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 16px", background: "#C8F000", border: "none", borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
            <Plus size={14} /> New Order
          </button>
        </div>
      </div>

      <div style={{ background: "#fff", borderRadius: 12, boxShadow: "0 1px 3px rgba(0,0,0,0.07)", overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
          <thead>
            <tr style={{ background: "#F9F9F9", borderBottom: "1px solid #F0F0F0" }}>
              {["Order ID", "Customer", "Product", "Qty", "Total", "Date", "Status"].map(h => (
                <th key={h} style={{ textAlign: "left", padding: "12px 16px", color: "#888", fontWeight: 500, fontSize: 12 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {orders.map(o => {
              const st = statusStyle[o.status];
              return (
                <tr key={o.id} style={{ borderBottom: "1px solid #F5F5F5" }}>
                  <td style={{ padding: "13px 16px", fontWeight: 600 }}>{o.id}</td>
                  <td style={{ padding: "13px 16px" }}>{o.customer}</td>
                  <td style={{ padding: "13px 16px", color: "#666" }}>{o.product}</td>
                  <td style={{ padding: "13px 16px" }}>{o.qty}</td>
                  <td style={{ padding: "13px 16px", fontWeight: 600 }}>${o.total.toLocaleString()}</td>
                  <td style={{ padding: "13px 16px", color: "#aaa" }}>{o.date}</td>
                  <td style={{ padding: "13px 16px" }}>
                    <span style={{ background: st.bg, color: st.color, padding: "3px 10px", borderRadius: 10, fontSize: 11, fontWeight: 600, textTransform: "capitalize" }}>{o.status}</span>
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
