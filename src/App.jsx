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

  // change password
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [changeSuccess, setChangeSuccess] = useState(false);

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

  const changePassword = () => {
    if (oldPassword !== getPassword()) { setError("הסיסמה הנוכחית שגויה"); return; }
    if (newPassword.length < 4) { setError("הסיסמה החדשה חייבת להכיל לפחות 4 תווים"); return; }
    if (newPassword !== confirmPassword) { setError("הסיסמאות החדשות אינן תואמות"); return; }
    localStorage.setItem("circleuno_therapist_password", newPassword);
    setChangeSuccess(true);
    setOldPassword(""); setNewPassword(""); setConfirmPassword(""); setError("");
    setTimeout(() => { setChangeSuccess(false); setAuthStep("therapist"); }, 2000);
  };

  const goBack = (step) => {
    setAuthStep(step);
    setError("");
    setOldPassword(""); setNewPassword(""); setConfirmPassword("");
    setChangeSuccess(false);
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

        <p style={{ fontSize: 13, color: "#94a3b8", margin: "4px 0 16px" }}>Clinical Monitoring Platform</p>

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

        {/* SELECT */}
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

        {/* THERAPIST LOGIN */}
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
            <button
              style={{ marginTop: 8, background: "transparent", border: "none", color: "#6366f1", cursor: "pointer", fontSize: 13, width: "100%", textDecoration: "underline" }}
              onClick={() => goBack("changePassword")}
            >
              🔑 שינוי סיסמה
            </button>
            <button style={{ marginTop: 4, background: "transparent", border: "none", color: "#94a3b8", cursor: "pointer", fontSize: 13, width: "100%" }} onClick={() => goBack("select")}>חזרה</button>
          </div>
        )}

        {/* CHANGE PASSWORD */}
        {authStep === "changePassword" && (
          <div className="card" style={{ marginTop: 16, textAlign: "right" }}>
            <h3 style={{ marginTop: 0, fontSize: 16 }}>🔑 שינוי סיסמה</h3>

            {changeSuccess ? (
              <div style={{ padding: "14px", background: "#dcfce7", borderRadius: 10, color: "#166534", fontWeight: 600, textAlign: "center" }}>
                ✅ הסיסמה שונתה בהצלחה!
              </div>
            ) : (
              <>
                <input
                  type="password"
                  placeholder="סיסמה נוכחית"
                  value={oldPassword}
                  onChange={e => { setOldPassword(e.target.value); setError(""); }}
                  style={{ marginTop: 8 }}
                />
                <input
                  type="password"
                  placeholder="סיסמה חדשה"
                  value={newPassword}
                  onChange={e => { setNewPassword(e.target.value); setError(""); }}
                  style={{ marginTop: 8 }}
                />
                <input
                  type="password"
                  placeholder="אימות סיסמה חדשה"
                  value={confirmPassword}
                  onChange={e => { setConfirmPassword(e.target.value); setError(""); }}
                  onKeyDown={e => e.key === "Enter" && changePassword()}
                  style={{ marginTop: 8 }}
                />
                {error && <div style={{ color: "#ef4444", fontSize: 13, marginTop: 6 }}>{error}</div>}
                <button className="btn-primary" style={{ marginTop: 10 }} onClick={changePassword}>
                  שמור סיסמה חדשה
                </button>
                <button style={{ marginTop: 8, background: "transparent", border: "none", color: "#94a3b8", cursor: "pointer", fontSize: 13, width: "100%" }} onClick={() => goBack("therapist")}>
                  חזרה
                </button>
              </>
            )}
          </div>
        )}

        {/* PATIENT LOGIN */}
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
            <button style={{ marginTop: 8, background: "transparent", border: "none", color: "#94a3b8", cursor: "pointer", fontSize: 13, width: "100%" }} onClick={() => goBack("select")}>חזרה</button>
          </div>
        )}

      </div>
    </div>
  );
}
