"use client";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export function generateInvoicePDF(order: any) {
  const doc = new jsPDF();
  const pageW = doc.internal.pageSize.getWidth();

  // Header background
  doc.setFillColor(28, 28, 28);
  doc.rect(0, 0, pageW, 45, "F");

  // Company name
  doc.setTextColor(200, 240, 0);
  doc.setFontSize(22);
  doc.setFont("helvetica", "bold");
  doc.text("ETS ZAIMI", 14, 20);

  // Subtitle
  doc.setTextColor(180, 180, 180);
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.text("Solutions Technologiques — IoT & CCTV", 14, 28);
  doc.text("Tlemcen, Algérie  |  itlab7@etszaimi.com", 14, 34);

  // FACTURE label
  doc.setTextColor(200, 240, 0);
  doc.setFontSize(28);
  doc.setFont("helvetica", "bold");
  doc.text("FACTURE", pageW - 14, 22, { align: "right" });
  doc.setFontSize(10);
  doc.setTextColor(180, 180, 180);
  doc.text(order.code || "#FAC-0001", pageW - 14, 32, { align: "right" });

  // Reset text color
  doc.setTextColor(30, 30, 30);

  // Invoice info box
  doc.setFillColor(245, 245, 245);
  doc.roundedRect(14, 52, pageW - 28, 32, 3, 3, "F");

  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.text("DATE D'ÉMISSION", 20, 62);
  doc.text("STATUT", 80, 62);
  doc.text("CLIENT", 130, 62);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  const date = order.created_at
    ? new Date(order.created_at).toLocaleDateString("fr-DZ", { day: "2-digit", month: "long", year: "numeric" })
    : new Date().toLocaleDateString("fr-DZ", { day: "2-digit", month: "long", year: "numeric" });
  doc.text(date, 20, 72);

  const statusLabels: Record<string, string> = {
    delivered: "Livré", processing: "En cours", pending: "En attente", cancelled: "Annulé"
  };
  const statusColors: Record<string, [number, number, number]> = {
    delivered: [22, 163, 74], processing: [37, 99, 235], pending: [202, 138, 4], cancelled: [220, 38, 38]
  };
  const statusColor = statusColors[order.status] || [100, 100, 100];
  doc.setTextColor(...statusColor);
  doc.setFont("helvetica", "bold");
  doc.text(statusLabels[order.status] || order.status, 80, 72);
  doc.setTextColor(30, 30, 30);
  doc.setFont("helvetica", "normal");
  doc.text(order.customer_name || "—", 130, 72);

  // Products table
  autoTable(doc, {
    startY: 92,
    head: [["Produit", "Quantité", "Prix Unitaire", "Total"]],
    body: [
      [
        order.product || "—",
        String(order.qty || 1),
        `${Math.round((order.total_dzd || 0) / (order.qty || 1)).toLocaleString("fr-DZ")} DA`,
        `${(order.total_dzd || 0).toLocaleString("fr-DZ")} DA`,
      ]
    ],
    styles: { fontSize: 10, cellPadding: 8 },
    headStyles: {
      fillColor: [28, 28, 28],
      textColor: [200, 240, 0],
      fontStyle: "bold",
      fontSize: 10,
    },
    alternateRowStyles: { fillColor: [248, 248, 248] },
    columnStyles: {
      0: { cellWidth: 80 },
      1: { cellWidth: 30, halign: "center" },
      2: { cellWidth: 40, halign: "right" },
      3: { cellWidth: 40, halign: "right", fontStyle: "bold" },
    },
  });

  const finalY = (doc as any).lastAutoTable.finalY + 10;

  // Total box
  doc.setFillColor(28, 28, 28);
  doc.roundedRect(pageW - 80, finalY, 66, 24, 3, 3, "F");
  doc.setTextColor(150, 150, 150);
  doc.setFontSize(9);
  doc.text("TOTAL TTC", pageW - 47, finalY + 9, { align: "center" });
  doc.setTextColor(200, 240, 0);
  doc.setFontSize(13);
  doc.setFont("helvetica", "bold");
  doc.text(`${(order.total_dzd || 0).toLocaleString("fr-DZ")} DA`, pageW - 47, finalY + 19, { align: "center" });

  // Signature area
  doc.setTextColor(150, 150, 150);
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.text("Signature & Cachet", 14, finalY + 40);
  doc.setDrawColor(200, 200, 200);
  doc.line(14, finalY + 55, 80, finalY + 55);

  // Footer
  const footerY = doc.internal.pageSize.getHeight() - 16;
  doc.setFillColor(28, 28, 28);
  doc.rect(0, footerY - 8, pageW, 24, "F");
  doc.setTextColor(150, 150, 150);
  doc.setFontSize(8);
  doc.text("ETS ZAIMI — Merci pour votre confiance", pageW / 2, footerY, { align: "center" });

  doc.save(`Facture-${order.code || "ETS-ZAIMI"}.pdf`);
}
