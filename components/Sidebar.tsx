"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, Package, ShoppingCart, Users,
  DollarSign, BarChart2, Settings, HelpCircle,
  LogOut, Zap
} from "lucide-react";

const nav = [
  { label: "Dashboard", icon: LayoutDashboard, href: "/" },
  { label: "Products", icon: Package, href: "/products" },
  { label: "Orders", icon: ShoppingCart, href: "/orders" },
  { label: "Customers", icon: Users, href: "/customers" },
  { label: "Finance", icon: DollarSign, href: "/finance" },
  { label: "Reports", icon: BarChart2, href: "/reports" },
];

const bottom = [
  { label: "Settings", icon: Settings, href: "/settings" },
  { label: "Help", icon: HelpCircle, href: "/help" },
];

export default function Sidebar() {
  const path = usePathname();

  return (
    <aside style={{
      width: 220,
      minHeight: "100vh",
      background: "#1C1C1C",
      display: "flex",
      flexDirection: "column",
      padding: "24px 0",
      flexShrink: 0,
    }}>
      {/* Logo */}
      <div style={{ padding: "0 20px 32px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{
            width: 30, height: 30, borderRadius: 8,
            background: "#C8F000",
            display: "flex", alignItems: "center", justifyContent: "center"
          }}>
            <Zap size={16} color="#1C1C1C" fill="#1C1C1C" />
          </div>
          <span style={{ color: "#fff", fontWeight: 700, fontSize: 15, letterSpacing: 0.3 }}>
            ETS ZAIMI
          </span>
        </div>
      </div>

      {/* Main Nav */}
      <nav style={{ flex: 1, padding: "0 12px", display: "flex", flexDirection: "column", gap: 2 }}>
        <p style={{ color: "#555", fontSize: 10, fontWeight: 600, letterSpacing: 1.2, padding: "0 8px 8px", textTransform: "uppercase" }}>
          Main Menu
        </p>
        {nav.map(({ label, icon: Icon, href }) => {
          const active = path === href;
          return (
            <Link key={href} href={href} style={{
              display: "flex", alignItems: "center", gap: 10,
              padding: "9px 12px", borderRadius: 8,
              background: active ? "#C8F000" : "transparent",
              color: active ? "#1C1C1C" : "#999",
              fontWeight: active ? 600 : 400,
              fontSize: 13.5,
              textDecoration: "none",
              transition: "all 0.15s",
            }}
              onMouseEnter={e => { if (!active) (e.currentTarget as HTMLElement).style.background = "#2A2A2A"; (e.currentTarget as HTMLElement).style.color = "#fff"; }}
              onMouseLeave={e => { if (!active) (e.currentTarget as HTMLElement).style.background = "transparent"; (e.currentTarget as HTMLElement).style.color = "#999"; }}
            >
              <Icon size={16} />
              {label}
            </Link>
          );
        })}

        <p style={{ color: "#555", fontSize: 10, fontWeight: 600, letterSpacing: 1.2, padding: "16px 8px 8px", textTransform: "uppercase" }}>
          Support
        </p>
        {bottom.map(({ label, icon: Icon, href }) => (
          <Link key={href} href={href} style={{
            display: "flex", alignItems: "center", gap: 10,
            padding: "9px 12px", borderRadius: 8,
            color: "#666", fontSize: 13.5,
            textDecoration: "none",
          }}>
            <Icon size={16} />
            {label}
          </Link>
        ))}
      </nav>

      {/* User */}
      <div style={{ padding: "16px 20px 0", borderTop: "1px solid #2A2A2A" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{
            width: 32, height: 32, borderRadius: "50%",
            background: "#C8F000",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 12, fontWeight: 700, color: "#1C1C1C"
          }}>AZ</div>
          <div style={{ flex: 1 }}>
            <p style={{ color: "#fff", fontSize: 12, fontWeight: 600, margin: 0 }}>Admin ZAIMI</p>
            <p style={{ color: "#555", fontSize: 11, margin: 0 }}>Super Admin</p>
          </div>
          <LogOut size={14} color="#555" style={{ cursor: "pointer" }} />
        </div>
      </div>
    </aside>
  );
}
