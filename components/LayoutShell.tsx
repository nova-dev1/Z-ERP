"use client";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import Sidebar from "@/components/Sidebar";
import { useApp } from "@/context/AppContext";
import { Zap, Menu, X } from "lucide-react";

export default function LayoutShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { darkMode } = useApp();
  const [checking, setChecking] = useState(true);
  const [authed, setAuthed] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const isLoginPage = pathname === "/login";

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) { setAuthed(true); if (isLoginPage) router.replace("/"); }
      else { setAuthed(false); if (!isLoginPage) router.replace("/login"); }
      setChecking(false);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      if (session) { setAuthed(true); if (isLoginPage) router.replace("/"); }
      else { setAuthed(false); router.replace("/login"); }
    });
    return () => subscription.unsubscribe();
  }, [pathname]);

  // Close sidebar on route change (mobile)
  useEffect(() => { setSidebarOpen(false); }, [pathname]);

  const bg = darkMode ? "#111" : "#F0F0F0";

  if (checking) return (
    <div style={{ minHeight: "100vh", background: bg, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ textAlign: "center" }}>
        <div style={{ width: 48, height: 48, borderRadius: 12, background: "#1C1C1C", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 12px" }}>
          <Zap size={24} color="#C8F000" fill="#C8F000" />
        </div>
        <p style={{ color: "#888", fontSize: 13 }}>Chargement...</p>
      </div>
    </div>
  );

  if (isLoginPage) return <>{children}</>;
  if (!authed) return null;

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: bg, transition: "background 0.2s", position: "relative" }}>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="mobile-overlay" onClick={() => setSidebarOpen(false)}
          style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", zIndex: 199 }} />
      )}

      {/* Sidebar */}
      <div className={`sidebar ${sidebarOpen ? "open" : ""}`}
        style={{ position: "relative", display: "flex", flexShrink: 0 }}>
        <Sidebar />
      </div>

      {/* Main */}
      <main style={{ flex: 1, overflow: "auto", background: bg, transition: "background 0.2s", minWidth: 0 }}>

        {/* Mobile top bar */}
        <div className="mobile-menu-btn" style={{
          display: "none", alignItems: "center", justifyContent: "space-between",
          padding: "14px 16px", background: darkMode ? "#0A0A0A" : "#1C1C1C", position: "sticky", top: 0, zIndex: 100
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 28, height: 28, borderRadius: 6, background: "#C8F000", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Zap size={14} color="#1C1C1C" fill="#1C1C1C" />
            </div>
            <span style={{ color: "#fff", fontWeight: 700, fontSize: 14 }}>ETS ZAIMI</span>
          </div>
          <button onClick={() => setSidebarOpen(!sidebarOpen)}
            style={{ background: "none", border: "none", cursor: "pointer", color: "#fff", display: "flex", padding: 4 }}>
            {sidebarOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>

        {children}
      </main>
    </div>
  );
}
