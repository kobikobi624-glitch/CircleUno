export default function WeeklyReport({ patient }) {
  const max = Math.max(...patient.week);

  return (
    <>
      <h3>גרף שבועי</h3>

      <div
        style={{
          display: "flex",
          alignItems: "flex-end",
          gap: 8,
          height: 180,
          marginTop: 20,
        }}
      >
        {patient.week.map((value, index) => (
          <div
            key={index}
            style={{
              flex: 1,
              background:
                value === max
                  ? "#ef4444"
                  : "#6366f1",
              height: `${value * 2}px`,
              borderRadius: 8,
            }}
          />
        ))}
      </div>

      <div
        style={{
          marginTop: 20,
          display: "grid",
          gridTemplateColumns:
            "repeat(auto-fit,minmax(140px,1fr))",
          gap: 12,
        }}
      >
        <div className="metric-card">
          <strong>ממוצע חרדה</strong>
          <div>{patient.anxiety}</div>
        </div>

        <div className="metric-card">
          <strong>אחוז תגובה</strong>
          <div>{patient.responseRate}%</div>
        </div>

        <div className="metric-card">
          <strong>מספר טריגרים</strong>
          <div>{patient.triggers.length}</div>
        </div>
      </div>
    </>
  );
}