import type { Row } from "./results";
const PAL = ["#0f6b49", "#d4a537", "#1d4ed8", "#b91c1c", "#7c3aed", "#0891b2", "#be185d", "#65a30d", "#ea580c", "#475569"];
const label = (r: Row) => `${r.no ? "#" + r.no + " " : ""}${r.name}`;
const trunc = (s: string, n: number) => (s.length > n ? s.slice(0, n - 1) + "…" : s);

function prep(c: HTMLCanvasElement, w: number, h: number, dark: boolean, scale: number) {
  c.width = w * scale; c.height = h * scale; c.style.width = "100%"; c.style.maxWidth = w + "px";
  const g = c.getContext("2d")!; g.scale(scale, scale);
  g.fillStyle = dark ? "#0b1410" : "#ffffff"; g.fillRect(0, 0, w, h);
  g.font = "14px sans-serif"; g.textBaseline = "middle";
  return { g, ink: dark ? "#f6f1e4" : "#111111" };
}
export function drawBar(c: HTMLCanvasElement, rows: Row[], dark: boolean, scale = 2) {
  const W = 720, rh = 32, H = Math.max(60, rows.length * rh + 20), max = Math.max(1, ...rows.map((r) => r.votes));
  const { g, ink } = prep(c, W, H, dark, scale);
  if (!rows.length) { g.fillStyle = ink; g.fillText("No contestants yet", 10, 30); return; }
  rows.forEach((r, i) => {
    const y = 10 + i * rh, bw = ((W - 330) * r.votes) / max;
    g.fillStyle = ink; g.textAlign = "left"; g.fillText(trunc(label(r), 26), 8, y + 13);
    g.fillStyle = PAL[i % PAL.length]; g.fillRect(210, y + 2, Math.max(bw, 2), 22);
    g.fillStyle = ink; g.fillText(`${r.votes} (${r.pct.toFixed(1)}%)`, 216 + bw, y + 13);
  });
}
export function drawPie(c: HTMLCanvasElement, rows: Row[], dark: boolean, scale = 2) {
  const W = 720, H = Math.max(260, rows.length * 24 + 30), { g, ink } = prep(c, W, H, dark, scale);
  const total = rows.reduce((s, r) => s + r.votes, 0);
  if (!total) { g.fillStyle = ink; g.fillText("No votes yet", 10, 30); return; }
  let a = -Math.PI / 2; const cx = 130, cy = H / 2, R = 110;
  rows.forEach((r, i) => { if (!r.votes) return; const d = (r.votes / total) * Math.PI * 2; g.beginPath(); g.moveTo(cx, cy); g.arc(cx, cy, R, a, a + d); g.closePath(); g.fillStyle = PAL[i % PAL.length]; g.fill(); a += d; });
  rows.forEach((r, i) => { const y = 20 + i * 24; g.fillStyle = PAL[i % PAL.length]; g.fillRect(290, y - 7, 14, 14); g.fillStyle = ink; g.textAlign = "left"; g.fillText(`${trunc(label(r), 26)} – ${r.pct.toFixed(1)}%`, 312, y); });
}
export function imageOf(kind: "bar" | "pie", rows: Row[]) {
  const c = document.createElement("canvas"); (kind === "bar" ? drawBar : drawPie)(c, rows, false, 2);
  return { url: c.toDataURL("image/png"), w: c.width / 2, h: c.height / 2 };
}
