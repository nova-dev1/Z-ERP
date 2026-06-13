"use client";
import { Search, Plus } from "lucide-react";

const customers = [
  { id: "C-001", name: "Mourad Benali", email: "m.benali@email.dz", phone: "+213 555 0101", orders: 8, spent: 6420, status: "active" },
  { id: "C-002", name: "Yasmine Khelifi", email: "y.khelifi@email.dz", phone: "+213 555 0202", orders: 3, spent: 1340, status: "active" },
  { id: "C-003", name: "Karim Amrani", email: "k.amrani@email.dz", phone: "+213 555 0303", orders: 12, spent: 9870, status: "vip" },
  { id: "C-004", name: "Salim Taleb", email: "s.taleb@email.dz", phone: "+213 555 0404", orders: 1, spent: 327, status: "new" },
  { id: "C-005", name: "Nadia Hamidi", email: "n.hamidi@email.dz", phone: "+213 555 0505", orders: 0, spent: 0, status: "inactive" },
  { id: "C-006", name: "Amine Zaimi", email: "a.zaimi@email.dz", phone: "+213 555 0606", orders: 5, spent: 3210, status: "active" },
];

const statusStyle: Record<string, { bg: string; color: string }> = {
  active: { bg: "#DCFCE7", color: "#16a34a" },
  vip: { bg: "#F3E8FF", color: "#9333ea" },
  new: { bg: "#DBEAFE", color: "#2563eb" },
  inactive: { bg: "#F3F4F6", color: "#6b7280" },
};

export default function Customers() {
  return (
    <div style={{ padding: "28px 32px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, margin: 0 }}>Customers</h1>
          <p style={{ color: "#888", fontSize: 13, margin: "2px 0 0" }}>{customers.length} registered customers</p>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <div style={{ position: "relative" }}>
            <Search size={14} style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "#aaa" }} />
            <input placeholder="Search customers..." style={{ paddingLeft: 30, paddingRight: 12, paddingTop: 8, paddingBottom: 8, border: "1px solid #E5E7EB", borderRadius: 8, fontSize: 13, outline: "none", width: 200 }} />
          </div>
          <button style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 16px", background: "#C8F000", border: "none", borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
            <Plus size={14} /> Add Customer
          </button>
        </div>
      </div>

      <div style={{ background: "#fff", borderRadius: 12, boxShadow: "0 1px 3px rgba(0,0,0,0.07)", overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
          <thead>
            <tr style={{ background: "#F9F9F9", borderBottom: "1px solid #F0F0F0" }}>
              {["ID", "Name", "Email", "Phone", "Orders", "Total Spent", "Status"].map(h => (
                <th key={h} style={{ textAlign: "left", padding: "12px 16px", color: "#888", fontWeight: 500, fontSize: 12 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {customers.map(c => {
              const st = statusStyle[c.status];
              return (
                <tr key={c.id} style={{ borderBottom: "1px solid #F5F5F5" }}>
                  <td style={{ padding: "13px 16px", color: "#aaa", fontSize: 12 }}>{c.id}</td>
                  <td style={{ padding: "13px 16px", fontWeight: 600 }}>{c.name}</td>
                  <td style={{ padding: "13px 16px", color: "#666" }}>{c.email}</td>
                  <td style={{ padding: "13px 16px", color: "#666" }}>{c.phone}</td>
                  <td style={{ padding: "13px 16px" }}>{c.orders}</td>
                  <td style={{ padding: "13px 16px", fontWeight: 600 }}>${c.spent.toLocaleString()}</td>
                  <td style={{ padding: "13px 16px" }}>
                    <span style={{ background: st.bg, color: st.color, padding: "3px 10px", borderRadius: 10, fontSize: 11, fontWeight: 600, textTransform: "capitalize" }}>{c.status}</span>
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
