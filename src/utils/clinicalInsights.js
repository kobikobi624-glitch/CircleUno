export function getClinicalInsights(patient) {
  const entries = patient.entries || [];

  if (entries.length === 0) {
    return {
      trend: "אין מספיק נתונים",
      trendLabel: "אין נתונים",
      trendIcon: "➡️",
      risk: "low",
      riskLabel: "נמוך",
      riskColor: "#22c55e",
      dominantTrigger: "לא ידוע",
      avoidanceRate: 0,
      complianceRate: 0,
      overallAvg: 0,
      note: "מטופל חדש – נדרש איסוף נתונים ראשוני",
    };
  }

  const sorted = [...entries].sort((a,b) => new Date(a.timestamp) - new Date(b.timestamp));

  const half = Math.floor(sorted.length / 2);
  const firstHalf  = sorted.slice(0, half);
  const secondHalf = sorted.slice(half);
  const avg = arr => arr.reduce((s,i) => s + i.anxiety, 0) / arr.length;
  const firstAvg  = avg(firstHalf);
  const secondAvg = avg(secondHalf);
  const diff = secondAvg - firstAvg;

  let trend, trendLabel, trendIcon;
  if (diff > 12)       { trend = "rising";    trendLabel = "עולה";  trendIcon = "📈"; }
  else if (diff < -12) { trend = "improving"; trendLabel = "יורד";  trendIcon = "📉"; }
  else                 { trend = "stable";    trendLabel = "יציב";  trendIcon = "➡️"; }

  const overallAvg = avg(sorted);
  let risk, riskLabel, riskColor;
  if (overallAvg > 68 || trend === "rising") { risk = "high";   riskLabel = "גבוה";   riskColor = "#ef4444"; }
  else if (overallAvg > 45)                  { risk = "medium"; riskLabel = "בינוני"; riskColor = "#f59e0b"; }
  else                                       { risk = "low";    riskLabel = "נמוך";   riskColor = "#22c55e"; }

  const counts = {};
  entries.forEach(e => { if (e.trigger) counts[e.trigger] = (counts[e.trigger] || 0) + 1; });
  const dominantTrigger = Object.entries(counts).sort((a,b) => b[1]-a[1])[0]?.[0] || "לא ידוע";

  const avoidCount = entries.filter(e => e.response === "no").length;
  const avoidanceRate = Math.round((avoidCount / entries.length) * 100);
  const complianceRate = 100 - avoidanceRate;

  let note;
  if (risk === "high")          note = "נראית עלייה ברמת החרדה עם נטייה להימנעות – מומלץ להתמקד בחשיפות הדרגתיות.";
  else if (trend === "improving") note = "יש שיפור עקבי ברמת החרדה והתגברות על תגובות הימנעות.";
  else                            note = "מצב יציב יחסית, נדרש המשך ניטור כדי לזהות דפוסים.";

  return {
    trend, trendLabel, trendIcon,
    risk, riskLabel, riskColor,
    dominantTrigger,
    avoidanceRate,
    complianceRate,
    overallAvg: Math.round(overallAvg),
    note,
  };
}
