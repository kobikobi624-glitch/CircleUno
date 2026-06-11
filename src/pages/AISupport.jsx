import { useState, useRef, useEffect } from "react";

const STEPS = [
  { key: "trigger",  question: "מה קורה עכשיו? תאר את הטריגר או המצב שגרם לך להרגיש כך.",  type: "text" },
  { key: "anxiety",  question: "על סקלה של 0–100, כמה חרדה אתה מרגיש עכשיו?", type: "slider" },
  { key: "urge",     question: "האם יש לך דחף לבצע פעולה / טקס / להימנע ממשהו?",
    type: "choice", options: ["כן, דחף חזק", "כן, קצת", "לא ממש"] },
];

const SYSTEM_PROMPT = `You are a compassionate AI support assistant for people dealing with anxiety and OCD, working within a clinical app called CircleUno. You are NOT a therapist and you make this clear when relevant.

Your role:
- Support the patient through difficult moments between therapy sessions
- Use ERP (Exposure and Response Prevention) and CBT principles
- Be warm, validating, and non-judgmental
- Help the patient sit with discomfort without performing compulsions/avoidance
- Ask one question at a time
- Keep responses concise (2-4 sentences max)
- Always respond in Hebrew
- Never diagnose or prescribe
- If the patient expresses thoughts of self-harm, always direct them to their therapist or emergency services immediately

Important: You already know from the intake that:
INTAKE_DATA

Refer to this context naturally in the conversation. Start by acknowledging what they shared, then guide them gently.`;

