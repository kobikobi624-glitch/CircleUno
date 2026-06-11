import { useState } from "react";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../firebase";

export default function PatientLogin({ onLogin, onBack }) {
  const [code, setCode]       = useState("");
  const [error, setError]     = useState("");
  const [loading, setLoading] = useState(false);

  const login = async () => {
    if (!code.trim()) { setError("נא להזין קוד מטופל"); return; }
    setLoading(true); setError("");
    try {
      const q = query(collection(db, "patients"), where("code", "==", code.trim().toUpperCase()));
      const snap = await getDocs(q);
      if (snap.empty) { setError("קוד מטופל לא קיים"); setLoading(false); return; }
      onLogin(code.trim().toUpperCase());
    } catch {
      setError("שגיאת חיבור — נסה שוב");
    }
    setLoading(false);
  };

  return (
    <div className="card" style={{ marginTop: 16, textAlign: "right" }}>
      <h3 style={{ marginTop: 0, fontSize: 16 }}>כניסת מטופל</h3>
      <input
        placeholder="קוד מטופל (CU-XXXXXX)"
        value={code}
        onChange={e => { setCode(e.target.value.toUpperCase()); setError(""); }}
        onKeyDown={e => e.key === "Enter" && login()}
        style={{ marginTop: 8 }}
      />
      {error && <div style={{ color: "#ef4444", fontSize: 13, marginTop: 6 }}>{error}</div>}
      <button className="btn-primary" style={{ marginTop: 10 }} onClick={login} disabled={loading}>
        {loading ? "בודק..." : "כניסה"}
      </button>
      <button style={{ marginTop: 8, background: "transparent", border: "none", color: "#94a3b8", cursor: "pointer", fontSize: 13, width: "100%" }} onClick={onBack}>
        חזרה
      </button>
    </div>
  );
}
