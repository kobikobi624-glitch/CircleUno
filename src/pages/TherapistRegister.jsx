import { useState } from "react";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { auth, db } from "../firebase";

export default function TherapistRegister({ onBack }) {
  const [name, setName]         = useState("");
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm]   = useState("");
  const [error, setError]       = useState("");
  const [loading, setLoading]   = useState(false);

  const register = async () => {
    if (!name || !email || !password) { setError("נא למלא את כל השדות"); return; }
    if (password.length < 6) { setError("הסיסמה חייבת להכיל לפחות 6 תווים"); return; }
    if (password !== confirm) { setError("הסיסמאות אינן תואמות"); return; }
    setLoading(true); setError("");
    try {
      const cred = await createUserWithEmailAndPassword(auth, email.trim(), password);
      await updateProfile(cred.user, { displayName: name.trim() });
      await setDoc(doc(db, "therapists", cred.user.uid), {
        name: name.trim(),
        email: email.trim(),
        createdAt: new Date().toISOString(),
      });
    } catch (e) {
      if (e.code === "auth/email-already-in-use") setError("אימייל זה כבר רשום במערכת");
      else if (e.code === "auth/invalid-email") setError("כתובת אימייל לא תקינה");
      else setError("ההרשמה נכשלה — נסה שוב");
      setLoading(false);
    }
  };

  return (
    <div className="card" style={{ marginTop: 16, textAlign: "right" }}>
      <h3 style={{ marginTop: 0, fontSize: 16 }}>יצירת חשבון מטפל</h3>
      <input placeholder="שם מלא" value={name} onChange={e => { setName(e.target.value); setError(""); }} style={{ marginTop: 8 }} />
      <input type="email" placeholder="אימייל" value={email} onChange={e => { setEmail(e.target.value); setError(""); }} style={{ marginTop: 8 }} />
      <input type="password" placeholder="סיסמה (לפחות 6 תווים)" value={password} onChange={e => { setPassword(e.target.value); setError(""); }} style={{ marginTop: 8 }} />
      <input type="password" placeholder="אימות סיסמה" value={confirm} onChange={e => { setConfirm(e.target.value); setError(""); }} onKeyDown={e => e.key === "Enter" && register()} style={{ marginTop: 8 }} />
      {error && <div style={{ color: "#ef4444", fontSize: 13, marginTop: 6 }}>{error}</div>}
      <button className="btn-primary" style={{ marginTop: 10 }} onClick={register} disabled={loading}>
        {loading ? "יוצר חשבון..." : "צור חשבון"}
      </button>
      <button style={{ marginTop: 8, background: "transparent", border: "none", color: "#94a3b8", cursor: "pointer", fontSize: 13, width: "100%" }} onClick={onBack}>
        חזרה לכניסה
      </button>
    </div>
  );
}
