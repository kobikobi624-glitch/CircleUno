import { useEffect, useState } from "react";
import { addNotification } from "../utils/notifications";

export default function PatientCheckIn({ onLogout }) {
  const [patientCode, setPatientCode] = useState("");
  const [hasSession, setHasSession] = useState(false);
  const [patientName, setPatientName] = useState("");

  const [trigger, setTrigger] = useState("");
  const [anxiety, setAnxiety] = useState(40);
  const [response, setResponse] = useState("no");
  const [notes, setNotes] = useState("");

  const [savedMessage, setSavedMessage] = useState("");

  useEffect(() => {
    const code = localStorage.getItem("circleuno_patientCode");
    if (code) {
      const patients = JSON.parse(localStorage.getItem("circleuno_patients") || "[]");
      const p = patients.find(x => x.code === code);
      setPatientCode(code);
      setPatientName(p?.name || code);
      setHasSession(true);
    }
  }, []);

  const saveEntry = () => {
    if (!trigger.trim()) { alert("נא להזין טריגר"); return; }

    const entry = {
      id: Date.now(),
      patientCode,
      timestamp: new Date().toISOString(),
      trigger: trigger.trim(),
      anxiety,
      response,
      notes: notes.trim(),
    };

    const existing = JSON.parse(localStorage.getItem("circleuno_entries")) || [];
    localStorage.setItem("circleuno_entries", JSON.stringify([entry, ...existing]));

    // add a system notification if anxiety is high
    if (anxiety >= 70) {
      addNotification({
        type: "danger",
        title: `חרדה גבוהה דווחה – ${patientName}`,
        body: `טריגר: ${trigger} · חרדה: ${anxiety}`,
        patientCode,
      });
    }

    setTrigger("");
    setAnxiety(40);
    setResponse("no");
    setNotes("");
    setSavedMessage("✅ הדיווח נשמר בהצלחה");
    setTimeout(() => setSavedMessage(""), 2500);
  };

  const anxietyColor = anxiety >= 70 ? "#ef4444" : anxiety >= 40 ? "#f59e0b" : "#22c55e";

  return (
    <div style={{ minHeight: "100vh", background: "#f1f5f9", direction: "rtl" }}>
      {/* TOP BAR */}
      <div className="topbar">
        <div style={{ fontWeight: 600, fontSize: 14 }}>
          👤 {patientName}
        </div>
        <button className="btn-danger" onClick={onLogout}>יציאה</button>
      </div>

      <div style={{ padding: "16px", maxWidth: 480, margin: "0 auto" }}>
        <h2 style={{ fontSize: 20, marginBottom: 4 }}>דיווח אירוע</h2>
        <p style={{ fontSize: 13, color: "#64748b", marginBottom: 16, margin: "0 0 16px" }}>
          רשום מה קרה לך עכשיו
        </p>

        {/* TRIGGER */}
        <div className="card" style={{ marginBottom: 12 }}>
          <label style={{ fontSize: 13, fontWeight: 600, display: "block", marginBottom: 8 }}>
            🎯 מה היה הטריגר?
          </label>
          <input
            value={trigger}
            onChange={e => setTrigger(e.target.value)}
            placeholder="תאר מה קרה..."
          />
        </div>

        {/* ANXIETY SLIDER */}
        <div className="card" style={{ marginBottom: 12 }}>
          <label style={{ fontSize: 13, fontWeight: 600, display: "block", marginBottom: 8 }}>
            📊 רמת חרדה:{" "}
            <span style={{ color: anxietyColor, fontSize: 22, fontWeight: 800 }}>{anxiety}</span>
            <span style={{ color: "#94a3b8", fontWeight: 400, fontSize: 12 }}> / 100</span>
          </label>

          <input
            type="range" min="0" max="100" value={anxiety}
            onChange={e => setAnxiety(Number(e.target.value))}
            style={{
              width: "100%", accentColor: anxietyColor, height: 6,
              border: "none", background: "transparent", padding: 0,
            }}
          />

          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "#94a3b8", marginTop: 4 }}>
            <span>0 – ללא חרדה</span>
            <span>50 – בינוני</span>
            <span>100 – גבוה מאוד</span>
          </div>
        </div>

        {/* RESPONSE */}
        <div className="card" style={{ marginBottom: 12 }}>
          <label style={{ fontSize: 13, fontWeight: 600, display: "block", marginBottom: 8 }}>
            🔄 איך הגבת?
          </label>
          <div style={{ display: "flex", gap: 8 }}>
            {[
              { value: "yes", label: "ביצעתי התנהגות", color: "#ef4444" },
              { value: "partial", label: "חלקית", color: "#f59e0b" },
              { value: "no", label: "עמדתי בזה ✊", color: "#22c55e" },
            ].map(opt => (
              <button
                key={opt.value}
                onClick={() => setResponse(opt.value)}
                style={{
                  flex: 1, padding: "10px 6px", borderRadius: 10,
                  border: `2px solid ${response === opt.value ? opt.color : "#e2e8f0"}`,
                  background: response === opt.value ? opt.color + "15" : "white",
                  color: response === opt.value ? opt.color : "#64748b",
                  fontWeight: response === opt.value ? 700 : 400,
                  fontSize: 12, cursor: "pointer",
                }}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* NOTES */}
        <div className="card" style={{ marginBottom: 14 }}>
          <label style={{ fontSize: 13, fontWeight: 600, display: "block", marginBottom: 8 }}>
            📝 הערות <span style={{ color: "#94a3b8", fontWeight: 400 }}>(אופציונלי)</span>
          </label>
          <textarea
            rows={3}
            value={notes}
            onChange={e => setNotes(e.target.value)}
            placeholder="מחשבות, הקשרים, כל מה שחשוב לך לרשום..."
            style={{ resize: "none" }}
          />
        </div>

        <button
          onClick={saveEntry}
          style={{
            width: "100%", padding: 14, borderRadius: 12, border: "none",
            background: "#22c55e", color: "white", fontWeight: 700, fontSize: 15, cursor: "pointer",
          }}
        >
          💾 שמור דיווח
        </button>

        {savedMessage && (
          <div style={{
            marginTop: 12, padding: 12, borderRadius: 12,
            background: "#dcfce7", color: "#166534", textAlign: "center", fontSize: 14, fontWeight: 600,
          }}>
            {savedMessage}
          </div>
        )}
      </div>
    </div>
  );
}
