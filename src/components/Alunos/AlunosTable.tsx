import Pagination from "../Table/Pagination";

interface Aluno {
    nome: string;
    idade: number;
    escola: string;
    responsavel: string;
    cadastro: string;
}

const alunos: Aluno[] = Array.from({ length: 10 }).map((_, index) => ({
    nome: `Aluno ${index + 1}`,
    idade: 6 + index,
    escola: index % 3 === 0 ? "São Bento" : index % 3 === 1 ? "Centro Educacional" : "Vila Nova",
    responsavel: index % 2 === 0 ? "Mãe/Pai" : "Avó/Avô",
    cadastro: `29 Dec ${2022 + index % 3}`
}));

export default function AlunosTable() {
    return (
        <div
            style={{
                background: "#fff",
                borderRadius: "16px",
                padding: "24px",
                boxShadow: "0 6px 24px rgba(0,0,0,0.04)",
                overflow: "hidden"
            }}
        >
            {/* Header com título e filtros */}
            <div style={{ 
                display: "flex", 
                justifyContent: "space-between", 
                alignItems: "center", 
                marginBottom: "24px" 
            }}>
                <h3 style={{ margin: 0, fontSize: "18px", fontWeight: "600", color: "#374151" }}>
                    Lista de Alunos
                </h3>
                
                <div style={{ display: "flex", gap: "12px" }}>
                    <select 
                        style={{
                            padding: "10px 16px",
                            borderRadius: "8px",
                            border: "1px solid #e5e7eb",
                            backgroundColor: "white",
                            fontSize: "14px",
                            minWidth: "180px",
                            color: "#374151"
                        }}
                    >
                        <option value="">Selecionar CID</option>
                        <option value="f80">F80 - Transtornos específicos do desenvolvimento da fala e da linguagem</option>
                        <option value="f90">F90 - Transtornos hipercinéticos</option>
                        <option value="f84">F84 - Transtornos globais do desenvolvimento</option>
                    </select>

                    <select 
                        style={{
                            padding: "10px 16px",
                            borderRadius: "8px",
                            border: "1px solid #e5e7eb",
                            backgroundColor: "white",
                            fontSize: "14px",
                            minWidth: "180px",
                            color: "#374151"
                        }}
                    >
                        <option value="">Selecionar Escola</option>
                        <option value="sao-bento">São Bento</option>
                        <option value="centro">Centro Educacional</option>
                        <option value="vila-nova">Vila Nova</option>
                        <option value="santa-maria">Santa Maria</option>
                    </select>
                </div>
            </div>

            {/* Tabela */}
            <div style={{ overflowX: "auto" }}>
                <table style={{ 
                    width: "100%", 
                    borderCollapse: "collapse",
                    minWidth: "800px"
                }}>
                    <thead>
                        <tr style={{ 
                            backgroundColor: "#f9fafb",
                            borderBottom: "2px solid #e5e7eb"
                        }}>
                            <th style={{ 
                                padding: "16px 12px", 
                                textAlign: "left",
                                fontWeight: "600",
                                color: "#374151",
                                fontSize: "14px"
                            }}>Aluno</th>
                            <th style={{ 
                                padding: "16px 12px", 
                                textAlign: "left",
                                fontWeight: "600",
                                color: "#374151",
                                fontSize: "14px"
                            }}>Idade</th>
                            <th style={{ 
                                padding: "16px 12px", 
                                textAlign: "left",
                                fontWeight: "600",
                                color: "#374151",
                                fontSize: "14px"
                            }}>Escola</th>
                            <th style={{ 
                                padding: "16px 12px", 
                                textAlign: "left",
                                fontWeight: "600",
                                color: "#374151",
                                fontSize: "14px"
                            }}>Responsável</th>
                            <th style={{ 
                                padding: "16px 12px", 
                                textAlign: "left",
                                fontWeight: "600",
                                color: "#374151",
                                fontSize: "14px"
                            }}>Cadastrado em</th>
                            <th style={{ 
                                padding: "16px 12px", 
                                textAlign: "left",
                                fontWeight: "600",
                                color: "#374151",
                                fontSize: "14px"
                            }}>Ação</th>
                        </tr>
                    </thead>

                    <tbody>
                        {alunos.map((aluno, index) => (
                            <tr 
                                key={index} 
                                style={{ 
                                    borderBottom: "1px solid #f1f1f1",
                                    backgroundColor: index % 2 === 0 ? "white" : "#fafafa",
                                    transition: "background-color 0.2s"
                                }}
                                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#f8f9fa"}
                                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = index % 2 === 0 ? "white" : "#fafafa"}
                            >
                                <td style={{ 
                                    padding: "16px 12px",
                                    color: "#111827",
                                    fontWeight: "500"
                                }}>{aluno.nome}</td>
                                <td style={{ 
                                    padding: "16px 12px",
                                    color: "#6b7280"
                                }}>{aluno.idade} anos</td>
                                <td style={{ 
                                    padding: "16px 12px",
                                    color: "#111827"
                                }}>{aluno.escola}</td>
                                <td style={{ 
                                    padding: "16px 12px",
                                    color: "#6b7280"
                                }}>{aluno.responsavel}</td>
                                <td style={{ 
                                    padding: "16px 12px",
                                    color: "#6b7280"
                                }}>{aluno.cadastro}</td>
                                <td style={{ 
                                    padding: "16px 12px"
                                }}>
                                    <div style={{ display: "flex", gap: "8px" }}>
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
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Paginação */}
            <div style={{ 
                marginTop: "24px", 
                display: "flex", 
                justifyContent: "space-between", 
                alignItems: "center",
                paddingTop: "16px",
                borderTop: "1px solid #e5e7eb"
            }}>
                <div style={{ color: "#6b7280", fontSize: "14px" }}>
                    Mostrando 1-10 de {alunos.length} alunos
                </div>
                <Pagination />
            </div>
        </div>
    );
}