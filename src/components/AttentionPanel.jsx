export default function AttentionPanel({ patients }) {
  const getIssues = (patient) => {
    const issues = [];
    const anxietyDelta = patient.anxiety - (patient.prevAnxiety || 0);
    const responseDelta = (patient.responseRate || 0) - (patient.prevResponse || 0);
    if (patient.anxiety >= 70) issues.push({ label: "חרדה גבוהה", color: "#ef4444" });
    if (anxietyDelta > 10) issues.push({ label: `עלייה של ${anxietyDelta} בחרדה`, color: "#f59e0b" });
    if (responseDelta < -10) issues.push({ label: `ירידה של ${Math.abs(responseDelta)}% בתגובה`, color: "#f59e0b" });
    return issues;
  };

  const priorityPatients = patients.filter(p => getIssues(p).length > 0);

  if (priorityPatients.length === 0) {
    return (
      <div className="attention-panel" style={{ background: "#f0fdf4", border: "1px solid #bbf7d0" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: 20 }}>✅</span>
          <div>
            <div style={{ fontWeight: 600, color: "#166534" }}>כל המטופלים יציבים</div>
            <div style={{ fontSize: 13, color: "#4ade80", marginTop: 2 }}>אין מטופלים הדורשים תשומת לב מיוחדת</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="attention-panel" style={{ background: "#fef2f2", border: "1px solid #fecaca" }}>
      <div style={{ fontWeight: 700, color: "#991b1b", marginBottom: 12, fontSize: 14 }}>
        🚨 דורשים תשומת לב ({priorityPatients.length})
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {priorityPatients.map(p => (
          <div
            key={p.id || p.code}
            style={{
              background: "white",
              borderRadius: 12,
              padding: "10px 14px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: 10,
            }}
          >
            <div style={{ fontWeight: 600, fontSize: 14 }}>{p.name}</div>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              {getIssues(p).map((issue, i) => (
                <span
                  key={i}
                  style={{
                    fontSize: 12,
                    padding: "3px 8px",
                    borderRadius: 999,
                    background: issue.color + "20",
                    color: issue.color,
                    fontWeight: 600,
                  }}
                >
                  {issue.label}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
