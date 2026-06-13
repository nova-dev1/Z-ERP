"use client";
import { Search, Plus } from "lucide-react";
import { useApp } from "@/context/AppContext";
import Header from "@/components/Header";

const customers = [
  { id: "C-001", name: "Mourad Benali", email: "m.benali@email.dz", phone: "+213 555 0101", orders: 8, spentDZD: 866700, status: "active" },
  { id: "C-002", name: "Yasmine Khelifi", email: "y.khelifi@email.dz", phone: "+213 555 0202", orders: 3, spentDZD: 180900, status: "active" },
  { id: "C-003", name: "Karim Amrani", email: "k.amrani@email.dz", phone: "+213 555 0303", orders: 12, spentDZD: 1332450, status: "vip" },
  { id: "C-004", name: "Salim Taleb", email: "s.taleb@email.dz", phone: "+213 555 0404", orders: 1, spentDZD: 44145, status: "new" },
  { id: "C-005", name: "Nadia Hamidi", email: "n.hamidi@email.dz", phone: "+213 555 0505", orders: 0, spentDZD: 0, status: "inactive" },
  { id: "C-006", name: "Amine Zaimi", email: "a.zaimi@email.dz", phone: "+213 555 0606", orders: 5, spentDZD: 433350, status: "active" },
];

const statusStyle: Record<string, { bg: string; color: string }> = {
  active: { bg: "#DCFCE7", color: "#16a34a" },
  vip: { bg: "#F3E8FF", color: "#9333ea" },
  new: { bg: "#DBEAFE", color: "#2563eb" },
  inactive: { bg: "#F3F4F6", color: "#6b7280" },
};

export default function Customers() {
  const { t, fmt } = useApp();

  return (
    <div style={{ padding: "28px 32px" }}>
      <Header title={t("customers")} subtitle={`${customers.length} ${t("registered_customers")}`} />

      <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginBottom: 20 }}>
        <div style={{ position: "relative" }}>
          <Search size={14} style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "#aaa" }} />
          <input placeholder={t("search")} style={{ paddingLeft: 30, paddingRight: 12, paddingTop: 8, paddingBottom: 8, border: "1px solid #E5E7EB", borderRadius: 8, fontSize: 13, outline: "none", width: 200 }} />
        </div>
        <button style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 16px", background: "#C8F000", border: "none", borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
          <Plus size={14} /> {t("add_customer")}
        </button>
      </div>

      <div style={{ background: "#fff", borderRadius: 12, boxShadow: "0 1px 3px rgba(0,0,0,0.07)", overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
          <thead>
            <tr style={{ background: "#F9F9F9", borderBottom: "1px solid #F0F0F0" }}>
              {["ID", t("name"), t("email"), t("phone"), t("orders_col"), t("total_spent"), t("status")].map(h => (
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
                  <td style={{ padding: "13px 16px", fontWeight: 600 }}>{fmt(c.spentDZD)}</td>
                  <td style={{ padding: "13px 16px" }}>
                    <span style={{ background: st.bg, color: st.color, padding: "3px 10px", borderRadius: 10, fontSize: 11, fontWeight: 600 }}>{t(c.status)}</span>
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
