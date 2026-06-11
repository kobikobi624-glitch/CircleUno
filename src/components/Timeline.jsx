export default function Timeline({ entries }) {
  const sorted = [...entries].sort(
    (a, b) =>
      new Date(b.timestamp) - new Date(a.timestamp)
  );

  return (
    <div style={{ marginTop: 20 }}>
      <h3>📅 Timeline</h3>

      {sorted.map((e) => (
        <div
          key={e.id}
          style={{
            padding: 12,
            marginBottom: 10,
            border: "1px solid #eee",
            borderRadius: 12,
            background: "#fafafa",
          }}
        >
          <div style={{ fontSize: 12, opacity: 0.6 }}>
            {new Date(e.timestamp).toLocaleString()}
          </div>

          <div>
            <strong>טריגר:</strong> {e.trigger}
          </div>

          <div>
            חרדה: <strong>{e.anxiety}</strong>
          </div>

          <div>
            תגובה:{" "}
            {e.response === "no"
              ? "נמנע"
              : e.response === "partial"
              ? "חלקי"
              : "ביצע"}
          </div>
        </div>
      ))}
    </div>
  );
}