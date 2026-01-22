export default function AlunosHeader() {
  return (
    <div style={{ marginBottom: "24px" }}>
      <h1>Gestão de Alunos</h1>
      <p style={{ color: "#666" }}>9 alunos cadastrados</p>

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginTop: "16px",
          gap: "12px"
        }}
      >
        {/* Busca */}
        <input
          type="text"
          placeholder="Procurar por alunos"
          style={{
            width: "300px",
            padding: "8px 12px",
            borderRadius: "8px",
            border: "1px solid #ddd",
            color: "#201e1e",
            background: "#f9f9f9"
          }}
        />

        {/* Ações */}
        <div style={{ display: "flex", gap: "12px" }}>
          <button>Exportar</button>
          <button
            style={{
              background: "#4F46E5",
              color: "#fff",
              borderRadius: "8px",
              padding: "8px 16px",
              border: "none"
            }}
          >
            Novo Aluno
          </button>
        </div>
      </div>
    </div>
  );
}
