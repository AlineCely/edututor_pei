const blocos = [
  {
    titulo: "Hoje",
    eventos: ["Agendamento 08:00", "Agendamento 09:00", "Agendamento 10:00"]
  },
  {
    titulo: "Amanhã",
    eventos: ["Agendamento 13:00", "Agendamento 14:00"]
  },
  {
    titulo: "Importante",
    eventos: ["Agendamento 01-02 até 14-02"]
  }
];

export default function AgendaSidebar() {
  return (
    <aside style={{ width: "260px" }}>
      {blocos.map((b) => (
        <div
          key={b.titulo}
          style={{
            background: "#fff",
            borderRadius: "12px",
            padding: "16px",
            marginBottom: "16px",
            boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
            color: "#333"
          }}
        >
          <h3>{b.titulo}</h3>
          <ul style={{ paddingLeft: "16px", marginTop: "8px" }}>
            {b.eventos.map((e, i) => (
              <li key={i} style={{ fontSize: "14px", marginBottom: "6px" }}>
                {e}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </aside>
  );
}
