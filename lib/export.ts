import type { ResultsData } from "./results";
import { imageOf } from "./charts";
const TEST = "TEST DATA – NOT FOR PUBLICATION";
const save = (blob: Blob, name: string) => { const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = name; a.click(); setTimeout(() => URL.revokeObjectURL(a.href), 1000); };

export async function exportExcel(d: ResultsData) {
  // @ts-ignore – browser bundle of exceljs has no type declarations
  const mod: any = await import("exceljs/dist/exceljs.min.js");
  const wb = new (mod.default ?? mod).Workbook(), test = d.environment !== "live";
  const sum = wb.addWorksheet("Summary");
  let r0 = 1; if (test) { sum.getCell("A1").value = TEST; sum.getCell("A1").font = { bold: true, color: { argb: "FFB91C1C" } }; r0 = 3; }
  sum.getRow(r0).values = ["Category", "Division", "Total votes", "Leader", "Leader votes", "Leader %", "Results published"];
  sum.getRow(r0).font = { bold: true };
  d.divisions.forEach((v, i) => { const t = v.rows[0]; sum.getRow(r0 + 1 + i).values = [v.category, v.title, v.total, t && t.votes ? `#${t.no ?? ""} ${t.name}` : "—", t?.votes ?? 0, t ? +t.pct.toFixed(1) : 0, v.published ? "Yes" : "No"]; });
  sum.columns.forEach((c: any, i: number) => (c.width = [28, 24, 12, 28, 12, 10, 16][i]));
  const used = new Set<string>(["Summary"]);
  for (const v of d.divisions) {
    let n = v.title.replace(/[\\/?*\[\]:]/g, "").slice(0, 28) || "Division"; while (used.has(n)) n += "_"; used.add(n);
    const ws = wb.addWorksheet(n); let r = 1;
    if (test) { ws.getCell("A1").value = TEST; ws.getCell("A1").font = { bold: true, color: { argb: "FFB91C1C" } }; r = 3; }
    ws.getCell(`A${r}`).value = `${v.category} – ${v.title}`; ws.getCell(`A${r}`).font = { bold: true, size: 14 };
    ws.getRow(r + 2).values = ["Rank", "No.", "Contestant", "Votes", "Share %", "Via own link"]; ws.getRow(r + 2).font = { bold: true };
    v.rows.forEach((x, i) => (ws.getRow(r + 3 + i).values = [x.rank, x.no ?? "", x.name, x.votes, +x.pct.toFixed(1), x.viaLink]));
    const tr = r + 3 + v.rows.length; ws.getRow(tr).values = ["", "", "Total", v.total, v.total ? 100 : 0, ""]; ws.getRow(tr).font = { bold: true };
    ws.columns.forEach((c: any, i: number) => (c.width = [8, 8, 30, 10, 10, 14][i]));
    let y = tr + 2;
    for (const kind of ["bar", "pie"] as const) { const im = imageOf(kind, v.rows); const id = wb.addImage({ base64: im.url, extension: "png" }); ws.addImage(id, { tl: { col: 0, row: y }, ext: { width: im.w * 0.9, height: im.h * 0.9 } }); y += Math.ceil((im.h * 0.9) / 20) + 2; }
  }
  const buf = await wb.xlsx.writeBuffer();
  save(new Blob([buf], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" }), `mr-miss-kericho-results${test ? "-TEST" : ""}.xlsx`);
}

export async function exportPdf(d: ResultsData) {
  const { jsPDF } = await import("jspdf"); const doc = new jsPDF({ unit: "mm", format: "a4" }), test = d.environment !== "live";
  const foot = () => { doc.setFontSize(8); doc.setTextColor(120); doc.text(`Mr & Miss Kericho 2027 – generated ${new Date(d.generatedAt).toLocaleString("en-KE")}`, 15, 290); if (test) { doc.setTextColor(185, 28, 28); doc.text(TEST, 195, 290, { align: "right" }); } };
  d.divisions.forEach((v, i) => {
    if (i) doc.addPage(); let y = 20;
    doc.setTextColor(15, 107, 73); doc.setFontSize(18); doc.text(v.title, 15, y); y += 7;
    doc.setTextColor(60); doc.setFontSize(10); doc.text(`${v.category} · total votes ${v.total}`, 15, y); y += 9;
    doc.setFont("helvetica", "bold"); ["Rank", "No.", "Contestant", "Votes", "Share", "Own link"].forEach((h, k) => doc.text(h, [15, 30, 45, 120, 145, 170][k], y)); doc.setFont("helvetica", "normal"); y += 2; doc.line(15, y, 195, y); y += 5;
    v.rows.slice(0, 18).forEach((r) => { doc.setTextColor(20); [String(r.rank), r.no ? "#" + r.no : "", r.name.slice(0, 38), String(r.votes), r.pct.toFixed(1) + "%", String(r.viaLink)].forEach((t, k) => doc.text(t, [15, 30, 45, 120, 145, 170][k], y)); y += 6; });
    if (v.rows.length > 18) { doc.setTextColor(120); doc.text(`…and ${v.rows.length - 18} more (see the Excel export)`, 15, y); y += 6; }
    y += 4; const bar = imageOf("bar", v.rows.slice(0, 18)); const bw = 180, bh = Math.min((bar.h / bar.w) * bw, 90); doc.addImage(bar.url, "PNG", 15, y, bw, bh); y += bh + 6;
    const pie = imageOf("pie", v.rows.slice(0, 18)); const ph = (pie.h / pie.w) * bw; if (y + ph < 282) doc.addImage(pie.url, "PNG", 15, y, bw, ph);
    foot();
  });
  if (!d.divisions.length) { doc.text("No results to show.", 15, 20); foot(); }
  save(doc.output("blob"), `mr-miss-kericho-results${test ? "-TEST" : ""}.pdf`);
}
