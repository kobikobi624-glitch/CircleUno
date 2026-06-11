import { useState, useEffect, useCallback } from "react";
import Header from "../components/Header";
import KPICards from "../components/KPICards";
import AttentionPanel from "../components/AttentionPanel";
import NotificationBell from "../components/NotificationBell";
import Patients from "./Patients";
import PatientProfile from "./PatientProfile";
import CreatePatient from "./CreatePatient";
import { generateAlertsFromPatients } from "../utils/notifications";

export default function TherapistDashboard({ onLogout }) {
  const [screen, setScreen] = useState("dashboard");
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [notifRefresh, setNotifRefresh] = useState(0);

  // Derived live stats from localStorage
  const [stats, setStats] = useState({ total: 0, red: 0, yellow: 0, green: 0, attention: [] });

  const loadStats = useCallback(() => {
    const patients = JSON.parse(localStorage.getItem("circleuno_patients") || "[]");
    const entries  = JSON.parse(localStorage.getItem("circleuno_entries")  || "[]");

    let red = 0, yellow = 0, green = 0;
    const attention = [];

    const enriched = patients.map(p => {
      const pe = entries.filter(e => e.patientCode === p.code);
      const avg = pe.length > 0
        ? pe.reduce((s,e)=>s+e.anxiety,0)/pe.length
        : 0;

      if (avg >= 65) { red++; }
      else if (avg >= 40) { yellow++; }
      else { green++; }

      // for attention panel (last 5 entries)
      const sorted = [...pe].sort((a,b)=>new Date(b.timestamp)-new Date(a.timestamp));
      const recentAvg = sorted.slice(0,5).reduce((s,e)=>s+e.anxiety,0)/(sorted.slice(0,5).length||1);
      const prevAvg   = sorted.slice(5,10).reduce((s,e)=>s+e.anxiety,0)/(sorted.slice(5,10).length||1);

      return {
        ...p,
        anxiety: Math.round(recentAvg),
        prevAnxiety: Math.round(prevAvg || recentAvg),
        responseRate: pe.filter(e=>e.response!=="no").length / (pe.length||1) * 100,
        prevResponse: 70, // baseline
      };
    });

    const attentionList = enriched.filter(p =>
      p.anxiety >= 65 || (p.anxiety - p.prevAnxiety) > 10
    );

    setStats({ total: patients.length, red, yellow, green, attention: attentionList });

    // generate alerts
    const newAlerts = generateAlertsFromPatients();
    if (newAlerts > 0) setNotifRefresh(r => r + 1);
  }, []);

  useEffect(() => {
    loadStats();
  }, [loadStats, screen]);

  return (
    <div>
      {/* NAV */}
      <div className="topbar">
        <div style={{ display: "flex", gap: 4 }}>
          <button
            className={`nav-btn ${screen === "dashboard" ? "active" : ""}`}
            onClick={() => setScreen("dashboard")}
          >
            📊 דשבורד
          </button>
          <button
            className={`nav-btn ${screen === "patients" ? "active" : ""}`}
            onClick={() => setScreen("patients")}
          >
            👥 מטופלים
          </button>
          <button
            className={`nav-btn ${screen === "create" ? "active" : ""}`}
            onClick={() => setScreen("create")}
          >
            ➕ מטופל חדש
          </button>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <NotificationBell refresh={notifRefresh} />
          <button className="btn-danger" onClick={onLogout}>יציאה</button>
        </div>
      </div>

      {/* SCREENS */}
      {screen === "dashboard" && (
        <div style={{ padding: "16px 20px" }}>
          <Header patientCount={stats.total} />
          <AttentionPanel patients={stats.attention} />
          <KPICards
            totalPatients={stats.total}
            redPatients={stats.red}
            yellowPatients={stats.yellow}
            greenPatients={stats.green}
          />
        </div>
      )}

      {screen === "create" && (
        <div style={{ padding: "16px 20px" }}>
          <CreatePatient onCreated={loadStats} />
        </div>
      )}

      {screen === "patients" && (
        <Patients
          onSelect={(p) => { setSelectedPatient(p); setScreen("profile"); }}
        />
      )}

      {screen === "profile" && (
        <PatientProfile
          patient={selectedPatient}
          onBack={() => setScreen("patients")}
        />
      )}
    </div>
  );
}
