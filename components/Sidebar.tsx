"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Package, ShoppingCart, Users, DollarSign, BarChart2, Settings, HelpCircle, LogOut, Zap, FileText } from "lucide-react";
import { useApp } from "@/context/AppContext";
import { supabase } from "@/lib/supabase";

export default function Sidebar() {
  const path = usePathname();
  const { t, darkMode } = useApp();

  const sidebarBg = darkMode ? "#0A0A0A" : "#1C1C1C";
  const inactiveColor = darkMode ? "#666" : "#999";
  const borderColor = darkMode ? "#1A1A1A" : "#2A2A2A";

  const nav = [
    { key: "dashboard", icon: LayoutDashboard, href: "/" },
    { key: "products", icon: Package, href: "/products" },
    { key: "orders", icon: ShoppingCart, href: "/orders" },
    { key: "invoices", icon: FileText, href: "/invoices" },
    { key: "customers", icon: Users, href: "/customers" },
    { key: "finance", icon: DollarSign, href: "/finance" },
    { key: "reports", icon: BarChart2, href: "/reports" },
  ];
  const bottom = [
    { key: "settings", icon: Settings, href: "/settings" },
    { key: "help", icon: HelpCircle, href: "/help" },
  ];

  const navLabels: Record<string, string> = { invoices: "Factures" };

  return (
    <aside style={{ width: 220, minHeight: "100vh", background: sidebarBg, display: "flex", flexDirection: "column", padding: "24px 0", flexShrink: 0, transition: "background 0.2s" }}>
      <div style={{ padding: "0 20px 32px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ width: 30, height: 30, borderRadius: 8, background: "#C8F000", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Zap size={16} color="#1C1C1C" fill="#1C1C1C" />
          </div>
          <span style={{ color: "#fff", fontWeight: 700, fontSize: 15 }}>ETS ZAIMI</span>
        </div>
      </div>

      <nav style={{ flex: 1, padding: "0 12px", display: "flex", flexDirection: "column", gap: 2 }}>
        <p style={{ color: "#555", fontSize: 10, fontWeight: 600, letterSpacing: 1.2, padding: "0 8px 8px", textTransform: "uppercase" }}>{t("main_menu")}</p>
        {nav.map(({ key, icon: Icon, href }) => {
          const active = path === href;
          return (
            <Link key={href} href={href} style={{
              display: "flex", alignItems: "center", gap: 10, padding: "9px 12px", borderRadius: 8,
              background: active ? "#C8F000" : "transparent",
              color: active ? "#1C1C1C" : inactiveColor,
              fontWeight: active ? 600 : 400, fontSize: 13.5, textDecoration: "none", transition: "all 0.15s",
            }}>
              <Icon size={16} />
              {navLabels[key] || t(key)}
            </Link>
          );
        })}
        <p style={{ color: "#555", fontSize: 10, fontWeight: 600, letterSpacing: 1.2, padding: "16px 8px 8px", textTransform: "uppercase" }}>{t("support")}</p>
        {bottom.map(({ key, icon: Icon, href }) => (
          <Link key={href} href={href} style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 12px", borderRadius: 8, color: inactiveColor, fontSize: 13.5, textDecoration: "none" }}>
            <Icon size={16} /> {t(key)}
          </Link>
        ))}
      </nav>

      <div style={{ padding: "16px 20px 0", borderTop: `1px solid ${borderColor}` }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 32, height: 32, borderRadius: "50%", background: "#C8F000", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, color: "#1C1C1C" }}>AZ</div>
          <div style={{ flex: 1 }}>
            <p style={{ color: "#fff", fontSize: 12, fontWeight: 600, margin: 0 }}>Admin ZAIMI</p>
            <p style={{ color: "#555", fontSize: 11, margin: 0 }}>Super Admin</p>
          </div>
          <LogOut size={14} color="#555" style={{ cursor: "pointer" }} onClick={() => supabase.auth.signOut()} />
        </div>
      </div>
    </aside>
  );
}
