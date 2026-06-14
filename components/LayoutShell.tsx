"use client";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import Sidebar from "@/components/Sidebar";
import { useApp } from "@/context/AppContext";
import { Zap } from "lucide-react";

export default function LayoutShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { darkMode } = useApp();
  const [checking, setChecking] = useState(true);
  const [authed, setAuthed] = useState(false);
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
    <div style={{ display: "flex", minHeight: "100vh", background: bg, transition: "background 0.2s" }}>
      <Sidebar />
      <main style={{ flex: 1, overflow: "auto", background: bg, transition: "background 0.2s" }}>{children}</main>
    </div>
  );
}
