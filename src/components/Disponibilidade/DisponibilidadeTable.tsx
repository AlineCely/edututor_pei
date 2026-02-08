import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabase";
import Pagination from "../Table/Pagination";
// import DisponibilidadeHeader from "./DisponibilidadeHeader";
import { toast } from "react-hot-toast";

interface Disponibilidade {
    Disponibilidade_ID: number;
    Professor_ID: number | null;
    Dia_semana: string | null;
    Hora_inicio: string | null;
    Hora_fim: string | null;
    Status: string | null;
    created_at: string;
    // Relacionamentos
    Professores?: {
        Professor_ID: number;
        Usuarios?: {
            Nome: string;
        };
    };
}

export default function DisponibilidadeTable() {
    const navigate = useNavigate();
    const [disponibilidades, setDisponibilidades] = useState<Disponibilidade[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [filterProfessor, setFilterProfessor] = useState<string>("");
    const [filterDiaSemana, setFilterDiaSemana] = useState<string>("");
    const [filterStatus, setFilterStatus] = useState<string>("");
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalCount, setTotalCount] = useState(0);
    const [professores, setProfessores] = useState<any[]>([]);
    const itemsPerPage = 10;

    // Dias da semana ordenados
    const diasSemana = [
        "Segunda-feira",
        "Terça-feira",
        "Quarta-feira",
        "Quinta-feira",
        "Sexta-feira",
        "Sábado",
        "Domingo"
    ];

    // Buscar disponibilidades
    useEffect(() => {
        fetchDisponibilidades();
        fetchProfessores();
    }, [searchTerm, filterProfessor, filterDiaSemana, filterStatus, currentPage]);

    async function fetchDisponibilidades() {
        try {
            setLoading(true);

            let query = supabase
                .from("Disponibilidade")
                .select(`
          *,
          Professores:Professor_ID (
            Professor_ID,
            Usuarios:Usuario_ID (
              Nome
            )
          )
        `, { count: 'exact' });

            // Aplicar filtros
            if (searchTerm) {
                query = query.or(`Professores.Usuarios.Nome.ilike.%${searchTerm}%`);
            }

            if (filterProfessor) {
                query = query.eq("Professor_ID", filterProfessor);
            }

            if (filterDiaSemana) {
                query = query.eq("Dia_semana", filterDiaSemana);
            }

            if (filterStatus) {
                query = query.eq("Status", filterStatus);
            }

            // Paginação
            const from = (currentPage - 1) * itemsPerPage;
            const to = from + itemsPerPage - 1;

            // Ordenar por dia da semana (ordem lógica) e hora de início
            query = query
                .order("Dia_semana", { ascending: true })
                .order("Hora_inicio", { ascending: true })
                .range(from, to);

            const { data, error, count } = await query;

            if (error) throw error;

            // Ordenar os dados localmente por ordem dos dias da semana
            const dadosOrdenados = (data || []).sort((a, b) => {
                const indexA = diasSemana.indexOf(a.Dia_semana || "");
                const indexB = diasSemana.indexOf(b.Dia_semana || "");
                return indexA - indexB;
            });

            setDisponibilidades(dadosOrdenados);
            setTotalCount(count || 0);
            setTotalPages(Math.ceil((count || 0) / itemsPerPage));
            setError(null);
        } catch (err: any) {
            console.error("Erro ao buscar disponibilidades:", err);
            setError("Erro ao carregar disponibilidades. Tente novamente.");
        } finally {
            setLoading(false);
        }
    }

    async function fetchProfessores() {
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
    }

    // Calcular estatísticas
    const disponibilidadesAtivas = disponibilidades.filter(d => d.Status === "ativo").length;
    const professoresComDisponibilidade = [...new Set(disponibilidades
        .map(d => d.Professores?.Professor_ID)
        .filter(Boolean))].length;

    // Calcular horas totais disponíveis
    const horasTotaisDisponiveis = disponibilidades.reduce((total, disp) => {
        if (!disp.Hora_inicio || !disp.Hora_fim) return total;

        const inicio = new Date(`1970-01-01T${disp.Hora_inicio}`);
        const fim = new Date(`1970-01-01T${disp.Hora_fim}`);
        const diffMs = fim.getTime() - inicio.getTime();
        const diffHoras = diffMs / (1000 * 60 * 60);

        return total + (diffHoras > 0 ? diffHoras : 0);
    }, 0);

    // Formatar hora
    const formatTime = (timeString: string | null) => {
        if (!timeString) return "-";
        return timeString.substring(0, 5); // Retorna apenas HH:MM
    };

    // Calcular duração
    const calcularDuracao = (inicio: string | null, fim: string | null) => {
        if (!inicio || !fim) return "-";

        const inicioDate = new Date(`1970-01-01T${inicio}`);
        const fimDate = new Date(`1970-01-01T${fim}`);
        const diffMs = fimDate.getTime() - inicioDate.getTime();
        const diffHoras = diffMs / (1000 * 60 * 60);

        if (diffHoras < 1) {
            const minutos = Math.floor(diffHoras * 60);
            return `${minutos} min`;
        }

        const horas = Math.floor(diffHoras);
        const minutos = Math.floor((diffHoras - horas) * 60);
        return `${horas}h${minutos > 0 ? ` ${minutos}min` : ''}`;
    };

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

    // Determinar cor do status
    const getStatusColor = (status: string | null) => {
        switch (status) {
            case "ativo":
                return { color: "#059669", bgColor: "#d1fae5", icon: "🟢", label: "Ativo" };
            case "inativo":
                return { color: "#dc2626", bgColor: "#fee2e2", icon: "🔴", label: "Inativo" };
            case "temporario":
                return { color: "#d97706", bgColor: "#fef3c7", icon: "🟡", label: "Temporário" };
            default:
                return { color: "#6b7280", bgColor: "#f3f4f6", icon: "⚪", label: "Indefinido" };
        }
    };

    // Obter ícone do dia da semana
    const getDiaIcon = (dia: string | null) => {
        switch (dia) {
            case "Segunda-feira": return "📅";
            case "Terça-feira": return "📅";
            case "Quarta-feira": return "📅";
            case "Quinta-feira": return "📅";
            case "Sexta-feira": return "📅";
            case "Sábado": return "🎉";
            case "Domingo": return "☀️";
            default: return "📅";
        }
    };

    // Handle delete
    const handleDelete = async (id: number, professorNome: string, diaSemana: string) => {
        if (!window.confirm(`Tem certeza que deseja excluir a disponibilidade de ${professorNome} para ${diaSemana}?`)) {
            return;
        }

        try {
            const { error } = await supabase
                .from("Disponibilidade")
                .delete()
                .eq("Disponibilidade_ID", id);

            if (error) throw error;

            toast.success("Disponibilidade excluída com sucesso!");
            fetchDisponibilidades(); // Recarregar a lista
        } catch (err: any) {
            console.error("Erro ao excluir disponibilidade:", err);
            toast.error("Erro ao excluir disponibilidade: " + err.message);
        }
    };

    // Handle search
    const handleSearch = (term: string) => {
        setSearchTerm(term);
        setCurrentPage(1);
    };

    // Handle filter change
    const handleFilterChange = (filter: {
        professor?: string;
        diaSemana?: string;
        status?: string;
    }) => {
        if (filter.professor !== undefined) setFilterProfessor(filter.professor);
        if (filter.diaSemana !== undefined) setFilterDiaSemana(filter.diaSemana);
        if (filter.status !== undefined) setFilterStatus(filter.status);
        setCurrentPage(1);
    };

    // Exportar dados
    const exportData = () => {
        const dataToExport = disponibilidades.map(disp => {
            const status = getStatusColor(disp.Status);
            return {
                ID: disp.Disponibilidade_ID,
                Professor: disp.Professores?.Usuarios?.Nome || "Não definido",
                "Dia da Semana": disp.Dia_semana || "",
                "Hora Início": formatTime(disp.Hora_inicio),
                "Hora Fim": formatTime(disp.Hora_fim),
                Duração: calcularDuracao(disp.Hora_inicio, disp.Hora_fim),
                Status: status.label,
                "Data Cadastro": formatDate(disp.created_at)
            };
        });

        const csvContent = [
            Object.keys(dataToExport[0] || {}).join(","),
            ...dataToExport.map(row => Object.values(row).map(v => `"${v}"`).join(","))
        ].join("\n");

        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `disponibilidades_${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);

        toast.success("Dados exportados com sucesso!");
    };

    // Agrupar disponibilidades por professor para visualização mais organizada
    const disponibilidadesAgrupadas = disponibilidades.reduce((acc, disp) => {
        const professorId = disp.Professor_ID;
        if (!professorId) return acc;

        if (!acc[professorId]) {
            acc[professorId] = {
                professor: disp.Professores?.Usuarios?.Nome || `Professor ${professorId}`,
                disponibilidades: []
            };
        }

        acc[professorId].disponibilidades.push(disp);
        return acc;
    }, {} as Record<number, { professor: string; disponibilidades: Disponibilidade[] }>);

    if (error && disponibilidades.length === 0) {
        return (
            <div style={{ padding: "40px", textAlign: "center" }}>
                <p style={{ color: "#dc2626", marginBottom: "16px" }}>{error}</p>
                <button
                    onClick={() => fetchDisponibilidades()}
                    style={{
                        padding: "10px 20px",
                        background: "#4F46E5",
                        color: "#fff",
                        border: "none",
                        borderRadius: "6px",
                        cursor: "pointer"
                    }}
                >
                    Tentar novamente
                </button>
            </div>
        );
    }

    return (
        <div>
            {/* Header com estatísticas e filtros */}
            {/* <DisponibilidadeHeader
                totalDisponibilidades={totalCount}
                disponibilidadesAtivas={disponibilidadesAtivas}
                professoresComDisponibilidade={professoresComDisponibilidade}
                horasTotaisDisponiveis={Math.round(horasTotaisDisponiveis)}
                onSearch={handleSearch}
                onFilterChange={handleFilterChange}
                professores={professores}
            /> */}

            {/* Tabela */}
            <div style={{
                background: "#fff",
                borderRadius: "12px",
                overflow: "hidden",
                boxShadow: "0 2px 8px rgba(0,0,0,0.05)"
            }}>
                {/* Loading State */}
                {loading && disponibilidades.length === 0 ? (
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
                        <p style={{ marginTop: "16px", color: "#6b7280" }}>Carregando disponibilidades...</p>
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
                                {disponibilidades.length} de {totalCount} horários
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

                        {/* Tabela - Visualização Agrupada por Professor */}
                        <div style={{ overflowX: "auto" }}>
                            {Object.keys(disponibilidadesAgrupadas).length === 0 ? (
                                <div style={{
                                    padding: "48px 24px",
                                    textAlign: "center",
                                    color: "#9ca3af",
                                    fontSize: "14px"
                                }}>
                                    {searchTerm || filterProfessor || filterDiaSemana || filterStatus
                                        ? "Nenhuma disponibilidade encontrada com os filtros aplicados."
                                        : "Nenhuma disponibilidade cadastrada."}
                                </div>
                            ) : (
                                Object.entries(disponibilidadesAgrupadas).map(([professorId, data]) => (
                                    <div key={professorId} style={{ borderBottom: "1px solid #e5e7eb" }}>
                                        {/* Cabeçalho do Professor */}
                                        <div style={{
                                            backgroundColor: "#f8fafc",
                                            padding: "16px 24px",
                                            borderBottom: "1px solid #e5e7eb"
                                        }}>
                                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                                <div>
                                                    <h3 style={{ margin: 0, fontSize: "16px", fontWeight: "600", color: "#1f2937" }}>
                                                        {data.professor}
                                                    </h3>
                                                    <p style={{ margin: "4px 0 0", fontSize: "13px", color: "#6b7280" }}>
                                                        {data.disponibilidades.length} horário(s) cadastrado(s)
                                                    </p>
                                                </div>
                                                <button
                                                    onClick={() => navigate(`/disponibilidade/nova?professor=${professorId}`)}
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
                                                    <span>➕</span>
                                                    Adicionar Horário
                                                </button>
                                            </div>
                                        </div>

                                        {/* Horários do Professor */}
                                        <div style={{ padding: "0" }}>
                                            <table style={{
                                                width: "100%",
                                                borderCollapse: "collapse"
                                            }}>
                                                <thead>
                                                    <tr style={{
                                                        backgroundColor: "#f9fafb",
                                                        borderBottom: "1px solid #e5e7eb"
                                                    }}>
                                                        <th style={{
                                                            padding: "12px 16px",
                                                            textAlign: "left",
                                                            fontSize: "12px",
                                                            fontWeight: "600",
                                                            color: "#6b7280",
                                                            textTransform: "uppercase",
                                                            letterSpacing: "0.05em",
                                                            width: "20%"
                                                        }}>Dia da Semana</th>
                                                        <th style={{
                                                            padding: "12px 16px",
                                                            textAlign: "left",
                                                            fontSize: "12px",
                                                            fontWeight: "600",
                                                            color: "#6b7280",
                                                            textTransform: "uppercase",
                                                            letterSpacing: "0.05em",
                                                            width: "20%"
                                                        }}>Horário</th>
                                                        <th style={{
                                                            padding: "12px 16px",
                                                            textAlign: "left",
                                                            fontSize: "12px",
                                                            fontWeight: "600",
                                                            color: "#6b7280",
                                                            textTransform: "uppercase",
                                                            letterSpacing: "0.05em",
                                                            width: "15%"
                                                        }}>Duração</th>
                                                        <th style={{
                                                            padding: "12px 16px",
                                                            textAlign: "left",
                                                            fontSize: "12px",
                                                            fontWeight: "600",
                                                            color: "#6b7280",
                                                            textTransform: "uppercase",
                                                            letterSpacing: "0.05em",
                                                            width: "15%"
                                                        }}>Status</th>
                                                        <th style={{
                                                            padding: "12px 16px",
                                                            textAlign: "left",
                                                            fontSize: "12px",
                                                            fontWeight: "600",
                                                            color: "#6b7280",
                                                            textTransform: "uppercase",
                                                            letterSpacing: "0.05em",
                                                            width: "20%"
                                                        }}>Cadastro</th>
                                                        <th style={{
                                                            padding: "12px 16px",
                                                            textAlign: "left",
                                                            fontSize: "12px",
                                                            fontWeight: "600",
                                                            color: "#6b7280",
                                                            textTransform: "uppercase",
                                                            letterSpacing: "0.05em",
                                                            width: "10%"
                                                        }}>Ações</th>
                                                    </tr>
                                                </thead>

                                                <tbody>
                                                    {data.disponibilidades.map((disp) => {
                                                        const status = getStatusColor(disp.Status);

                                                        return (
                                                            <tr
                                                                key={disp.Disponibilidade_ID}
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
                                                                <td style={{ padding: "12px 16px" }}>
                                                                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                                                        <span style={{ fontSize: "16px" }}>
                                                                            {getDiaIcon(disp.Dia_semana)}
                                                                        </span>
                                                                        <div>
                                                                            <div style={{ fontWeight: "500", color: "#1f2937" }}>
                                                                                {disp.Dia_semana}
                                                                            </div>
                                                                            <div style={{ fontSize: "11px", color: "#6b7280" }}>
                                                                                ID: #{disp.Disponibilidade_ID}
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                </td>

                                                                <td style={{ padding: "12px 16px" }}>
                                                                    <div style={{ fontWeight: "500", color: "#1f2937" }}>
                                                                        {formatTime(disp.Hora_inicio)} - {formatTime(disp.Hora_fim)}
                                                                    </div>
                                                                </td>

                                                                <td style={{ padding: "12px 16px" }}>
                                                                    <div style={{
                                                                        display: "inline-flex",
                                                                        alignItems: "center",
                                                                        padding: "6px 12px",
                                                                        borderRadius: "20px",
                                                                        fontSize: "12px",
                                                                        fontWeight: "600",
                                                                        backgroundColor: "#f3f4f6",
                                                                        color: "#374151"
                                                                    }}>
                                                                        <span style={{ marginRight: "4px" }}>⏱️</span>
                                                                        {calcularDuracao(disp.Hora_inicio, disp.Hora_fim)}
                                                                    </div>
                                                                </td>

                                                                <td style={{ padding: "12px 16px" }}>
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

                                                                <td style={{ padding: "12px 16px" }}>
                                                                    <div style={{
                                                                        fontSize: "13px",
                                                                        color: "#6b7280"
                                                                    }}>
                                                                        {formatDate(disp.created_at)}
                                                                    </div>
                                                                </td>

                                                                <td style={{ padding: "12px 16px" }}>
                                                                    <div style={{ display: "flex", gap: "8px" }}>
                                                                        <button
                                                                            onClick={() => navigate(`/disponibilidade/${disp.Disponibilidade_ID}/editar`)}
                                                                            style={{
                                                                                padding: "6px 10px",
                                                                                borderRadius: "6px",
                                                                                border: "1px solid #d1d5db",
                                                                                backgroundColor: "white",
                                                                                cursor: "pointer",
                                                                                fontSize: "12px",
                                                                                display: "flex",
                                                                                alignItems: "center",
                                                                                gap: "4px",
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
                                                                            <span style={{ fontSize: "12px" }}>✏️</span>
                                                                        </button>

                                                                        <button
                                                                            onClick={() => handleDelete(
                                                                                disp.Disponibilidade_ID,
                                                                                data.professor,
                                                                                disp.Dia_semana || "este horário"
                                                                            )}
                                                                            style={{
                                                                                padding: "6px 10px",
                                                                                borderRadius: "6px",
                                                                                border: "1px solid #fecaca",
                                                                                backgroundColor: "#fef2f2",
                                                                                cursor: "pointer",
                                                                                fontSize: "12px",
                                                                                display: "flex",
                                                                                alignItems: "center",
                                                                                gap: "4px",
                                                                                transition: "all 0.2s",
                                                                                color: "#dc2626",
                                                                                fontWeight: "500"
                                                                            }}
                                                                            onMouseEnter={(e) => {
                                                                                e.currentTarget.style.backgroundColor = "#fee2e2";
                                                                                e.currentTarget.style.borderColor = "#f87171";
                                                                            }}
                                                                            onMouseLeave={(e) => {
                                                                                e.currentTarget.style.backgroundColor = "#fef2f2";
                                                                                e.currentTarget.style.borderColor = "#fca5a5";
                                                                            }}
                                                                        >
                                                                            <span style={{ fontSize: "12px" }}>🗑️</span>
                                                                        </button>
                                                                    </div>
                                                                </td>
                                                            </tr>
                                                        );
                                                    })}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>

                        {/* Paginação */}
                        {disponibilidades.length > 0 && totalPages > 1 && (
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
                                    currentPage={currentPage}
                                    totalPages={totalPages}
                                    onPageChange={(page) => setCurrentPage(page)}
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