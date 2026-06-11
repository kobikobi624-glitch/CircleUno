import { useState } from "react";
import { signInWithEmailAndPassword, sendPasswordResetEmail } from "firebase/auth";
import { collection, query, where, getDocs } from "firebase/firestore";
import { auth, db } from "../firebase";

export default function TherapistLogin({ onRegister, onBack }) {
  const [email, setEmail]         = useState("");
  const [password, setPassword]   = useState("");
  const [error, setError]         = useState("");
  const [loading, setLoading]     = useState(false);
  const [resetSent, setResetSent] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);

  const login = async () => {
    if (!email || !password) { setError("נא למלא את כל השדות"); return; }
    setLoading(true); setError("");
    try {
      await signInWithEmailAndPassword(auth, email.trim(), password);
    } catch {
      setError("אימייל או סיסמה שגויים");
    }
    setLoading(false);
  };

  const resetPassword = async () => {
    if (!email.trim()) { setError("נא להזין אימייל תחילה"); return; }
    setResetLoading(true); setError(""); setResetSent(false);

    try {
      // Check Firestore first
      const snap = await getDocs(
        query(collection(db, "therapists"), where("email", "==", email.trim()))
      );

      if (snap.empty) {
        setError("אימייל זה אינו רשום במערכת");
        setResetLoading(false);
        return;
      }

      // Email exists — send reset
      await sendPasswordResetEmail(auth, email.trim());
      setResetSent(true);

    } catch (e) {
      // If Firestore query fails due to rules, fallback to just sending
      if (e.code === "auth/invalid-email") {
        setError("כתובת אימייל לא תקינה");
      } else if (e.message?.includes("permission") || e.code?.includes("permission")) {
        try {
          await sendPasswordResetEmail(auth, email.trim());
          setResetSent(true);
        } catch {
          setError("לא ניתן לשלוח מייל איפוס — נסה שוב");
        }
      } else {
        setError("לא ניתן לשלוח מייל איפוס — נסה שוב");
      }
    }
    setResetLoading(false);
  };

  return (
    <div className="card" style={{ marginTop: 16, textAlign: "right" }}>
      <h3 style={{ marginTop: 0, fontSize: 16 }}>כניסת מטפל</h3>

      <input type="email" placeholder="אימייל" value={email}
        onChange={e => { setEmail(e.target.value); setError(""); setResetSent(false); }}
        style={{ marginTop: 8 }} />
      <input type="password" placeholder="סיסמה" value={password}
        onChange={e => { setPassword(e.target.value); setError(""); }}
        onKeyDown={e => e.key === "Enter" && login()} style={{ marginTop: 8 }} />

      {error && <div style={{ color: "#ef4444", fontSize: 13, marginTop: 6 }}>{error}</div>}
      {resetSent && (
        <div style={{ color: "#22c55e", fontSize: 13, marginTop: 6 }}>
          ✅ מייל איפוס נשלח! בדוק את תיבת הדואר שלך (כולל ספאם)
        </div>
      )}

      <button className="btn-primary" style={{ marginTop: 10 }} onClick={login} disabled={loading}>
        {loading ? "מתחבר..." : "כניסה"}
      </button>

      <button
        style={{ marginTop: 8, background: "transparent", border: "none", color: "#6366f1", cursor: "pointer", fontSize: 13, width: "100%", textDecoration: "underline" }}
        onClick={resetPassword} disabled={resetLoading}
      >
        {resetLoading ? "בודק..." : "שכחתי סיסמה"}
      </button>

      <div style={{ borderTop: "1px solid #e2e8f0", marginTop: 12, paddingTop: 12, textAlign: "center", fontSize: 13, color: "#64748b" }}>
        אין חשבון עדיין?{" "}
        <button onClick={onRegister} style={{ background: "none", border: "none", color: "#6366f1", cursor: "pointer", fontWeight: 600, fontSize: 13 }}>
          הרשמה כאן
        </button>
      </div>

      <button style={{ marginTop: 8, background: "transparent", border: "none", color: "#94a3b8", cursor: "pointer", fontSize: 13, width: "100%" }} onClick={onBack}>
        חזרה
      </button>
    </div>
  );
}
