export default function ClinicalSummary({ patient }) {
  const anxietyChange =
    patient.anxiety - patient.prevAnxiety;

  const responseChange =
    patient.responseRate -
    patient.prevResponse;

  const buildSummary = () => {
    const lines = [];

    // Anxiety
    if (anxietyChange > 10) {
      lines.push(
        `נרשמה עלייה של ${anxietyChange} נקודות ברמת החרדה לעומת השבוע הקודם.`
      );
    } else if (anxietyChange < -10) {
      lines.push(
        `נרשמה ירידה של ${Math.abs(
          anxietyChange
        )} נקודות ברמת החרדה.`
      );
    } else {
      lines.push(
        "רמת החרדה נשארה יחסית יציבה."
      );
    }

    // Response
    if (responseChange < -10) {
      lines.push(
        `אחוז התגובה ירד ב-${Math.abs(
          responseChange
        )}%.`
      );
    } else if (responseChange > 10) {
      lines.push(
        `אחוז התגובה עלה ב-${responseChange}%.`
      );
    }

    // Triggers
    if (patient.triggers.length > 0) {
      lines.push(
        `הטריגרים המרכזיים השבוע היו: ${patient.triggers.join(
          ", "
        )}.`
      );
    }

    // Attention
    if (
      patient.anxiety >= 70 ||
      patient.responseRate < 50
    ) {
      lines.push(
        "המטופל דורש תשומת לב מוגברת השבוע."
      );
    }

    return lines;
  };

  const summary = buildSummary();

  return (
    <div
      style={{
        marginTop: 24,
        background: "#eef2ff",
        borderRadius: 18,
        padding: 20,
        border: "1px solid #c7d2fe",
      }}
    >
      <h3>🧠 סיכום קליני אוטומטי</h3>

      {summary.map((line, index) => (
        <p
          key={index}
          style={{
            lineHeight: 1.8,
            marginBottom: 10,
          }}
        >
          {line}
        </p>
      ))}
    </div>
  );
}