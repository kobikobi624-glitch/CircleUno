import { useMemo, useState } from "react";
import { doc, writeBatch, collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../firebase";

export default function Patients({ patients, entries, onSelect }) {
  const [search, setSearch]     = useState("");
  const [deleting, setDeleting] = useState(null);

  const deletePatient = async (p) => {
    if (!confirm(`למחוק את ${p.name}? הפעולה בלתי הפיכה.`)) return;
    setDeleting(p.id);
    try {
      const [entriesSnap, copingSnap] = await Promise.all([
        getDocs(query(collection(db, "entries"), where("patientCode", "==", p.code))),
        getDocs(query(collection(db, "copingSessions"), where("patientCode", "==", p.code))),
      ]);
      const batch = writeBatch(db);
      entriesSnap.docs.forEach(d => batch.delete(d.ref));
      copingSnap.docs.forEach(d => batch.delete(d.ref));
      batch.delete(doc(db, "patients", p.id));
      await batch.commit();
    } catch { alert("מחיקה נכשלה"); }
    setDeleting(null);
  };

  const resetPatient = async (p) => {
    if (!confirm(`לאפס את כל הנתונים של ${p.name}?`)) return;
    try {
      const [entriesSnap, copingSnap] = await Promise.all([
        getDocs(query(collection(db, "entries"), where("patientCode", "==", p.code))),
        getDocs(query(collection(db, "copingSessions"), where("patientCode", "==", p.code))),
      ]);
      const batch = writeBatch(db);
      entriesSnap.docs.forEach(d => batch.delete(d.ref));
      copingSnap.docs.forEach(d => batch.delete(d.ref));
      await batch.commit();
    } catch { alert("איפוס נכשל"); }
  };

  const enriched = useMemo(() => {
    return patients
      .map(p => {
        const pe = entries.filter(e => e.patientCode === p.code);
        const avg = pe.length > 0 ? pe.reduce((s,e) => s + e.anxiety, 0) / pe.length : 0;
        const sorted = [...pe].sort((a,b) => new Date(b.timestamp) - new Date(a.timestamp));
        return { ...p, entries: pe, anxiety: Math.round(avg), entryCount: pe.length, lastSeen: sorted[0]?.timestamp || p.createdAt };
      })
      .filter(p => !search || p.name?.includes(search) || p.code.includes(search.toUpperCase()));
  }, [patients, entries, search]);

  const riskColor = a => a >= 65 ? "#ef4444" : a >= 40 ? "#f59e0b" : "#22c55e";
  const riskLabel = a => a >= 65 ? "גבוה" : a >= 40 ? "בינוני" : "נמוך";

  return (
    <div style={{ padding: "16px 20px", direction: "rtl" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
        <h2 style={{ margin: 0, fontSize: 20 }}>👥 מטופלים ({enriched.length})</h2>
        <input placeholder="🔍 חיפוש..." value={search} onChange={e => setSearch(e.target.value)} style={{ width: 180, fontSize: 13 }} />
      </div>

      {enriched.length === 0 && (
        <div style={{ textAlign: "center", padding: "40px 0", color: "#94a3b8" }}>
          <div style={{ fontSize: 32, marginBottom: 8 }}>👥</div>
          <div>{search ? "לא נמצאו תוצאות" : "אין מטופלים עדיין"}</div>
        </div>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {enriched.map(p => (
          <div key={p.id} onClick={() => onSelect(p)} className="card" style={{ cursor: "pointer", borderRight: `4px solid ${riskColor(p.anxiety)}` }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
              <div>
                <span style={{ fontWeight: 700, fontSize: 15 }}>{p.name}</span>
                <span style={{ fontSize: 12, color: "#94a3b8", marginRight: 8 }}>{p.code}</span>
              </div>
              <span style={{ padding: "3px 10px", borderRadius: 999, fontSize: 12, fontWeight: 700, background: riskColor(p.anxiety) + "18", color: riskColor(p.anxiety) }}>
                {riskLabel(p.anxiety)} · {p.anxiety}
              </span>
            </div>
            <div style={{ display: "flex", gap: 16, fontSize: 12, color: "#64748b", marginBottom: 10 }}>
              <span>📋 {p.entryCount} אירועים</span>
              <span>🕒 {p.lastSeen ? new Date(p.lastSeen).toLocaleDateString("he-IL") : "—"}</span>
            </div>
            <div style={{ display: "flex", gap: 8 }} onClick={e => e.stopPropagation()}>
              <button onClick={() => resetPatient(p)} style={{ flex:1, padding: 8, borderRadius: 8, border: "1px solid #f59e0b", background: "white", color: "#f59e0b", fontWeight: 600, fontSize: 12, cursor: "pointer" }}>🔄 איפוס</button>
              <button onClick={() => deletePatient(p)} disabled={deleting === p.id} style={{ flex:1, padding: 8, borderRadius: 8, border: "1px solid #ef4444", background: "white", color: "#ef4444", fontWeight: 600, fontSize: 12, cursor: "pointer" }}>
                {deleting === p.id ? "..." : "🗑 מחיקה"}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
