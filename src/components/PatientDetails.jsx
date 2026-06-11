import WeeklyPDFButton from "./WeeklyPDFButton";
import Timeline from "./Timeline";
import ClinicalSummary from "./ClinicalSummary";
import WeeklyReport from "./WeeklyReport";

export default function PatientDetails({
  patient,
  onClose,
}) {
  if (!patient) return null;

  return (
    <div
      style={{
        marginTop: 20,
        background: "white",
        borderRadius: 20,
        padding: 20,
        boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
      }}
    >
      <button
        onClick={onClose}
        style={{
          float: "right",
          border: "none",
          background: "transparent",
          cursor: "pointer",
          fontSize: 18,
        }}
      >
        ✕
      </button>

      <h2>{patient.name}</h2>

      <p>חרדה ממוצעת: {patient.anxiety}</p>

      <p>אחוז תגובה: {patient.responseRate}%</p>

      <h3>טריגרים מרכזיים</h3>

      <ul>
        {patient.triggers.map((trigger) => (
          <li key={trigger}>{trigger}</li>
        ))}
      </ul>

      <WeeklyReport patient={patient} />
      <ClinicalSummary patient={patient} />
      <Timeline entries={patient.entries} />
      <WeeklyPDFButton patient={patient} />
    </div>
  );
}