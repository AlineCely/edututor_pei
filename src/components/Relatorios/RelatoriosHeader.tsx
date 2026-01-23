export default function RelatoriosHeader() {
    return (
        <div style={{ marginBottom: "24px" }}>
            <h1>Relatórios Essenciais</h1>
            <p style={{ color: "#666" }}>
                Gere relatórios automáticos e precisos para acompanhamento clínico
            </p>

            {/* Filtros globais */}
            <div
                style={{
                    display: "flex",
                    gap: "12px",
                    marginTop: "16px",
                    flexWrap: "wrap"
                }}
            >
                <input
                    type="text"
                    placeholder="Buscar por estudante ou paciente"
                    style={{
                        width: "260px",
                        padding: "8px 12px",
                        borderRadius: "8px",
                        border: "1px solid #ddd",
                        color: "#333",
                        backgroundColor: "#fff"
                    }}
                />

                <input type="date" style={{
                    borderRadius: "8px",
                    border: "1px solid #ddd",
                    color: "#333",
                    backgroundColor: "#fff"
                }} />
                <input type="date" style={{
                    borderRadius: "8px",
                    border: "1px solid #ddd",
                    color: "#333",
                    backgroundColor: "#fff"
                }}

                />
            </div>
        </div>
    );
}
