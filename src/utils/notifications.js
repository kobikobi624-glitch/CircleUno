const KEY = "circleuno_notifications";

export function getNotifications() {
  return JSON.parse(localStorage.getItem(KEY) || "[]");
}
export function saveNotifications(n) {
  localStorage.setItem(KEY, JSON.stringify(n));
}
export function markAllRead() {
  saveNotifications(getNotifications().map(n => ({ ...n, read: true })));
}
export function clearNotifications() {
  saveNotifications([]);
}
export function addNotification(notif) {
  const n = getNotifications();
  n.unshift({ id: Date.now(), read: false, timestamp: new Date().toISOString(), ...notif });
  saveNotifications(n.slice(0, 30));
}

// Called from TherapistDashboard with live Firestore data
export function generateAlertsFromData(patients, entries) {
  const existing = getNotifications();
  const generated = [];

  patients.forEach(p => {
    const pe = entries.filter(e => e.patientCode === p.code);
    if (pe.length === 0) return;

    const sorted = [...pe].sort((a,b) => new Date(b.timestamp) - new Date(a.timestamp));
    const recent = sorted.slice(0, 5);
    const avg = recent.reduce((s,e) => s + e.anxiety, 0) / recent.length;

    if (avg >= 70) {
      const key = `high_anxiety_${p.code}_${new Date().toDateString()}`;
      if (!existing.find(n => n.key === key)) {
        generated.push({ key, type: "danger", title: `High anxiety – ${p.name}`, body: `Average anxiety ${Math.round(avg)} in last 5 reports`, patientCode: p.code });
      }
    }

    const daysSince = (Date.now() - new Date(sorted[0].timestamp).getTime()) / 86400000;
    if (daysSince >= 3) {
      const key = `no_checkin_${p.code}_${new Date().toDateString()}`;
      if (!existing.find(n => n.key === key)) {
        generated.push({ key, type: "warning", title: `No check-in – ${p.name}`, body: `${Math.floor(daysSince)} days without a report`, patientCode: p.code });
      }
    }
  });

  if (generated.length > 0) saveNotifications([...generated, ...existing].slice(0, 30));
  return generated.length;
}
