import { useState } from "react";
import { collection, addDoc, query, where, getDocs } from "firebase/firestore";
import { db } from "../firebase";

function generateCode() {
  return "CU-" + Math.random().toString(36).substring(2, 8).toUpperCase();
}

export default function CreatePatient({ therapistId }) {
  const [name, setName]       = useState("");
  const [code, setCode]       = useState("");
  const [saved, setSaved]     = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");

  const createPatient = async () => {
    if (!name.trim()) return;
    const newCode = code.trim() || generateCode();
    setLoading(true); setError("");
    try {
      const existing = await getDocs(query(collection(db, "patients"), where("code", "==", newCode)));
      if (!existing.empty) { setError("קוד זה כבר קיים — נסה קוד אחר"); setLoading(false); return; }
      await addDoc(collection(db, "patients"), {
        name: name.trim(), code: newCode, therapistId, createdAt: new Date().toISOString(),
      });
      setSaved({ name: name.trim(), code: newCode });
      setName(""); setCode("");
      setTimeout(() => setSaved(null), 5000);
    } catch {
      setError("יצירת המטופל נכשלה — נסה שוב");
    }
    setLoading(false);
  };

  return (
    <div style={{ maxWidth: 480, margin: "0 auto", direction: "rtl" }}>
      <h2 style={{ fontSize: 20, marginBottom: 6 }}>➕ יצירת מטופל</h2>
      <p style={{ fontSize: 13, color: "#64748b", marginBottom: 20 }}>צור מטופל חדש וקבל קוד ייחודי לכניסה</p>
      <div className="card" style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <div>
          <label style={{ fontSize: 13, fontWeight: 600, display: "block", marginBottom: 6 }}>שם המטופל *</label>
          <input placeholder="לדוגמה: דניאל כהן" value={name} onChange={e => { setName(e.target.value); setError(""); }} onKeyDown={e => e.key === "Enter" && createPatient()} />
        </div>
        <div>
          <label style={{ fontSize: 13, fontWeight: 600, display: "block", marginBottom: 6 }}>
            קוד אישי <span style={{ color: "#94a3b8", fontWeight: 400 }}>(אופציונלי — ייווצר אוטומטית)</span>
          </label>
          <input placeholder="CU-XXXXXX" value={code} onChange={e => { setCode(e.target.value.toUpperCase()); setError(""); }} />
        </div>
        {error && <div style={{ color: "#ef4444", fontSize: 13 }}>{error}</div>}
        <button className="btn-primary" onClick={createPatient} disabled={loading} style={{ marginTop: 4 }}>
          {loading ? "יוצר..." : "➕ צור מטופל"}
        </button>
      </div>
      {saved && (
        <div style={{ marginTop: 16, padding: "14px 16px", borderRadius: 14, background: "#dcfce7", border: "1px solid #bbf7d0", color: "#166534" }}>
          <div style={{ fontWeight: 700, marginBottom: 4 }}>✅ המטופל נוצר בהצלחה!</div>
          <div style={{ fontSize: 13 }}>שם: <b>{saved.name}</b><br />קוד כניסה: <b style={{ letterSpacing: 1, fontSize: 15 }}>{saved.code}</b></div>
          <div style={{ marginTop: 8, fontSize: 12 }}>שתף את הקוד עם המטופל לכניסה למערכת</div>
        </div>
      )}
    </div>
  );
}
