import { useState, useEffect } from "react";
import TherapistDashboard from "./pages/TherapistDashboard";
import PatientCheckIn from "./pages/PatientCheckIn";

const DEFAULT_PASSWORD = "1234";
const getPassword = () => localStorage.getItem("circleuno_therapist_password") || DEFAULT_PASSWORD;

export default function App() {
  const [userType, setUserType] = useState(null);
  const [authStep, setAuthStep] = useState("select");
  const [patientCode, setPatientCode] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const saved = localStorage.getItem("circleuno_user");
    if (saved) setUserType(saved);
  }, []);

  const loginTherapist = () => {
    if (password !== getPassword()) { setError("סיסמה שגויה"); return; }
    localStorage.setItem("circleuno_user", "therapist");
    setUserType("therapist");
  };

  const loginPatient = () => {
    const patients = JSON.parse(localStorage.getItem("circleuno_patients") || "[]");
    const exists = patients.find(p => p.code === patientCode.trim().toUpperCase());
    if (!exists) { setError("קוד מטופל לא קיים"); return; }
    localStorage.setItem("circleuno_user", "patient");
    localStorage.setItem("circleuno_patientCode", exists.code);
    setUserType("patient");
  };

  const logout = () => {
    localStorage.removeItem("circleuno_user");
    localStorage.removeItem("circleuno_patientCode");
    setUserType(null);
    setAuthStep("select");
    setPassword("");
    setError("");
  };

  /* ===== APP ===== */
  if (userType === "therapist") return <TherapistDashboard onLogout={logout} />;
  if (userType === "patient")   return <PatientCheckIn onLogout={logout} />;

  /* ===== LOGIN ===== */
  return (
    <div className="login-container">
      <div className="login-card">

        <img
          src="/logo.png"
          alt="CircleUno"
          style={{ width: 110, height: 110, objectFit: "contain", margin: "0 auto 4px", display: "block" }}
        />

        <h1 style={{ margin: "0 0 4px", fontSize: 24, fontWeight: 800 }}>CircleUno</h1>
        <p style={{ fontSize: 13, color: "#94a3b8", margin: "0 0 16px" }}>Clinical Monitoring Platform</p>

        <div className="login-description card">
          <p className="login-text">
            המערכת מאפשרת למטפלים לעקוב בזמן אמת אחרי מה שקורה בין הפגישות —
            רמות חרדה, טריגרים ודפוסי תגובה של המטופל לאורך זמן.
          </p>
          <p className="login-subtext">
            במקום להסתמך רק על דיווח רטרוספקטיבי, מתקבלת תמונה רציפה שמאפשרת
            הבנה מדויקת יותר של התהליך הטיפולי.
          </p>
        </div>

        {authStep === "select" && (
          <div style={{ marginTop: 16, display: "flex", flexDirection: "column", gap: 10 }}>
            <button
              className="btn-primary"
              style={{ fontSize: 15, padding: "13px" }}
              onClick={() => { setAuthStep("therapist"); setError(""); }}
            >
              🧑‍⚕️ כניסת מטפלים
            </button>
            <button
              className="card"
              style={{ fontSize: 15, padding: "13px", cursor: "pointer", textAlign: "center", fontFamily: "inherit" }}
              onClick={() => { setAuthStep("patient"); setError(""); }}
            >
              👤 כניסת מטופלים
            </button>
          </div>
        )}

        {authStep === "therapist" && (
          <div className="card" style={{ marginTop: 16, textAlign: "right" }}>
            <h3 style={{ marginTop: 0, fontSize: 16 }}>כניסת מטפל</h3>
            <input
              type="password"
              placeholder="סיסמה"
              value={password}
              onChange={e => { setPassword(e.target.value); setError(""); }}
              onKeyDown={e => e.key === "Enter" && loginTherapist()}
              style={{ marginTop: 8 }}
            />
            {error && <div style={{ color: "#ef4444", fontSize: 13, marginTop: 6 }}>{error}</div>}
            <button className="btn-primary" style={{ marginTop: 10 }} onClick={loginTherapist}>כניסה</button>
            <button style={{ marginTop: 8, background: "transparent", border: "none", color: "#94a3b8", cursor: "pointer", fontSize: 13, width: "100%" }} onClick={() => setAuthStep("select")}>חזרה</button>
          </div>
        )}

        {authStep === "patient" && (
          <div className="card" style={{ marginTop: 16, textAlign: "right" }}>
            <h3 style={{ marginTop: 0, fontSize: 16 }}>כניסת מטופל</h3>
            <input
              placeholder="קוד מטופל (CU-XXXXXX)"
              value={patientCode}
              onChange={e => { setPatientCode(e.target.value.toUpperCase()); setError(""); }}
              onKeyDown={e => e.key === "Enter" && loginPatient()}
              style={{ marginTop: 8 }}
            />
            {error && <div style={{ color: "#ef4444", fontSize: 13, marginTop: 6 }}>{error}</div>}
            <button className="btn-primary" style={{ marginTop: 10 }} onClick={loginPatient}>כניסה</button>
            <button style={{ marginTop: 8, background: "transparent", border: "none", color: "#94a3b8", cursor: "pointer", fontSize: 13, width: "100%" }} onClick={() => setAuthStep("select")}>חזרה</button>
          </div>
        )}
      </div>
    </div>
  );
}
