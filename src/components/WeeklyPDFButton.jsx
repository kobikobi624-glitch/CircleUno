import { jsPDF } from "jspdf";

export default function WeeklyPDFButton({ patient }) {
  const generate = () => {
    const doc = new jsPDF();

    doc.setFontSize(16);
    doc.text(`CircleUno Clinical Report`, 10, 10);

    doc.setFontSize(12);
    doc.text(`Patient: ${patient.name}`, 10, 20);

    doc.text(`Code: ${patient.id}`, 10, 30);

    doc.text(`Avg Anxiety: ${patient.anxiety}`, 10, 40);

    doc.text(
      `Response Rate: ${patient.responseRate}%`,
      10,
      50
    );

    doc.text("Triggers:", 10, 60);

    patient.triggers.forEach((t, i) => {
      doc.text(`- ${t}`, 15, 70 + i * 10);
    });

    doc.text("Recent Entries:", 10, 110);

    patient.entries.slice(0, 5).forEach((e, i) => {
      doc.text(
        `${e.trigger} | ${e.anxiety} | ${e.response}`,
        10,
        120 + i * 10
      );
    });

    doc.save(`${patient.name}-report.pdf`);
  };

  return (
    <button
      onClick={generate}
      style={{
        marginTop: 20,
        padding: 12,
        borderRadius: 10,
        border: "none",
        background: "#22c55e",
        color: "white",
        fontWeight: "bold",
      }}
    >
      📄 ייצא דוח שבועי
    </button>
  );
}