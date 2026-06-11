import { useState, useEffect } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./firebase";
import TherapistDashboard from "./pages/TherapistDashboard";
import PatientCheckIn from "./pages/PatientCheckIn";
import TherapistLogin from "./pages/TherapistLogin";
import TherapistRegister from "./pages/TherapistRegister";
import PatientLogin from "./pages/PatientLogin";

export default function App() {
  const [therapist, setTherapist] = useState(undefined); // undefined = loading
  const [screen, setScreen] = useState("select"); // select | therapistLogin | therapistRegister | patient
  const [patientCode, setPatientCode] = useState(null);

  // Listen to Firebase auth state
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      setTherapist(user || null);
    });
    return unsub;
  }, []);

  // Restore patient session
  useEffect(() => {
    const code = localStorage.getItem("circleuno_patientCode");
    if (code) setPatientCode(code);
  }, []);

  // Loading spinner while Firebase checks auth
  if (therapist === undefined) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#f1f5f9" }}>
        <div style={{ textAlign: "center", color: "#64748b" }}>
          <div style={{ fontSize: 32, marginBottom: 12 }}>⏳</div>
          <div>Loading...</div>
        </div>
      </div>
    );
  }

  // Therapist is logged in
  if (therapist) {
    return <TherapistDashboard therapist={therapist} onLogout={() => auth.signOut()} />;
  }

  // Patient is logged in
  if (patientCode) {
    return (
      <PatientCheckIn
        patientCode={patientCode}
        onLogout={() => {
          localStorage.removeItem("circleuno_patientCode");
          setPatientCode(null);
          setScreen("select");
        }}
      />
    );
  }

  // Login screens
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
            The system allows therapists to track in real time what happens between sessions —
            anxiety levels, triggers and response patterns over time.
          </p>
        </div>

        {screen === "select" && (
          <div style={{ marginTop: 16, display: "flex", flexDirection: "column", gap: 10 }}>
            <button className="btn-primary" style={{ fontSize: 15, padding: 13 }} onClick={() => setScreen("therapistLogin")}>
              🧑‍⚕️ Therapist Login
            </button>
            <button className="card" style={{ fontSize: 15, padding: 13, cursor: "pointer", textAlign: "center", fontFamily: "inherit" }} onClick={() => setScreen("patient")}>
              👤 Patient Login
            </button>
          </div>
        )}

        {screen === "therapistLogin" && (
          <TherapistLogin
            onRegister={() => setScreen("therapistRegister")}
            onBack={() => setScreen("select")}
          />
        )}

        {screen === "therapistRegister" && (
          <TherapistRegister
            onBack={() => setScreen("therapistLogin")}
          />
        )}

        {screen === "patient" && (
          <PatientLogin
            onLogin={(code) => {
              localStorage.setItem("circleuno_patientCode", code);
              setPatientCode(code);
            }}
            onBack={() => setScreen("select")}
          />
        )}

      </div>
    </div>
  );
}
