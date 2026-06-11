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
    if (!name || !email || !password) { setError("Please fill in all fields"); return; }
    if (password.length < 6) { setError("Password must be at least 6 characters"); return; }
    if (password !== confirm) { setError("Passwords do not match"); return; }

    setLoading(true); setError("");
    try {
      const cred = await createUserWithEmailAndPassword(auth, email.trim(), password);
      await updateProfile(cred.user, { displayName: name.trim() });
      // Save therapist profile in Firestore
      await setDoc(doc(db, "therapists", cred.user.uid), {
        name: name.trim(),
        email: email.trim(),
        createdAt: new Date().toISOString(),
      });
    } catch (e) {
      if (e.code === "auth/email-already-in-use") setError("This email is already registered");
      else if (e.code === "auth/invalid-email") setError("Invalid email address");
      else setError("Registration failed — please try again");
      setLoading(false);
    }
  };

  return (
    <div className="card" style={{ marginTop: 16, textAlign: "right" }}>
      <h3 style={{ marginTop: 0, fontSize: 16 }}>Create Therapist Account</h3>

      <input
        placeholder="Full name"
        value={name}
        onChange={e => { setName(e.target.value); setError(""); }}
        style={{ marginTop: 8 }}
      />
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={e => { setEmail(e.target.value); setError(""); }}
        style={{ marginTop: 8 }}
      />
      <input
        type="password"
        placeholder="Password (min. 6 characters)"
        value={password}
        onChange={e => { setPassword(e.target.value); setError(""); }}
        style={{ marginTop: 8 }}
      />
      <input
        type="password"
        placeholder="Confirm password"
        value={confirm}
        onChange={e => { setConfirm(e.target.value); setError(""); }}
        onKeyDown={e => e.key === "Enter" && register()}
        style={{ marginTop: 8 }}
      />

      {error && <div style={{ color: "#ef4444", fontSize: 13, marginTop: 6 }}>{error}</div>}

      <button className="btn-primary" style={{ marginTop: 10 }} onClick={register} disabled={loading}>
        {loading ? "Creating account..." : "Create Account"}
      </button>

      <button style={{ marginTop: 8, background: "transparent", border: "none", color: "#94a3b8", cursor: "pointer", fontSize: 13, width: "100%" }} onClick={onBack}>
        Back to Login
      </button>
    </div>
  );
}