export default function AISupport({ patientCode, onBack }) {
  const [phase, setPhase]       = useState("intake"); // intake | chat
  const [stepIdx, setStepIdx]   = useState(0);
  const [intake, setIntake]     = useState({});
  const [sliderVal, setSliderVal] = useState(50);
  const [textVal, setTextVal]   = useState("");

  const [messages, setMessages] = useState([]);
  const [input, setInput]       = useState("");
  const [loading, setLoading]   = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, phase]);

  // ── INTAKE ──
  const currentStep = STEPS[stepIdx];

  const submitIntakeStep = async (value) => {
    const newIntake = { ...intake, [currentStep.key]: value };
    setIntake(newIntake);

    if (stepIdx < STEPS.length - 1) {
      setStepIdx(i => i + 1);
      setTextVal("");
      setSliderVal(50);
    } else {
      // Move to chat phase
      setPhase("chat");
      await startChat(newIntake);
    }
  };

  // ── CHAT ──
  const buildSystemPrompt = (intakeData) => {
    const urgeMap = { "כן, דחף חזק": "דחף חזק לביצוע פעולה", "כן, קצת": "דחף קל", "לא ממש": "אין דחף מיוחד" };
    const info = `טריגר: "${intakeData.trigger}" | רמת חרדה: ${intakeData.anxiety}/100 | דחף: ${urgeMap[intakeData.urge] || intakeData.urge}`;
    return SYSTEM_PROMPT.replace("INTAKE_DATA", info);
  };

  const startChat = async (intakeData) => {
    setLoading(true);
    const systemPrompt = buildSystemPrompt(intakeData);
    const firstUserMsg = `סיימתי את השאלות הראשוניות. הטריגר שלי: "${intakeData.trigger}". רמת חרדה: ${intakeData.anxiety}. ${intakeData.urge}.`;

    const initialMessages = [{ role: "user", content: firstUserMsg }];
    setMessages([{ role: "user", content: firstUserMsg, hidden: true }]);

    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          system: systemPrompt,
          messages: initialMessages,
        }),
      });
      const data = await res.json();
      const reply = data.content?.[0]?.text || "אני כאן איתך. ספר לי עוד.";
      setMessages([
        { role: "user", content: firstUserMsg, hidden: true },
        { role: "assistant", content: reply },
      ]);
    } catch {
      setMessages([
        { role: "user", content: firstUserMsg, hidden: true },
        { role: "assistant", content: "אני כאן איתך. לא הצלחתי להתחבר — נסה שוב." },
      ]);
    }
    setLoading(false);
  };

  const sendMessage = async () => {
    if (!input.trim() || loading) return;
    const userMsg = input.trim();
    setInput("");

    const newMessages = [...messages, { role: "user", content: userMsg }];
    setMessages(newMessages);
    setLoading(true);

    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          system: buildSystemPrompt(intake),
          messages: newMessages.filter(m => !m.hidden).map(m => ({ role: m.role, content: m.content })),
        }),
      });
      const data = await res.json();
      const reply = data.content?.[0]?.text || "אני כאן. ספר לי עוד.";
      setMessages(prev => [...prev, { role: "assistant", content: reply }]);
    } catch {
      setMessages(prev => [...prev, { role: "assistant", content: "שגיאת חיבור — נסה שוב." }]);
    }
    setLoading(false);
  };

  // ── RENDER INTAKE ──
  if (phase === "intake") {
    return (
      <div style={{ minHeight: "100vh", background: "#f1f5f9", direction: "rtl", display: "flex", flexDirection: "column" }}>
        <div className="topbar">
          <button onClick={onBack} style={{ background: "none", border: "none", color: "#64748b", cursor: "pointer", fontSize: 13 }}>⬅ חזרה</button>
          <span style={{ fontWeight: 600, fontSize: 14 }}>🤖 תמיכה ברגע הקשה</span>
          <span style={{ fontSize: 12, color: "#94a3b8" }}>{stepIdx + 1} / {STEPS.length}</span>
        </div>

        <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
          <div style={{ maxWidth: 480, width: "100%" }}>

            {/* Progress bar */}
            <div style={{ background: "#e2e8f0", borderRadius: 999, height: 4, marginBottom: 24 }}>
              <div style={{ background: "#6366f1", borderRadius: 999, height: 4, width: `${((stepIdx + 1) / STEPS.length) * 100}%`, transition: "width 0.3s" }} />
            </div>

            <div className="card">
              <p style={{ fontSize: 16, fontWeight: 600, marginBottom: 20, lineHeight: 1.6 }}>
                {currentStep.question}
              </p>

              {currentStep.type === "text" && (
                <>
                  <textarea
                    rows={3}
                    value={textVal}
                    onChange={e => setTextVal(e.target.value)}
                    placeholder="כתוב כאן..."
                    style={{ resize: "none", marginBottom: 12 }}
                    autoFocus
                  />
                  <button className="btn-primary" onClick={() => textVal.trim() && submitIntakeStep(textVal.trim())} disabled={!textVal.trim()}>
                    המשך ←
                  </button>
                </>
              )}

              {currentStep.type === "slider" && (
                <>
                  <div style={{ textAlign: "center", marginBottom: 12 }}>
                    <span style={{
                      fontSize: 48, fontWeight: 800,
                      color: sliderVal >= 70 ? "#ef4444" : sliderVal >= 40 ? "#f59e0b" : "#22c55e"
                    }}>{sliderVal}</span>
                    <span style={{ color: "#94a3b8", fontSize: 14 }}> / 100</span>
                  </div>
                  <input type="range" min="0" max="100" value={sliderVal}
                    onChange={e => setSliderVal(Number(e.target.value))}
                    style={{ width: "100%", accentColor: sliderVal >= 70 ? "#ef4444" : sliderVal >= 40 ? "#f59e0b" : "#22c55e", border: "none", background: "transparent", padding: 0, marginBottom: 16 }}
                  />
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "#94a3b8", marginBottom: 16 }}>
                    <span>0 – ללא חרדה</span><span>100 – גבוה מאוד</span>
                  </div>
                  <button className="btn-primary" onClick={() => submitIntakeStep(sliderVal)}>המשך ←</button>
                </>
              )}

              {currentStep.type === "choice" && (
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {currentStep.options.map(opt => (
                    <button key={opt} onClick={() => submitIntakeStep(opt)} style={{
                      padding: "12px 16px", borderRadius: 12, border: "1.5px solid #e2e8f0",
                      background: "white", cursor: "pointer", textAlign: "right", fontSize: 14,
                      fontWeight: 500, transition: "all 0.1s",
                    }}
                    onMouseEnter={e => { e.target.style.borderColor = "#6366f1"; e.target.style.background = "#eef2ff"; }}
                    onMouseLeave={e => { e.target.style.borderColor = "#e2e8f0"; e.target.style.background = "white"; }}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── RENDER CHAT ──
  const visibleMessages = messages.filter(m => !m.hidden);

  return (
    <div style={{ minHeight: "100vh", background: "#f1f5f9", direction: "rtl", display: "flex", flexDirection: "column" }}>
      <div className="topbar">
        <button onClick={onBack} style={{ background: "none", border: "none", color: "#64748b", cursor: "pointer", fontSize: 13 }}>⬅ חזרה</button>
        <span style={{ fontWeight: 600, fontSize: 14 }}>🤖 תמיכה ברגע הקשה</span>
        <span style={{ fontSize: 11, color: "#94a3b8" }}>AI · לא מחליף מטפל</span>
      </div>

      {/* Intake summary */}
      <div style={{ background: "#eef2ff", padding: "8px 16px", fontSize: 12, color: "#4f46e5", borderBottom: "1px solid #e2e8f0", direction: "rtl" }}>
        טריגר: <b>{intake.trigger}</b> · חרדה: <b>{intake.anxiety}</b> · דחף: <b>{intake.urge}</b>
      </div>

      {/* Messages */}
      <div style={{ flex: 1, overflowY: "auto", padding: "16px", display: "flex", flexDirection: "column", gap: 12 }}>
        {loading && visibleMessages.length === 0 && (
          <div style={{ textAlign: "center", color: "#94a3b8", marginTop: 40 }}>
            <div style={{ fontSize: 24, marginBottom: 8 }}>💭</div>
            <div>מתחבר...</div>
          </div>
        )}

        {visibleMessages.map((m, i) => (
          <div key={i} style={{
            display: "flex",
            justifyContent: m.role === "user" ? "flex-start" : "flex-end",
          }}>
            <div style={{
              maxWidth: "80%",
              padding: "10px 14px",
              borderRadius: m.role === "user" ? "16px 16px 4px 16px" : "16px 16px 16px 4px",
              background: m.role === "user" ? "white" : "#6366f1",
              color: m.role === "user" ? "#0f172a" : "white",
              fontSize: 14,
              lineHeight: 1.6,
              border: m.role === "user" ? "1px solid #e2e8f0" : "none",
              boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
            }}>
              {m.role === "assistant" && <div style={{ fontSize: 11, opacity: 0.7, marginBottom: 4 }}>🤖 CircleUno AI</div>}
              {m.content}
            </div>
          </div>
        ))}

        {loading && visibleMessages.length > 0 && (
          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            <div style={{ background: "#6366f1", borderRadius: "16px 16px 16px 4px", padding: "10px 16px", color: "white", fontSize: 14 }}>
              <span style={{ opacity: 0.7 }}>מקליד...</span>
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div style={{ padding: "12px 16px", background: "white", borderTop: "1px solid #e2e8f0", display: "flex", gap: 8 }}>
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === "Enter" && !e.shiftKey && sendMessage()}
          placeholder="כתוב הודעה..."
          style={{ flex: 1 }}
          disabled={loading}
        />
        <button
          onClick={sendMessage}
          disabled={loading || !input.trim()}
          style={{
            padding: "10px 16px", borderRadius: 10, border: "none",
            background: input.trim() && !loading ? "#6366f1" : "#e2e8f0",
            color: input.trim() && !loading ? "white" : "#94a3b8",
            fontWeight: 600, cursor: input.trim() && !loading ? "pointer" : "default",
            fontSize: 14, transition: "all 0.15s",
          }}
        >
          שלח
        </button>
      </div>
    </div>
  );
}
