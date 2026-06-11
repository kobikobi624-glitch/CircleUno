export function getClinicalInsights(patient) {
  const entries = patient.entries || [];

  if (entries.length === 0) {
    return {
      trend: "אין מספיק נתונים",
      risk: "low",
      riskLabel: "נמוך",
      dominantTrigger: "לא ידוע",
      avoidanceRate: 0,
      complianceRate: 0,
      note: "מטופל חדש – נדרש איסוף נתונים ראשוני",
      weeklyAvg: [],
    };
  }

  const sorted = [...entries].sort((a,b)=>new Date(a.timestamp)-new Date(b.timestamp));

  // trend
  const half = Math.floor(sorted.length / 2);
  const firstHalf  = sorted.slice(0, half);
  const secondHalf = sorted.slice(half);
  const avg = arr => arr.reduce((s,i)=>s+i.anxiety,0)/arr.length;
  const firstAvg  = avg(firstHalf);
  const secondAvg = avg(secondHalf);
  const diff = secondAvg - firstAvg;

  let trend, trendLabel, trendIcon;
  if (diff > 12)      { trend = "rising";    trendLabel = "עולה";    trendIcon = "📈"; }
  else if (diff < -12){ trend = "improving"; trendLabel = "יורד";    trendIcon = "📉"; }
  else                { trend = "stable";    trendLabel = "יציב";    trendIcon = "➡️"; }

  // risk
  const overallAvg = avg(sorted);
  let risk, riskLabel, riskColor;
  if (overallAvg > 68 || trend === "rising") { risk = "high";   riskLabel = "גבוה";   riskColor = "#ef4444"; }
  else if (overallAvg > 45)                  { risk = "medium"; riskLabel = "בינוני"; riskColor = "#f59e0b"; }
  else                                       { risk = "low";    riskLabel = "נמוך";   riskColor = "#22c55e"; }

  // dominant trigger
  const counts = {};
  entries.forEach(e => { if (e.trigger) counts[e.trigger] = (counts[e.trigger]||0)+1; });
  const dominantTrigger = Object.entries(counts).sort((a,b)=>b[1]-a[1])[0]?.[0] || "לא ידוע";

  // avoidance / compliance
  const avoidCount = entries.filter(e=>e.response==="no").length;
  const avoidanceRate = Math.round((avoidCount / entries.length)*100);
  const complianceRate = 100 - avoidanceRate;

  // weekly avg for sparkline (last 7 weeks)
  const weeklyAvg = [];
  for (let w = 6; w >= 0; w--) {
    const from = Date.now() - (w+1)*7*86400000;
    const to   = Date.now() - w*7*86400000;
    const weekEntries = entries.filter(e=>{
      const t = new Date(e.timestamp).getTime();
      return t >= from && t < to;
    });
    weeklyAvg.push({
      week: `W-${w}`,
      avg: weekEntries.length > 0 ? Math.round(avg(weekEntries)) : null,
    });
  }

  // note
  let note;
  if (risk === "high")        note = "נראית עלייה ברמת החרדה עם נטייה להימנעות – מומלץ להתמקד בחשיפות הדרגתיות.";
  else if (trend==="improving") note = "יש שיפור עקבי ברמת החרדה והתגברות על תגובות הימנעות.";
  else                          note = "מצב יציב יחסית, נדרש המשך ניטור כדי לזהות דפוסים.";

  return {
    trend, trendLabel, trendIcon,
    risk, riskLabel, riskColor,
    dominantTrigger,
    avoidanceRate,
    complianceRate,
    note,
    weeklyAvg,
    overallAvg: Math.round(overallAvg),
  };
}
