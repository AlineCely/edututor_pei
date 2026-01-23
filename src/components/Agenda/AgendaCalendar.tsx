const dias = Array.from({ length: 31 }, (_, i) => i + 1);

export default function AgendaCalendar() {
  return (
    <div
      style={{
        background: "#fff",
        borderRadius: "12px",
        padding: "16px"
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: "16px",
          color: "#333"
        }}
      >
        <h3>Janeiro 2026</h3>
        <button
          style={{
            background: "#2563eb",
            color: "#fff",
            border: "none",
            borderRadius: "8px",
            padding: "6px 12px"
          }}
        >
          Criar
        </button>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(7, 1fr)",
          gap: "8px"
        }}
      >
        {dias.map((dia) => (
          <div
            key={dia}
            style={{
              border: "1px solid #eee",
              borderRadius: "8px",
              padding: "8px",
              minHeight: "80px",
              fontSize: "12px",
              color: "#333"
            }}
          >
            <strong>{dia}</strong>
            <div style={{ marginTop: "6px", color: "#2563eb" }}>
              Agenda 08:00
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
