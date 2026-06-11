import { useState, useEffect, useRef } from "react";
import {
  getNotifications,
  markAllRead,
  clearNotifications,
} from "../utils/notifications";

const icons = { danger: "🔴", warning: "🟡", success: "🟢", info: "🔵" };

export default function NotificationBell({ refresh }) {
  const [open, setOpen] = useState(false);
  const [notifs, setNotifs] = useState([]);
  const ref = useRef(null);

  const load = () => setNotifs(getNotifications());

  useEffect(() => { load(); }, [refresh]);

  // Close when clicking outside
  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const unread = notifs.filter(n => !n.read).length;

  const handleOpen = () => {
    setOpen(o => !o);
    if (!open) {
      markAllRead();
      setTimeout(load, 100);
    }
  };

  return (
    <div style={{ position: "relative" }} ref={ref}>
      <button className="notif-bell" onClick={handleOpen} title="התראות">
        🔔
        {unread > 0 && <span className="notif-dot" />}
      </button>

      {open && (
        <div className="notif-panel">
          <div className="notif-header">
            <span>🔔 התראות</span>
            {notifs.length > 0 && (
              <button
                onClick={() => { clearNotifications(); load(); }}
                style={{ fontSize: 12, color: "#ef4444", background: "none", border: "none", cursor: "pointer" }}
              >
                נקה הכל
              </button>
            )}
          </div>

          {notifs.length === 0 ? (
            <div className="notif-empty">אין התראות חדשות ✅</div>
          ) : (
            notifs.map(n => (
              <div key={n.id} className={`notif-item ${n.read ? "" : "unread"}`}>
                <div style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
                  <span>{icons[n.type] || "ℹ️"}</span>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 13 }}>{n.title}</div>
                    <div style={{ color: "#475569", marginTop: 2 }}>{n.body}</div>
                    <div className="notif-time">
                      {new Date(n.timestamp).toLocaleString("he-IL")}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
