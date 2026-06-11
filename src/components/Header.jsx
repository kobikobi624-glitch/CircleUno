export default function Header({ patientCount, therapistName }) {
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "בוקר טוב" : hour < 17 ? "צהריים טובים" : "ערב טוב";

  return (
    <div style={{
      background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
      color: "white", padding: "20px 24px", borderRadius: 20, marginBottom: 20,
      position: "relative", overflow: "hidden",
    }}>
      <div style={{ position: "absolute", top: -30, left: -30, width: 160, height: 160, background: "rgba(255,255,255,0.06)", borderRadius: "50%" }} />
      <div style={{ position: "relative" }}>
        <div style={{ fontSize: 13, opacity: 0.8, marginBottom: 4 }}>{greeting}{therapistName ? `, ${therapistName}` : ""} 👋</div>
        <h1 style={{ margin: 0, fontSize: 28, fontWeight: 800, letterSpacing: "-0.5px" }}>CircleUno</h1>
        <p style={{ marginTop: 6, opacity: 0.85, fontSize: 14, margin: "6px 0 0" }}>
          פלטפורמת ניטור קליני · {patientCount ?? "—"} מטופלים פעילים
        </p>
      </div>
    </div>
  );
}
