"use client";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import Sidebar from "@/components/Sidebar";
import { Zap } from "lucide-react";

export default function LayoutShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [checking, setChecking] = useState(true);
  const [authed, setAuthed] = useState(false);

  const isLoginPage = pathname === "/login";

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setAuthed(true);
        if (isLoginPage) router.replace("/");
      } else {
        setAuthed(false);
        if (!isLoginPage) router.replace("/login");
      }
      setChecking(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        setAuthed(true);
        if (isLoginPage) router.replace("/");
      } else {
        setAuthed(false);
        router.replace("/login");
      }
    });

    return () => subscription.unsubscribe();
  }, [pathname]);

  if (checking) {
    return (
      <div style={{ minHeight: "100vh", background: "#F0F0F0", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ width: 48, height: 48, borderRadius: 12, background: "#1C1C1C", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 12px" }}>
            <Zap size={24} color="#C8F000" fill="#C8F000" />
          </div>
          <p style={{ color: "#888", fontSize: 13 }}>Chargement...</p>
        </div>
      </div>
    );
  }

  if (isLoginPage) return <>{children}</>;

  if (!authed) return null;

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <Sidebar />
      <main style={{ flex: 1, overflow: "auto" }}>{children}</main>
    </div>
  );
}
