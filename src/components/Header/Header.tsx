interface HeaderProps {
  onMenuClick?: () => void;
}

export default function Header({ onMenuClick }: HeaderProps) {
  return (
    <header
      style={{
        height: "64px",
        background: "#ffffff",
        borderBottom: "1px solid #eee",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 24px",
        position: "sticky",
        top: 0,
        zIndex: 100
      }}
    >

      <button
        onClick={onMenuClick}
        style={{
          background: "none",
          border: "1px solid #eee",
          fontSize: "20px",
          cursor: "pointer",
          width: "40px", 
          height: "40px", 
          padding: "0", 
          borderRadius: "50%", 
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transition: "background-color 0.2s",
          color: "#333"
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = "#f5f5f5";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = "transparent";
          e.currentTarget.style.transform = "scale(1)";
        }}
      >
        {onMenuClick ? "☰" : "←"}
      </button>

      {/* Busca */}
      <div style={{ flex: 1, maxWidth: "400px", margin: "0 24px" }}>
        <input
          type="text"
          placeholder="Buscar..."
          style={{
            width: "100%",
            padding: "8px 12px",
            borderRadius: "8px",
            border: "1px solid #ddd",
            backgroundColor: "#f9f9f9",
            fontSize: "14px",
            outline: "none",
            transition: "border-color 0.2s"
          }}
          onFocus={(e) => {
            e.currentTarget.style.borderColor = "#2563eb";
          }}
          onBlur={(e) => {
            e.currentTarget.style.borderColor = "#ddd";
          }}
        />
      </div>

      {/* Ações */}
      <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
        <button
          style={{
            background: "none",
            border: "none",
            fontSize: "20px",
            cursor: "pointer",
            padding: "8px",
            borderRadius: "4px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transition: "background-color 0.2s"
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = "#f5f5f5";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = "transparent";
          }}
        >
          🔔
        </button>

        <div style={{
          textAlign: "right",
          color: "#374151",
          paddingRight: "8px"
        }}>
          <strong style={{ fontSize: "14px" }}>TERLYS</strong>
          <div style={{ fontSize: "12px", color: "#4CAF50" }}>
            Gestor Principal
          </div>
        </div>

        <div style={{
          width: "40px",
          height: "40px",
          borderRadius: "50%",
          backgroundColor: "#2563eb",
          color: "white",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "16px",
          fontWeight: "bold"
        }}>
          T
        </div>
      </div>
    </header>
  );
}
