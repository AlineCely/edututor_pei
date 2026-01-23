import Pagination from "../Table/Pagination";

interface Registro {
    estudante: string;
    escola: string;
    serie: string;
    professor: string;
    status: string;
    criadoEm: string;
}

const registros: Registro[] = Array.from({ length: 10 }).map(() => ({
    estudante: "Nome estudante",
    escola: "Escola Exemplo",
    serie: "5º Ano",
    professor: "Professor",
    status: "Ativo",
    criadoEm: "14/12/2025"
}));

export default function FolhasRegistroTable() {
    return (
        <div
            style={{
                background: "#fff",
                borderRadius: "12px",
                padding: "16px",
                color: "#333",
            }}
        >
            {/* Filtros */}
            <div style={{ display: "flex", gap: "12px", marginBottom: "16px" }}>
                <select style={{ padding: "8px", borderRadius: "6px", border: "1px solid #ccc", backgroundColor: "#f9f9f9", color: "#555" }} >
                    <option>Status</option>
                    <option>Ativo</option>
                    <option>Inativo</option>
                </select>

                <select style={{ padding: "8px", borderRadius: "6px", border: "1px solid #ccc", backgroundColor: "#f9f9f9", color: "#555" }} >
                    <option>Atendimentos</option>
                    <option>Concluídos</option>
                    <option>Pendentes</option>
                </select>
            </div>

            <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                    <tr style={{ borderBottom: "1px solid #eee", textAlign: "left" }}>
                        <th>Estudante</th>
                        <th>Escola</th>
                        <th>Série/Ano</th>
                        <th>Professor</th>
                        <th>Status</th>
                        <th>Data Criação</th>
                        <th>Ação</th>
                    </tr>
                </thead>

                <tbody>
                    {registros.map((r, index) => (
                        <tr key={index} style={{ borderBottom: "1px solid #f1f1f1" }}>
                            <td style={{ padding: "12px" }}>{r.estudante}</td>
                            <td>{r.escola}</td>
                            <td>{r.serie}</td>
                            <td>{r.professor}</td>
                            <td>
                                <span
                                    style={{
                                        color: r.status === "Ativo" ? "#16a34a" : "#dc2626",
                                        fontWeight: 500
                                    }}
                                >
                                    {r.status}
                                </span>
                            </td>
                            <td>{r.criadoEm}</td>
                            <div style={{ display: "flex", gap: "8px", marginTop: "6px" }}>
                                <button
                                    style={{
                                        padding: "8px 12px",
                                        borderRadius: "6px",
                                        border: "1px solid #d1d5db",
                                        backgroundColor: "white",
                                        cursor: "pointer",
                                        fontSize: "14px",
                                        display: "flex",
                                        alignItems: "center",
                                        gap: "4px",
                                        transition: "all 0.2s",
                                        color: "#374151"
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.backgroundColor = "#f3f4f6";
                                        e.currentTarget.style.borderColor = "#9ca3af";
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.backgroundColor = "white";
                                        e.currentTarget.style.borderColor = "#d1d5db";
                                    }}
                                >
                                    👁️ Ver
                                </button>
                                <button
                                    style={{
                                        padding: "8px 12px",
                                        borderRadius: "6px",
                                        border: "1px solid #d1d5db",
                                        backgroundColor: "white",
                                        cursor: "pointer",
                                        fontSize: "14px",
                                        display: "flex",
                                        alignItems: "center",
                                        gap: "4px",
                                        transition: "all 0.2s",
                                        color: "#374151"
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.backgroundColor = "#f3f4f6";
                                        e.currentTarget.style.borderColor = "#9ca3af";
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.backgroundColor = "white";
                                        e.currentTarget.style.borderColor = "#d1d5db";
                                    }}
                                >
                                    ✏️ Editar
                                </button>
                            </div>
                        </tr>
                    ))}
                </tbody>
            </table>

            <Pagination />
        </div>
    );
}
