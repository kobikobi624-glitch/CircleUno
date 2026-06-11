import { useMemo, useState } from "react";

export default function Patients({ onSelect }) {
  const [refresh, setRefresh] = useState(0);
  const [search, setSearch] = useState("");

  const patients = JSON.parse(localStorage.getItem("circleuno_patients") || "[]");
  const entries  = JSON.parse(localStorage.getItem("circleuno_entries")  || "[]");

  const deletePatient = (code) => {
    if (!confirm("למחוק מטופל זה? הפעולה בלתי הפיכה.")) return;
    const up = patients.filter(p => p.code !== code);
    localStorage.setItem("circleuno_patients", JSON.stringify(up));
    const fe = entries.filter(e => e.patientCode !== code);
    localStorage.setItem("circleuno_entries", JSON.stringify(fe));
    setRefresh(r => r+1);
  };

  const resetPatient = (code) => {
    if (!confirm("לאפס את כל הנתונים של מטופל זה?")) return;
    const fe = entries.filter(e => e.patientCode !== code);
    localStorage.setItem("circleuno_entries", JSON.stringify(fe));
    setRefresh(r => r+1);
  };

  const enriched = useMemo(() => {
    return patients.map(p => {
      const pe = entries.filter(e => e.patientCode === p.code);
      const avg = pe.length > 0 ? pe.reduce((s,e)=>s+e.anxiety,0)/pe.length : 0;
      const lastSeen = pe.length > 0
        ? pe.sort((a,b)=>new Date(b.timestamp)-new Date(a.timestamp))[0].timestamp
        : p.createdAt;
      return { ...p, entries: pe, anxiety: Math.round(avg), entryCount: pe.length, lastSeen };
    }).filter(p => !search || p.name?.includes(search) || p.code.includes(search.toUpperCase()));
  }, [patients, entries, refresh, search]);

  const riskColor = (a) => a >= 65 ? "#ef4444" : a >= 40 ? "#f59e0b" : "#22c55e";
  const riskLabel = (a) => a >= 65 ? "גבוה" : a >= 40 ? "בינוני" : "נמוך";

  return (
    <div style={{ padding: "16px 20px", direction: "rtl" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
        <h2 style={{ margin: 0, fontSize: 20 }}>👥 מטופלים ({enriched.length})</h2>
        <input
          placeholder="🔍 חיפוש..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ width: 180, fontSize: 13 }}
        />
      </div>

      {enriched.length === 0 && (
        <div style={{ textAlign: "center", padding: "40px 0", color: "#94a3b8" }}>
          <div style={{ fontSize: 32, marginBottom: 8 }}>👥</div>
          <div>{search ? "לא נמצאו תוצאות" : "אין מטופלים עדיין"}</div>
        </div>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {enriched.map(p => (
          <div
            key={p.code}
            onClick={() => onSelect(p)}
            className="card"
            style={{
              cursor: "pointer",
              borderRight: `4px solid ${riskColor(p.anxiety)}`,
              transition: "transform 0.1s, box-shadow 0.1s",
            }}
            onMouseEnter={e => e.currentTarget.style.transform = "translateY(-1px)"}
            onMouseLeave={e => e.currentTarget.style.transform = "translateY(0)"}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
              <div>
                <span style={{ fontWeight: 700, fontSize: 15 }}>{p.name}</span>
                <span style={{ fontSize: 12, color: "#94a3b8", marginRight: 8 }}>{p.code}</span>
              </div>
              <span style={{
                padding: "3px 10px", borderRadius: 999, fontSize: 12, fontWeight: 700,
                background: riskColor(p.anxiety) + "18", color: riskColor(p.anxiety),
              }}>
                {riskLabel(p.anxiety)} · {p.anxiety}
              </span>
            </div>

            <div style={{ display: "flex", gap: 16, fontSize: 12, color: "#64748b", marginBottom: 10, flexWrap: "wrap" }}>
              <span>📋 {p.entryCount} אירועים</span>
              <span>🕒 {p.lastSeen ? new Date(p.lastSeen).toLocaleDateString("he-IL") : "—"}</span>
            </div>

            <div style={{ display: "flex", gap: 8 }} onClick={e => e.stopPropagation()}>
              <button
                onClick={() => resetPatient(p.code)}
                style={{ flex:1, padding: "8px", borderRadius: 8, border: "1px solid #f59e0b", background: "white", color: "#f59e0b", fontWeight: 600, fontSize: 12, cursor: "pointer" }}
              >
                🔄 איפוס
              </button>
              <button
                onClick={() => deletePatient(p.code)}
                style={{ flex:1, padding: "8px", borderRadius: 8, border: "1px solid #ef4444", background: "white", color: "#ef4444", fontWeight: 600, fontSize: 12, cursor: "pointer" }}
              >
                🗑 מחיקה
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
