export default function KPICards({ totalPatients, redPatients, yellowPatients, greenPatients }) {
  const cards = [
    {
      title: "סה״כ מטופלים",
      value: totalPatients,
      color: "#6366f1",
      bg: "#eef2ff",
      icon: "👥",
    },
    {
      title: "דורשים תשומת לב",
      value: redPatients,
      color: "#ef4444",
      bg: "#fef2f2",
      icon: "🔴",
      delta: redPatients > 0 ? `${redPatients} מטופל${redPatients > 1 ? "ים" : ""}` : null,
    },
    {
      title: "במעקב",
      value: yellowPatients,
      color: "#f59e0b",
      bg: "#fffbeb",
      icon: "🟡",
    },
    {
      title: "יציבים",
      value: greenPatients,
      color: "#22c55e",
      bg: "#f0fdf4",
      icon: "🟢",
    },
  ];

  return (
    <div className="kpi-grid">
      {cards.map((card) => (
        <div
          key={card.title}
          className="kpi-card"
          style={{ borderTop: `4px solid ${card.color}` }}
        >
          <div style={{ fontSize: 22 }}>{card.icon}</div>
          <div className="kpi-label">{card.title}</div>
          <div className="kpi-value" style={{ color: card.color }}>
            {card.value}
          </div>
          {card.delta && (
            <div className="kpi-delta" style={{ color: card.color }}>
              ↑ {card.delta}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
