import { useState } from "react";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { auth, db } from "../firebase";

const validatePassword = (pwd) => {
  const checks = [
    { test: pwd.length >= 8,         label: "לפחות 8 תווים" },
    { test: /[A-Z]/.test(pwd),       label: "אות גדולה אחת לפחות" },
    { test: /[a-z]/.test(pwd),       label: "אות קטנה אחת לפחות" },
    { test: /[0-9]/.test(pwd),       label: "ספרה אחת לפחות" },
    { test: /[^A-Za-z0-9]/.test(pwd),label: "תו מיוחד אחד לפחות (!@#$...)" },
  ];
  return checks;
};

export default function TherapistRegister({ onBack }) {
  const [name, setName]         = useState("");
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm]   = useState("");
  const [error, setError]       = useState("");
  const [loading, setLoading]   = useState(false);
  const [showChecks, setShowChecks] = useState(false);

  const checks = validatePassword(password);
  const allPassed = checks.every(c => c.test);

  const register = async () => {
    if (!name || !email || !password) { setError("נא למלא את כל השדות"); return; }
    if (!allPassed) { setError("הסיסמה אינה עומדת בדרישות"); return; }
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

      <input placeholder="שם מלא" value={name}
        onChange={e => { setName(e.target.value); setError(""); }}
        style={{ marginTop: 8 }} />

      <input type="email" placeholder="אימייל" value={email}
        onChange={e => { setEmail(e.target.value); setError(""); }}
        style={{ marginTop: 8 }} />

      <input type="password" placeholder="סיסמה" value={password}
        onChange={e => { setPassword(e.target.value); setError(""); setShowChecks(true); }}
        style={{ marginTop: 8 }} />

      {/* Password strength checklist */}
      {showChecks && (
        <div style={{ marginTop: 8, padding: "10px 12px", background: "#f8fafc", borderRadius: 10, border: "1px solid #e2e8f0" }}>
          {checks.map((c, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, marginBottom: 4, color: c.test ? "#166534" : "#64748b" }}>
              <span>{c.test ? "✅" : "⬜"}</span>
              <span>{c.label}</span>
            </div>
          ))}
        </div>
      )}

      <input type="password" placeholder="אימות סיסמה" value={confirm}
        onChange={e => { setConfirm(e.target.value); setError(""); }}
        onKeyDown={e => e.key === "Enter" && register()}
        style={{ marginTop: 8 }} />

      {/* Confirm match indicator */}
      {confirm.length > 0 && (
        <div style={{ fontSize: 12, marginTop: 4, color: password === confirm ? "#166534" : "#ef4444" }}>
          {password === confirm ? "✅ הסיסמאות תואמות" : "❌ הסיסמאות אינן תואמות"}
        </div>
      )}

      {error && <div style={{ color: "#ef4444", fontSize: 13, marginTop: 6 }}>{error}</div>}

      <button className="btn-primary" style={{ marginTop: 10 }} onClick={register}
        disabled={loading || !allPassed || password !== confirm}>
        {loading ? "יוצר חשבון..." : "צור חשבון"}
      </button>

      <button style={{ marginTop: 8, background: "transparent", border: "none", color: "#94a3b8", cursor: "pointer", fontSize: 13, width: "100%" }} onClick={onBack}>
        חזרה לכניסה
      </button>
    </div>
  );
}
