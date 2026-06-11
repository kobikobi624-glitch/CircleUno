import AlertBadge from "./AlertBadge";

export default function PatientCard({ patient, onSelect }) {
  const getAlertLevel = () => {
    const anxietyDelta = patient.anxiety - patient.prevAnxiety;
    const responseDelta =
      patient.responseRate - patient.prevResponse;

    if (
      patient.anxiety >= 70 ||
      patient.responseRate < 50
    ) {
      return "red";
    }

    if (
      anxietyDelta > 10 ||
      responseDelta < -10
    ) {
      return "yellow";
    }

    return "green";
  };

  const level = getAlertLevel();

  return (
    <div
      onClick={() => onSelect(patient)}
      style={{
        background: "white",
        borderRadius: 16,
        padding: 16,
        cursor: "pointer",
        border: "1px solid #e5e7eb",
        boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: 10,
        }}
      >
        <h3 style={{ margin: 0 }}>{patient.name}</h3>

        <AlertBadge level={level} />
      </div>

      <div style={{ fontSize: 14 }}>
        <p>חרדה ממוצעת: {patient.anxiety}</p>
        <p>אחוז תגובה: {patient.responseRate}%</p>
      </div>
    </div>
  );
}