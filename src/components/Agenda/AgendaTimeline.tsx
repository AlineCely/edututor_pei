const horarios = [
  "08:00", "09:00", "10:00", "11:00", "12:00",
  "13:00", "14:00", "15:00"
];

export default function AgendaTimeline() {
  return (
    <div
      style={{
        background: "#fff",
        borderRadius: "12px",
        padding: "16px",
        marginBottom: "24px",
        color: "#333"
      }}
    >
      <h3>Agendamentos do Dia</h3>

      <div style={{ marginTop: "12px" }}>
        {horarios.map((h) => (
          <div
            key={h}
            style={{
              padding: "8px 0",
              borderBottom: "1px solid #eee",
              fontSize: "14px",
              color: "#333"
            }}
          >
            <strong>{h}</strong> — Agendamento
          </div>
        ))}
      </div>
    </div>
  );
}
