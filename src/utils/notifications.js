// Notification system — stored in localStorage, with auto-generation from patient data

const KEY = "circleuno_notifications";

export function getNotifications() {
  return JSON.parse(localStorage.getItem(KEY) || "[]");
}

export function saveNotifications(notifs) {
  localStorage.setItem(KEY, JSON.stringify(notifs));
}

export function markAllRead() {
  const notifs = getNotifications().map(n => ({ ...n, read: true }));
  saveNotifications(notifs);
}

export function clearNotifications() {
  saveNotifications([]);
}

export function addNotification(notif) {
  const notifs = getNotifications();
  notifs.unshift({ id: Date.now(), read: false, timestamp: new Date().toISOString(), ...notif });
  // keep max 30
  saveNotifications(notifs.slice(0, 30));
}

// Run on dashboard load — scan patients and generate alerts
export function generateAlertsFromPatients() {
  const patients = JSON.parse(localStorage.getItem("circleuno_patients") || "[]");
  const entries  = JSON.parse(localStorage.getItem("circleuno_entries")  || "[]");
  const existing = getNotifications();

  const generated = [];

  patients.forEach(p => {
    const pEntries = entries.filter(e => e.patientCode === p.code);
    if (pEntries.length === 0) return;

    const recent = pEntries
      .sort((a,b) => new Date(b.timestamp) - new Date(a.timestamp))
      .slice(0, 5);

    const avg = recent.reduce((s,e) => s + e.anxiety, 0) / recent.length;

    // High anxiety alert (once per day per patient)
    if (avg >= 70) {
      const key = `high_anxiety_${p.code}_${new Date().toDateString()}`;
      if (!existing.find(n => n.key === key)) {
        generated.push({
          key,
          type: "danger",
          title: `חרדה גבוהה – ${p.name || p.code}`,
          body: `ממוצע חרדה ${Math.round(avg)} ב-5 הדיווחים האחרונים`,
          patientCode: p.code,
        });
      }
    }

    // No check-in for 3+ days
    const last = new Date(recent[0].timestamp);
    const daysSince = (Date.now() - last.getTime()) / (1000 * 86400);
    if (daysSince >= 3) {
      const key = `no_checkin_${p.code}_${new Date().toDateString()}`;
      if (!existing.find(n => n.key === key)) {
        generated.push({
          key,
          type: "warning",
          title: `אין דיווח – ${p.name || p.code}`,
          body: `${Math.floor(daysSince)} ימים ללא דיווח`,
          patientCode: p.code,
        });
      }
    }

    // Rising trend
    if (pEntries.length >= 4) {
      const sorted = [...pEntries].sort((a,b) => new Date(a.timestamp)-new Date(b.timestamp));
      const half = Math.floor(sorted.length / 2);
      const firstAvg = sorted.slice(0, half).reduce((s,e)=>s+e.anxiety,0)/half;
      const secAvg   = sorted.slice(half).reduce((s,e)=>s+e.anxiety,0)/(sorted.length-half);
      if (secAvg - firstAvg > 15) {
        const key = `rising_${p.code}_${new Date().toDateString()}`;
        if (!existing.find(n => n.key === key)) {
          generated.push({
            key,
            type: "warning",
            title: `מגמת עלייה – ${p.name || p.code}`,
            body: `רמת החרדה עולה בעקביות (${Math.round(firstAvg)}→${Math.round(secAvg)})`,
            patientCode: p.code,
          });
        }
      }
    }
  });

  if (generated.length > 0) {
    const updated = [...generated, ...existing].slice(0, 30);
    saveNotifications(updated);
  }

  return generated.length;
}
