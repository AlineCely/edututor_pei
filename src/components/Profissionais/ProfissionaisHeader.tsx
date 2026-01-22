export default function ProfissionaisHeader() {
  return (
    <div style={{ marginBottom: "24px" }}>
      <h1>Gestão de Profissionais</h1>
      <p style={{ color: "#666" }}>8 profissional(is) cadastrado(s)</p>

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginTop: "16px",
          gap: "12px",
          background: "#f9f9f9",
        }}
      >
        {/* Busca */}
        <input
          type="text"
          placeholder="Buscar por nome ou disciplina"
          style={{
            width: "320px",
            padding: "8px 12px",
            borderRadius: "8px",
            border: "1px solid #ddd",
            background: "#fff",
          }}
        />

        {/* Ações */}
        <div style={{ display: "flex", gap: "12px" }}>
          <button>Exportar</button>
          <button
            style={{
              background: "#2563eb",
              color: "#fff",
              borderRadius: "8px",
              padding: "8px 16px",
              border: "none"
            }}
          >
            Novo Profissional
          </button>
        </div>
      </div>
    </div>
  );
}
