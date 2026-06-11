import jsPDF from "jspdf";
import { getClinicalInsights } from "./clinicalInsights";

export function generateWeeklyReport(patient) {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });

  const entries = patient.entries || [];
  const weekAgo = Date.now() - 7 * 86400000;
  const weekly  = entries.filter(e => new Date(e.timestamp).getTime() > weekAgo);
  const insights = getClinicalInsights(patient);

  const avg  = weekly.length > 0 ? weekly.reduce((s,e)=>s+e.anxiety,0)/weekly.length : 0;
  const avoidCount = weekly.filter(e=>e.response==="no").length;
  const avoidPct   = weekly.length > 0 ? Math.round(avoidCount/weekly.length*100) : 0;

  const triggers = {};
  weekly.forEach(e => { if(e.trigger) triggers[e.trigger] = (triggers[e.trigger]||0)+1; });
  const topTriggers = Object.entries(triggers).sort((a,b)=>b[1]-a[1]).slice(0,3);

  const pageW = 210;
  const margin = 18;
  let y = 0;

  // ── Header bar
  doc.setFillColor(99, 102, 241);
  doc.rect(0, 0, pageW, 30, "F");
  doc.setTextColor(255,255,255);
  doc.setFontSize(18);
  doc.setFont("helvetica","bold");
  doc.text("CircleUno", margin, 12);
  doc.setFontSize(10);
  doc.setFont("helvetica","normal");
  doc.text("Weekly Clinical Report", margin, 20);
  doc.text(`Generated: ${new Date().toLocaleDateString("he-IL")}`, pageW - margin, 20, { align: "right" });
  y = 38;

  // ── Patient info
  doc.setTextColor(15,23,42);
  doc.setFontSize(14);
  doc.setFont("helvetica","bold");
  doc.text(`Patient: ${patient.name || patient.code}  (${patient.code})`, margin, y);
  y += 8;

  doc.setFontSize(10);
  doc.setFont("helvetica","normal");
  doc.setTextColor(100,116,139);
  doc.text(`Report period: last 7 days  ·  Events this week: ${weekly.length}`, margin, y);
  y += 10;

  // ── Divider
  doc.setDrawColor(226,232,240);
  doc.line(margin, y, pageW - margin, y);
  y += 8;

  // ── KPI row (4 boxes)
  const kpis = [
    { label: "Avg Anxiety", value: avg.toFixed(1) },
    { label: "Events", value: weekly.length },
    { label: "Avoidance", value: `${avoidPct}%` },
    { label: "Risk", value: insights.riskLabel },
  ];
  const boxW = (pageW - 2*margin - 9) / 4;
  kpis.forEach((k, i) => {
    const x = margin + i * (boxW + 3);
    doc.setFillColor(241,245,249);
    doc.roundedRect(x, y, boxW, 18, 3, 3, "F");
    doc.setFontSize(16);
    doc.setFont("helvetica","bold");
    doc.setTextColor(99,102,241);
    doc.text(String(k.value), x + boxW/2, y + 10, { align: "center" });
    doc.setFontSize(8);
    doc.setFont("helvetica","normal");
    doc.setTextColor(100,116,139);
    doc.text(k.label, x + boxW/2, y + 15, { align: "center" });
  });
  y += 26;

  // ── Clinical Insights
  doc.setFontSize(12);
  doc.setFont("helvetica","bold");
  doc.setTextColor(15,23,42);
  doc.text("Clinical Insights", margin, y);
  y += 7;

  const insightLines = [
    `Trend: ${insights.trendLabel}  (${insights.trendIcon})`,
    `Dominant Trigger: ${insights.dominantTrigger}`,
    `Compliance Rate: ${insights.complianceRate}%`,
    `Note: ${insights.note}`,
  ];
  doc.setFontSize(10);
  doc.setFont("helvetica","normal");
  doc.setTextColor(71,85,105);
  insightLines.forEach(line => {
    const wrapped = doc.splitTextToSize(line, pageW - 2*margin);
    doc.text(wrapped, margin, y);
    y += wrapped.length * 6;
  });
  y += 4;

  // ── Top Triggers
  if (topTriggers.length > 0) {
    doc.setFillColor(238,242,255);
    doc.roundedRect(margin, y, pageW-2*margin, 8 + topTriggers.length*7, 4, 4, "F");
    doc.setFontSize(11);
    doc.setFont("helvetica","bold");
    doc.setTextColor(99,102,241);
    doc.text("Top Triggers This Week", margin+4, y+6);
    y += 12;
    doc.setFontSize(10);
    doc.setFont("helvetica","normal");
    doc.setTextColor(15,23,42);
    topTriggers.forEach(([t, c]) => {
      doc.text(`• ${t}  (${c}x)`, margin+6, y);
      y += 7;
    });
    y += 4;
  }

  // ── Divider
  doc.setDrawColor(226,232,240);
  doc.line(margin, y, pageW-margin, y);
  y += 8;

  // ── Events table header
  if (weekly.length > 0) {
    doc.setFontSize(12);
    doc.setFont("helvetica","bold");
    doc.setTextColor(15,23,42);
    doc.text("Events (last 7 days)", margin, y);
    y += 6;

    doc.setFillColor(241,245,249);
    doc.rect(margin, y, pageW-2*margin, 8, "F");
    doc.setFontSize(9);
    doc.setFont("helvetica","bold");
    doc.setTextColor(100,116,139);
    doc.text("Date", margin+2, y+5.5);
    doc.text("Trigger", margin+32, y+5.5);
    doc.text("Anxiety", margin+90, y+5.5);
    doc.text("Response", margin+112, y+5.5);
    y += 10;

    doc.setFont("helvetica","normal");
    doc.setFontSize(9);
    weekly.slice(0,15).forEach((e,i) => {
      if (i % 2 === 1) {
        doc.setFillColor(248,250,252);
        doc.rect(margin, y-3, pageW-2*margin, 7, "F");
      }
      const resp = e.response==="no"?"נמנע":e.response==="partial"?"חלקי":"התמודד";
      doc.setTextColor(15,23,42);
      doc.text(new Date(e.timestamp).toLocaleDateString("he-IL"), margin+2, y+2);
      doc.text(String(e.trigger||"—").substring(0,30), margin+32, y+2);
      doc.setTextColor(e.anxiety>=70?"#ef4444":e.anxiety>=40?"#f59e0b":"#22c55e");
      doc.setTextColor(e.anxiety>=70?239:e.anxiety>=40?245:34,
                       e.anxiety>=70?68:e.anxiety>=40?158:197,
                       e.anxiety>=70?68:e.anxiety>=40?11:94);
      doc.text(String(e.anxiety), margin+95, y+2);
      doc.setTextColor(71,85,105);
      doc.text(resp, margin+112, y+2);
      y += 7;
      if (y > 270) { doc.addPage(); y = 20; }
    });
  }

  // ── Footer
  const totalPages = doc.internal.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(148,163,184);
    doc.text(`CircleUno Clinical Report · ${patient.code} · Page ${i}/${totalPages}`, pageW/2, 290, { align: "center" });
  }

  doc.save(`circleuno_report_${patient.code}_${new Date().toISOString().slice(0,10)}.pdf`);
}
