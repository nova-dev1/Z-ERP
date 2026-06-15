"use client";
import * as XLSX from "xlsx";

export function exportToExcel(data: any[], columns: { key: string; label: string }[], filename: string) {
  const rows = data.map(item => {
    const row: Record<string, any> = {};
    columns.forEach(col => { row[col.label] = item[col.key] ?? ""; });
    return row;
  });

  const ws = XLSX.utils.json_to_sheet(rows);
  const wb = XLSX.utils.book_new();

  // Column widths
  ws["!cols"] = columns.map(() => ({ wch: 22 }));

  XLSX.utils.book_append_sheet(wb, ws, "ETS ZAIMI");
  XLSX.writeFile(wb, `${filename}-${new Date().toLocaleDateString("fr-DZ").replace(/\//g, "-")}.xlsx`);
}
