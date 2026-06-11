export default function AlertBadge({ level }) {
  const config = {
    red: {
      text: "🔴 בסיכון",
      color: "#ef4444",
    },
    yellow: {
      text: "🟡 לשים לב",
      color: "#f59e0b",
    },
    green: {
      text: "🟢 יציב",
      color: "#22c55e",
    },
  };

  return (
    <span
      style={{
        background: config[level].color,
        color: "white",
        padding: "6px 12px",
        borderRadius: 999,
        fontSize: 12,
        fontWeight: 600,
      }}
    >
      {config[level].text}
    </span>
  );
}