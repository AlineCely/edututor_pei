import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabase";
import Pagination from "../Table/Pagination";
import { toast } from "react-hot-toast";

interface Turma {
    Turma_ID: number;
    Nome: string;
    Descricao: string | null;
    Data_inicio: string | null;
    Data_fim: string | null;
    created_at: string;
    // Relacionamentos
    Professores?: {
        Professor_ID: number;
        Usuarios?: {
            Nome: string;
        };
    };
    Alunos_Turmas?: Array<{
        Aluno_ID: number;
        Alunos?: {
            Nome: string;
        };
    }>;
}

interface Props {
    onStatsUpdate?: (stats: {
        totalTurmas: number;
        turmasAtivas: number;
        turmasFinalizadas: number;
        professoresCount: number;
    }) => void;
    externalSearchTerm?: string;
    externalFilters?: { status?: string; professor?: string };
}

export default function TurmasTable({
    onStatsUpdate,
    externalSearchTerm = "",
    externalFilters = {}
}: Props) {
    const navigate = useNavigate();
    const [turmas, setTurmas] = useState<Turma[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState(externalSearchTerm);
    const [filterStatus, setFilterStatus] = useState<string>(externalFilters.status || "");
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalCount, setTotalCount] = useState(0);
    const [professores, setProfessores] = useState<any[]>([]);
    const itemsPerPage = 10;

    // Sincronizar com props externas
    useEffect(() => {
        if (externalSearchTerm !== undefined) {
            setSearchTerm(externalSearchTerm);
        }
    }, [externalSearchTerm]);

    useEffect(() => {
        if (externalFilters.status !== undefined) {
            setFilterStatus(externalFilters.status);
        }
    }, [externalFilters]);

    // Buscar turmas
    const fetchTurmas = useCallback(async () => {
        try {
            setLoading(true);

            let query = supabase
                .from("Turmas")
                .select(`
          *,
          Professores:Professor_ID (
            Professor_ID,
            Usuarios:Usuario_ID (
              Nome
            )
          ),
          Alunos_Turmas (
            Aluno_ID,
            Alunos:Aluno_ID (
              Nome
            )
          )
        `, { count: 'exact' });

            // Aplicar filtros
            if (searchTerm) {
                query = query.or(`
          Nome.ilike.%${searchTerm}%,
          Descricao.ilike.%${searchTerm}%,
          Professores.Usuarios.Nome.ilike.%${searchTerm}%
        `);
            }

            // Aplicar filtro de status
            if (filterStatus) {
                const hoje = new Date().toISOString().split('T')[0];

                if (filterStatus === "ativa") {
                    query = query.or(`Data_fim.is.null,Data_fim.gte.${hoje}`);
                } else if (filterStatus === "finalizada") {
                    query = query.lt("Data_fim", hoje);
                } else if (filterStatus === "futura") {
                    query = query.gt("Data_inicio", hoje);
                }
            }

            // Paginação
            const from = (currentPage - 1) * itemsPerPage;
            const to = from + itemsPerPage - 1;

            query = query
                .order("Data_inicio", { ascending: false })
                .range(from, to);

            const { data, error, count } = await query;

            if (error) throw error;

            const turmasData = data || [];
            setTurmas(turmasData);
            setTotalCount(count || 0);
            setTotalPages(Math.ceil((count || 0) / itemsPerPage));

            // Calcular estatísticas e notificar componente pai
            if (onStatsUpdate) {
                const hoje = new Date();

                const turmasAtivas = turmasData.filter(t => {
                    if (!t.Data_fim) return true;
                    const dataFim = new Date(t.Data_fim);
                    return dataFim >= hoje;
                }).length;

                const turmasFinalizadas = turmasData.filter(t => {
                    if (!t.Data_fim) return false;
                    const dataFim = new Date(t.Data_fim);
                    return dataFim < hoje;
                }).length;

                const professoresUnicos = [...new Set(turmasData
                    .map(t => t.Professores?.Professor_ID)
                    .filter(Boolean))].length;

                onStatsUpdate({
                    totalTurmas: count || 0,
                    turmasAtivas,
                    turmasFinalizadas,
                    professoresCount: professoresUnicos
                });
            }

        } catch (err: any) {
            console.error("Erro ao buscar turmas:", err);
            toast.error("Erro ao carregar turmas. Tente novamente.");
        } finally {
            setLoading(false);
        }
    }, [searchTerm, filterStatus, currentPage, onStatsUpdate]);

    useEffect(() => {
        fetchTurmas();
    }, [fetchTurmas]);

    // Buscar professores para os filtros
    useEffect(() => {
        const fetchProfessores = async () => {
            try {
                const { data, error } = await supabase
                    .from("Professores")
                    .select(`
                        Professor_ID,
                        Usuarios:Usuario_ID (
                            Nome
                        )
                    `)
                    .order("Professor_ID");

                if (error) throw error;
                setProfessores(data || []);
            } catch (err) {
                console.error("Erro ao buscar professores:", err);
            }
        };
        
        fetchProfessores();
    }, []);

    // Formatar data
    const formatDate = (dateString: string | null) => {
        if (!dateString) return "-";
        const date = new Date(dateString);
        return date.toLocaleDateString("pt-BR", {
            day: "2-digit",
            month: "short",
            year: "numeric"
        });
    };

    // Determinar status da turma
    const getTurmaStatus = (turma: Turma) => {
        const hoje = new Date();

        if (turma.Data_inicio && new Date(turma.Data_inicio) > hoje) {
            return { label: "Futura", color: "#d97706", bgColor: "#fef3c7" };
        }

        if (!turma.Data_fim || new Date(turma.Data_fim) >= hoje) {
            return { label: "Ativa", color: "#059669", bgColor: "#d1fae5" };
        }

        return { label: "Finalizada", color: "#6b7280", bgColor: "#f3f4f6" };
    };

    // Contar alunos na turma
    const contarAlunos = (alunos?: Array<any>) => {
        return alunos?.length || 0;
    };

    // Calcular duração
    const calcularDuracao = (dataInicio: string | null, dataFim: string | null) => {
        if (!dataInicio) return "-";

        const inicio = new Date(dataInicio);
        const fim = dataFim ? new Date(dataFim) : new Date();

        const diffMs = fim.getTime() - inicio.getTime();
        const diffDias = Math.floor(diffMs / (1000 * 60 * 60 * 24));

        if (diffDias === 0) return "Hoje";
        if (diffDias < 30) return `${diffDias} dias`;
        if (diffDias < 365) return `${Math.floor(diffDias / 30)} meses`;

        return `${Math.floor(diffDias / 365)} anos`;
    };

    // Handle delete
    const handleDelete = async (id: number, nome: string, temAlunos: boolean) => {
        if (temAlunos) {
            toast.error("Esta turma possui alunos vinculados. Remova os alunos primeiro.");
            return;
        }

        if (!window.confirm(`Tem certeza que deseja excluir a turma "${nome}"?`)) {
            return;
        }

        try {
            const { error } = await supabase
                .from("Turmas")
                .delete()
                .eq("Turma_ID", id);

            if (error) throw error;

            toast.success("Turma excluída com sucesso!");
            fetchTurmas(); // Recarregar a lista
        } catch (err: any) {
            console.error("Erro ao excluir turma:", err);
            toast.error("Erro ao excluir turma: " + err.message);
        }
    };

    // Exportar dados
    const exportData = () => {
        const dataToExport = turmas.map(turma => {
            const status = getTurmaStatus(turma);
            return {
                ID: turma.Turma_ID,
                Nome: turma.Nome,
                Professor: turma.Professores?.Usuarios?.Nome || "-",
                "Data Início": formatDate(turma.Data_inicio),
                "Data Fim": formatDate(turma.Data_fim),
                "Total Alunos": contarAlunos(turma.Alunos_Turmas),
                Status: status.label,
                "Data Cadastro": formatDate(turma.created_at)
            };
        });

        const csvContent = [
            Object.keys(dataToExport[0] || {}).join(","),
            ...dataToExport.map(row => Object.values(row).join(","))
        ].join("\n");

        const blob = new Blob([csvContent], { type: "text/csv" });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `turmas_${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);

        toast.success("Dados exportados com sucesso!");
    };


    return (
        <div>
            {/* Tabela */}
            <div style={{
                background: "#fff",
                borderRadius: "12px",
                overflow: "hidden",
                boxShadow: "0 2px 8px rgba(0,0,0,0.05)"
            }}>
                {/* Loading State */}
                {loading && turmas.length === 0 ? (
                    <div style={{ padding: "40px", textAlign: "center" }}>
                        <div style={{
                            display: "inline-block",
                            width: "40px",
                            height: "40px",
                            border: "3px solid #e5e7eb",
                            borderTopColor: "#4F46E5",
                            borderRadius: "50%",
                            animation: "spin 1s linear infinite"
                        }}></div>
                        <p style={{ marginTop: "16px", color: "#6b7280" }}>Carregando turmas...</p>
                    </div>
                ) : (
                    <>
                        {/* Contador e Exportação */}
                        <div style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            padding: "16px 24px",
                            borderBottom: "1px solid #e5e7eb",
                            backgroundColor: "#f9fafb"
                        }}>
                            <div style={{ color: "#6b7280", fontSize: "14px", fontWeight: "500" }}>
                                {turmas.length} de {totalCount} turmas
                            </div>
                            <button
                                onClick={exportData}
                                style={{
                                    padding: "8px 16px",
                                    borderRadius: "6px",
                                    border: "1px solid #d1d5db",
                                    backgroundColor: "#fff",
                                    color: "#374151",
                                    cursor: "pointer",
                                    fontSize: "13px",
                                    fontWeight: "500",
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "6px",
                                    transition: "all 0.2s"
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.backgroundColor = "#f3f4f6";
                                    e.currentTarget.style.borderColor = "#9ca3af";
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.backgroundColor = "#fff";
                                    e.currentTarget.style.borderColor = "#d1d5db";
                                }}
                            >
                                <span>📥</span>
                                Exportar CSV
                            </button>
                        </div>

                        {/* Tabela */}
                        <div style={{ overflowX: "auto" }}>
                            <table style={{
                                width: "100%",
                                borderCollapse: "collapse",
                                minWidth: "1000px"
                            }}>
                                <thead>
                                    <tr style={{
                                        backgroundColor: "#f9fafb",
                                        borderBottom: "1px solid #e5e7eb"
                                    }}>
                                        <th style={{
                                            padding: "16px 12px",
                                            textAlign: "left",
                                            fontSize: "12px",
                                            fontWeight: "600",
                                            color: "#6b7280",
                                            textTransform: "uppercase",
                                            letterSpacing: "0.05em"
                                        }}>Turma</th>
                                        <th style={{
                                            padding: "16px 12px",
                                            textAlign: "left",
                                            fontSize: "12px",
                                            fontWeight: "600",
                                            color: "#6b7280",
                                            textTransform: "uppercase",
                                            letterSpacing: "0.05em"
                                        }}>Professor</th>
                                        <th style={{
                                            padding: "16px 12px",
                                            textAlign: "left",
                                            fontSize: "12px",
                                            fontWeight: "600",
                                            color: "#6b7280",
                                            textTransform: "uppercase",
                                            letterSpacing: "0.05em"
                                        }}>Período</th>
                                        <th style={{
                                            padding: "16px 12px",
                                            textAlign: "left",
                                            fontSize: "12px",
                                            fontWeight: "600",
                                            color: "#6b7280",
                                            textTransform: "uppercase",
                                            letterSpacing: "0.05em"
                                        }}>Alunos</th>
                                        <th style={{
                                            padding: "16px 12px",
                                            textAlign: "left",
                                            fontSize: "12px",
                                            fontWeight: "600",
                                            color: "#6b7280",
                                            textTransform: "uppercase",
                                            letterSpacing: "0.05em"
                                        }}>Status</th>
                                        <th style={{
                                            padding: "16px 12px",
                                            textAlign: "left",
                                            fontSize: "12px",
                                            fontWeight: "600",
                                            color: "#6b7280",
                                            textTransform: "uppercase",
                                            letterSpacing: "0.05em"
                                        }}>Cadastro</th>
                                        <th style={{
                                            padding: "16px 12px",
                                            textAlign: "left",
                                            fontSize: "12px",
                                            fontWeight: "600",
                                            color: "#6b7280",
                                            textTransform: "uppercase",
                                            letterSpacing: "0.05em"
                                        }}>Ações</th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {turmas.length === 0 ? (
                                        <tr>
                                            <td colSpan={7} style={{
                                                padding: "48px 24px",
                                                textAlign: "center",
                                                color: "#9ca3af",
                                                fontSize: "14px"
                                            }}>
                                                {searchTerm || filterStatus
                                                    ? "Nenhuma turma encontrada com os filtros aplicados."
                                                    : "Nenhuma turma cadastrada."}
                                            </td>
                                        </tr>
                                    ) : (
                                        turmas.map((turma) => {
                                            const status = getTurmaStatus(turma);
                                            const totalAlunos = contarAlunos(turma.Alunos_Turmas);
                                            const temAlunos = totalAlunos > 0;

                                            return (
                                                <tr
                                                    key={turma.Turma_ID}
                                                    style={{
                                                        borderBottom: "1px solid #f3f4f6",
                                                        transition: "background-color 0.2s"
                                                    }}
                                                    onMouseEnter={(e) => {
                                                        e.currentTarget.style.backgroundColor = "#f9fafb";
                                                    }}
                                                    onMouseLeave={(e) => {
                                                        e.currentTarget.style.backgroundColor = "#fff";
                                                    }}
                                                >
                                                    <td style={{ padding: "16px 12px" }}>
                                                        <div style={{ fontWeight: "600", color: "#1f2937", marginBottom: "4px" }}>
                                                            {turma.Nome}
                                                        </div>
                                                        <div style={{
                                                            fontSize: "12px",
                                                            color: "#6b7280"
                                                        }}>
                                                            ID: #{turma.Turma_ID.toString().padStart(3, '0')}
                                                        </div>
                                                        {turma.Descricao && (
                                                            <div style={{
                                                                fontSize: "12px",
                                                                color: "#6b7280",
                                                                marginTop: "4px",
                                                                maxWidth: "200px",
                                                                whiteSpace: "nowrap",
                                                                overflow: "hidden",
                                                                textOverflow: "ellipsis"
                                                            }}>
                                                                {turma.Descricao}
                                                            </div>
                                                        )}
                                                    </td>

                                                    <td style={{ padding: "16px 12px" }}>
                                                        <div style={{ fontWeight: "500", color: "#1f2937" }}>
                                                            {turma.Professores?.Usuarios?.Nome || "Sem professor"}
                                                        </div>
                                                    </td>

                                                    <td style={{ padding: "16px 12px" }}>
                                                        <div style={{ marginBottom: "4px" }}>
                                                            <div style={{ fontSize: "14px", color: "#1f2937", fontWeight: "500" }}>
                                                                {formatDate(turma.Data_inicio)} → {formatDate(turma.Data_fim)}
                                                            </div>
                                                        </div>
                                                        <div style={{ fontSize: "12px", color: "#6b7280" }}>
                                                            {calcularDuracao(turma.Data_inicio, turma.Data_fim)}
                                                        </div>
                                                    </td>

                                                    <td style={{ padding: "16px 12px" }}>
                                                        <div style={{
                                                            display: "inline-flex",
                                                            alignItems: "center",
                                                            padding: "6px 12px",
                                                            borderRadius: "20px",
                                                            fontSize: "12px",
                                                            fontWeight: "600",
                                                            backgroundColor: totalAlunos > 0 ? "#dbeafe" : "#f3f4f6",
                                                            color: totalAlunos > 0 ? "#1d4ed8" : "#6b7280"
                                                        }}>
                                                            <span style={{ marginRight: "4px" }}>
                                                                {totalAlunos > 0 ? "👥" : "👤"}
                                                            </span>
                                                            {totalAlunos} aluno{totalAlunos !== 1 ? 's' : ''}
                                                        </div>
                                                    </td>

                                                    <td style={{ padding: "16px 12px" }}>
                                                        <span
                                                            style={{
                                                                display: "inline-flex",
                                                                alignItems: "center",
                                                                padding: "6px 12px",
                                                                borderRadius: "20px",
                                                                fontSize: "12px",
                                                                fontWeight: "600",
                                                                color: status.color,
                                                                backgroundColor: status.bgColor
                                                            }}
                                                        >
                                                            <span style={{
                                                                width: "6px",
                                                                height: "6px",
                                                                backgroundColor: status.color,
                                                                borderRadius: "50%",
                                                                marginRight: "6px"
                                                            }}></span>
                                                            {status.label}
                                                        </span>
                                                    </td>

                                                    <td style={{
                                                        padding: "16px 12px",
                                                        fontSize: "14px",
                                                        color: "#6b7280"
                                                    }}>
                                                        {formatDate(turma.created_at)}
                                                    </td>

                                                    <td style={{ padding: "16px 12px" }}>
                                                        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                                                            <button
                                                                onClick={() => navigate(`/turmas/ver/${turma.Turma_ID}`)}
                                                                style={{
                                                                    padding: "8px 12px",
                                                                    borderRadius: "6px",
                                                                    border: "1px solid #d1d5db",
                                                                    backgroundColor: "white",
                                                                    cursor: "pointer",
                                                                    fontSize: "12px",
                                                                    display: "flex",
                                                                    alignItems: "center",
                                                                    gap: "6px",
                                                                    transition: "all 0.2s",
                                                                    color: "#374151",
                                                                    fontWeight: "500"
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
                                                                <span style={{ fontSize: "14px" }}>👁️</span>
                                                                Ver
                                                            </button>

                                                            <button
                                                                onClick={() => navigate(`/turmas/editar/${turma.Turma_ID}`)}
                                                                style={{
                                                                    padding: "8px 12px",
                                                                    borderRadius: "6px",
                                                                    border: "1px solid #d1d5db",
                                                                    backgroundColor: "white",
                                                                    cursor: "pointer",
                                                                    fontSize: "12px",
                                                                    display: "flex",
                                                                    alignItems: "center",
                                                                    gap: "6px",
                                                                    transition: "all 0.2s",
                                                                    color: "#374151",
                                                                    fontWeight: "500"
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
                                                                <span style={{ fontSize: "14px" }}>✏️</span>
                                                                Editar
                                                            </button>

                                                            <button
                                                                onClick={() => handleDelete(turma.Turma_ID, turma.Nome, temAlunos)}
                                                                disabled={temAlunos}
                                                                style={{
                                                                    padding: "8px 12px",
                                                                    borderRadius: "6px",
                                                                    border: `1px solid ${temAlunos ? "#f3f4f6" : "#fecaca"}`,
                                                                    backgroundColor: temAlunos ? "#f9fafb" : "#fef2f2",
                                                                    cursor: temAlunos ? "not-allowed" : "pointer",
                                                                    fontSize: "12px",
                                                                    display: "flex",
                                                                    alignItems: "center",
                                                                    gap: "6px",
                                                                    transition: "all 0.2s",
                                                                    color: temAlunos ? "#9ca3af" : "#dc2626",
                                                                    fontWeight: "500"
                                                                }}
                                                                onMouseEnter={(e) => {
                                                                    if (!temAlunos) {
                                                                        e.currentTarget.style.backgroundColor = "#fee2e2";
                                                                        e.currentTarget.style.borderColor = "#f87171";
                                                                    }
                                                                }}
                                                                onMouseLeave={(e) => {
                                                                    if (!temAlunos) {
                                                                        e.currentTarget.style.backgroundColor = "#fef2f2";
                                                                        e.currentTarget.style.borderColor = "#fca5a5";
                                                                    }
                                                                }}
                                                            >
                                                                <span style={{ fontSize: "14px" }}>🗑️</span>
                                                                Excluir
                                                            </button>

                                                            {temAlunos && (
                                                                <button
                                                                    onClick={() => navigate(`/alunos?turma=${turma.Turma_ID}`)}
                                                                    style={{
                                                                        padding: "8px 12px",
                                                                        borderRadius: "6px",
                                                                        border: "1px solid #bfdbfe",
                                                                        backgroundColor: "#eff6ff",
                                                                        cursor: "pointer",
                                                                        fontSize: "12px",
                                                                        display: "flex",
                                                                        alignItems: "center",
                                                                        gap: "6px",
                                                                        transition: "all 0.2s",
                                                                        color: "#1d4ed8",
                                                                        fontWeight: "500"
                                                                    }}
                                                                    onMouseEnter={(e) => {
                                                                        e.currentTarget.style.backgroundColor = "#dbeafe";
                                                                        e.currentTarget.style.borderColor = "#93c5fd";
                                                                    }}
                                                                    onMouseLeave={(e) => {
                                                                        e.currentTarget.style.backgroundColor = "#eff6ff";
                                                                        e.currentTarget.style.borderColor = "#bfdbfe";
                                                                    }}
                                                                >
                                                                    <span style={{ fontSize: "14px" }}>👨‍🎓</span>
                                                                    Ver Alunos
                                                                </button>
                                                            )}
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Paginação */}
                        {turmas.length > 0 && totalPages > 1 && (
                            <div style={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                                padding: "20px 24px",
                                borderTop: "1px solid #e5e7eb"
                            }}>
                                <div style={{ color: "#6b7280", fontSize: "14px" }}>
                                    Página {currentPage} de {totalPages}
                                </div>

                                <Pagination
                                    // currentPage={currentPage}
                                    // totalPages={totalPages}
                                    // onPageChange={(page) => setCurrentPage(page)}
                                />
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* CSS para animação de loading */}
            <style>
                {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}
            </style>
        </div>
    );
}