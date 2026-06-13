import type { Metadata } from "next";
import "./globals.css";
import Sidebar from "@/components/Sidebar";
import { AppProvider } from "@/context/AppContext";

export const metadata: Metadata = {
  title: "ETS ZAIMI — ERP",
  description: "Internal business management platform",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body style={{ margin: 0 }}>
        <AppProvider>
          <div style={{ display: "flex", minHeight: "100vh" }}>
            <Sidebar />
            <main style={{ flex: 1, overflow: "auto" }}>{children}</main>
          </div>
        </AppProvider>
      </body>
    </html>
  );
}
