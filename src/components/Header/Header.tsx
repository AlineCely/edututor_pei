export default function Header() {
  return (
    <header
      style={{
        height: "64px",
        background: "#ffffff",
        borderBottom: "1px solid #eee",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 24px"
      }}
    >
      {/* Busca */}
      <input
        type="text"
        placeholder="Buscar..."
        style={{
          width: "280px",
          padding: "8px 12px",
          borderRadius: "8px",
          border: "1px solid #ddd",
          backgroundColor: "#f9f9f9",
        }}
      />

      {/* Ações */}
      <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
        <span>🔔</span>

        <div style={{ textAlign: "right", color: "#374151" }}>
          <strong>TERLYS</strong>
          <div style={{ fontSize: "12px", color: "#4CAF50" }}>
            Gestor Principal
          </div>
        </div>
      </div>
    </header>
  );
}
