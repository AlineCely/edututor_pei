import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabase";
import Pagination from "../Table/Pagination";
import { toast } from "react-hot-toast";

interface Aula {
    Aula_ID: number;
    Data_hora_inicio: string | null;
    Data_hora_fim: string | null;
    Status: string | null;
    Descricao: string | null;
    Link_reuniao: string | null;
    created_at: string;
    Professor_ID?: number;
    Disciplina_ID?: number;
    // Relacionamentos
    Professores?: {
        Professor_ID: number;
        Usuarios?: {
            Nome: string;
        };
    };
    Disciplinas?: {
        Nome: string;
    };
    Aulas_Alunos?: Array<{
        Aluno_ID: number;
    }>;
}

interface AulasTableProps {
    onStatsUpdate?: (stats: {
        totalAulas: number;
        aulasAgendadas: number;
        aulasRealizadas: number;
        aulasCanceladas: number;
        professoresCount: number;
        disciplinasCount: number;
        professores: any[];
        disciplinas: any[];
    }) => void;
    externalSearchTerm?: string;
    externalFilters?: {
        status?: string;
        professor?: string;
        disciplina?: string;
        dataInicio?: string;
        dataFim?: string;
    };
}

export default function AulasTable({
    onStatsUpdate,
    externalSearchTerm = "",
    externalFilters = {}
}: AulasTableProps) {
    const navigate = useNavigate();
    const [aulas, setAulas] = useState<Aula[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState(externalSearchTerm);
    const [filterStatus, setFilterStatus] = useState<string>(externalFilters.status || "");
    const [filterProfessor, setFilterProfessor] = useState<string>(externalFilters.professor || "");
    const [filterDisciplina, setFilterDisciplina] = useState<string>(externalFilters.disciplina || "");
    const [filterDataInicio, setFilterDataInicio] = useState<string>(externalFilters.dataInicio || "");
    const [filterDataFim, setFilterDataFim] = useState<string>(externalFilters.dataFim || "");
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalCount, setTotalCount] = useState(0);
    const [professores, setProfessores] = useState<any[]>([]);
    const [disciplinas, setDisciplinas] = useState<any[]>([]);
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
        if (externalFilters.professor !== undefined) {
            setFilterProfessor(externalFilters.professor);
        }
        if (externalFilters.disciplina !== undefined) {
            setFilterDisciplina(externalFilters.disciplina);
        }
        if (externalFilters.dataInicio !== undefined) {
            setFilterDataInicio(externalFilters.dataInicio);
        }
        if (externalFilters.dataFim !== undefined) {
            setFilterDataFim(externalFilters.dataFim);
        }
    }, [externalFilters]);

    // Buscar aulas
    const fetchAulas = useCallback(async () => {
        try {
            setLoading(true);

            let query = supabase
                .from("Aulas")
                .select(`
                    *,
                    Professores:Professor_ID (
                        Professor_ID,
                        Usuarios:Usuario_ID (
                            Nome
                        )
                    ),
                    Disciplinas:Disciplina_ID (
                        Nome
                    ),
                    Aulas_Alunos (
                        Aluno_ID
                    )
                `, { count: 'exact' });

            // Aplicar filtros
            if (searchTerm) {
                query = query.or(`Descricao.ilike.%${searchTerm}%,Link_reuniao.ilike.%${searchTerm}%`);
            }

            if (filterStatus) {
                query = query.eq("Status", filterStatus);
            }

            if (filterProfessor) {
                query = query.eq("Professor_ID", filterProfessor);
            }

            if (filterDisciplina) {
                query = query.eq("Disciplina_ID", filterDisciplina);
            }

            if (filterDataInicio) {
                query = query.gte("Data_hora_inicio", `${filterDataInicio}T00:00:00`);
            }

            if (filterDataFim) {
                query = query.lte("Data_hora_inicio", `${filterDataFim}T23:59:59`);
            }

            // Paginação
            const from = (currentPage - 1) * itemsPerPage;
            const to = from + itemsPerPage - 1;

            query = query
                .order("Data_hora_inicio", { ascending: false })
                .range(from, to);

            const { data, error, count } = await query;

            if (error) throw error;

            const aulasData = data || [];
            setAulas(aulasData);
            setTotalCount(count || 0);
            setTotalPages(Math.ceil((count || 0) / itemsPerPage));

            // Buscar professores e disciplinas para os filtros e notificar componente pai
            const fetchProfessoresEDisciplinas = async () => {
                try {
                    // Buscar professores
                    const { data: profData, error: profError } = await supabase
                        .from("Professores")
                        .select(`
                            Professor_ID,
                            Usuarios:Usuario_ID (
                                Nome
                            )
                        `)
                        .order("Professor_ID");

                    if (profError) throw profError;
                    
                    const professoresData = profData || [];
                    setProfessores(professoresData);

                    // Buscar disciplinas
                    const { data: discData, error: discError } = await supabase
                        .from("Disciplinas")
                        .select("Disciplina_ID, Nome")
                        .order("Nome");

                    if (discError) throw discError;
                    
                    const disciplinasData = discData || [];
                    setDisciplinas(disciplinasData);

                    // Calcular estatísticas
                    const aulasAgendadas = aulasData.filter(a => a.Status === "agendada").length;
                    const aulasRealizadas = aulasData.filter(a => a.Status === "realizada").length;
                    const aulasCanceladas = aulasData.filter(a => a.Status === "cancelada").length;

                    const professoresUnicos = [...new Set(aulasData
                        .map(a => a.Professores?.Professor_ID)
                        .filter(Boolean))].length;

                    const disciplinasUnicas = [...new Set(aulasData
                        .map(a => a.Disciplinas?.Nome)
                        .filter(Boolean))].length;

                    // Notificar componente pai
                    if (onStatsUpdate) {
                        onStatsUpdate({
                            totalAulas: count || 0,
                            aulasAgendadas,
                            aulasRealizadas,
                            aulasCanceladas,
                            professoresCount: professoresUnicos,
                            disciplinasCount: disciplinasUnicas,
                            professores: professoresData,
                            disciplinas: disciplinasData
                        });
                    }
                } catch (err) {
                    console.error("Erro ao buscar professores/disciplinas:", err);
                }
            };

            fetchProfessoresEDisciplinas();
        } catch (err: any) {
            console.error("Erro ao buscar aulas:", err);
            toast.error("Erro ao carregar aulas. Tente novamente.");
        } finally {
            setLoading(false);
        }
    }, [searchTerm, filterStatus, filterProfessor, filterDisciplina, filterDataInicio, filterDataFim, currentPage, onStatsUpdate]);

    useEffect(() => {
        fetchAulas();
    }, [fetchAulas]);

    // Formatar data e hora
    const formatDateTime = (dateTimeString: string | null) => {
        if (!dateTimeString) return "-";
        try {
            const date = new Date(dateTimeString);
            return date.toLocaleDateString("pt-BR", {
                day: "2-digit",
                month: "short",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit"
            });
        } catch (err) {
            return "-";
        }
    };

    // Formatar apenas data
    const formatDate = (dateString: string | null) => {
        if (!dateString) return "-";
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString("pt-BR");
        } catch (err) {
            return "-";
        }
    };

    // Formatar apenas hora
    const formatTime = (dateTimeString: string | null) => {
        if (!dateTimeString) return "-";
        try {
            const date = new Date(dateTimeString);
            return date.toLocaleTimeString("pt-BR", {
                hour: "2-digit",
                minute: "2-digit"
            });
        } catch (err) {
            return "-";
        }
    };

    // Determinar cor do status
    const getStatusColor = (status: string | null) => {
        switch (status) {
            case "agendada":
                return { color: "#d97706", bgColor: "#fef3c7", icon: "🟡", label: "Agendada" };
            case "em_andamento":
                return { color: "#0ea5e9", bgColor: "#e0f2fe", icon: "🔵", label: "Em Andamento" };
            case "realizada":
                return { color: "#059669", bgColor: "#d1fae5", icon: "🟢", label: "Realizada" };
            case "cancelada":
                return { color: "#dc2626", bgColor: "#fee2e2", icon: "🔴", label: "Cancelada" };
            case "adiada":
                return { color: "#7c3aed", bgColor: "#ede9fe", icon: "🟣", label: "Adiada" };
            default:
                return { color: "#6b7280", bgColor: "#f3f4f6", icon: "⚪", label: "Indefinido" };
        }
    };

    // Calcular duração da aula
    const calcularDuracao = (inicio: string | null, fim: string | null) => {
        if (!inicio || !fim) return "-";

        try {
            const inicioDate = new Date(inicio);
            const fimDate = new Date(fim);
            const diffMs = fimDate.getTime() - inicioDate.getTime();
            const diffMinutos = Math.floor(diffMs / (1000 * 60));

            if (diffMinutos < 60) return `${diffMinutos} min`;
            const horas = Math.floor(diffMinutos / 60);
            const minutos = diffMinutos % 60;
            return `${horas}h${minutos > 0 ? ` ${minutos}min` : ''}`;
        } catch (err) {
            return "-";
        }
    };

    // Verificar se aula está próxima (nos próximos 30 minutos)
    const isAulaProxima = (dataHora: string | null) => {
        if (!dataHora) return false;
        try {
            const agora = new Date();
            const aulaDate = new Date(dataHora);
            const diffMs = aulaDate.getTime() - agora.getTime();
            return diffMs > 0 && diffMs <= 30 * 60 * 1000; // Próximos 30 minutos
        } catch (err) {
            return false;
        }
    };

    // Verificar se aula está atrasada
    const isAulaAtrasada = (dataHora: string | null, status: string | null) => {
        if (!dataHora || status !== "agendada") return false;
        try {
            const agora = new Date();
            const aulaDate = new Date(dataHora);
            return aulaDate < agora;
        } catch (err) {
            return false;
        }
    };

    // Contar alunos na aula
    const contarAlunos = (alunos?: Array<any>) => {
        return alunos?.length || 0;
    };

    // Handle delete
    const handleDelete = async (id: number, descricao: string | null) => {
        const desc = descricao || "Aula";
        if (!window.confirm(`Tem certeza que deseja excluir esta aula?`)) {
            return;
        }

        try {
            const { error } = await supabase
                .from("Aulas")
                .delete()
                .eq("Aula_ID", id);

            if (error) throw error;

            toast.success("Aula excluída com sucesso!");
            fetchAulas(); // Recarregar a lista
        } catch (err: any) {
            console.error("Erro ao excluir aula:", err);
            toast.error("Erro ao excluir aula: " + err.message);
        }
    };

    // Exportar dados
    const exportData = () => {
        const dataToExport = aulas.map(aula => {
            const status = getStatusColor(aula.Status);
            return {
                ID: aula.Aula_ID,
                Data: formatDate(aula.Data_hora_inicio),
                Horário: `${formatTime(aula.Data_hora_inicio)} - ${formatTime(aula.Data_hora_fim)}`,
                Duração: calcularDuracao(aula.Data_hora_inicio, aula.Data_hora_fim),
                Professor: aula.Professores?.Usuarios?.Nome || "Não definido",
                Disciplina: aula.Disciplinas?.Nome || "Não definida",
                Status: status.label,
                Alunos: contarAlunos(aula.Aulas_Alunos),
                Descrição: aula.Descricao?.substring(0, 50) + (aula.Descricao?.length > 50 ? "..." : ""),
                Link: aula.Link_reuniao || "Não informado"
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
        a.download = `aulas_${new Date().toISOString().split('T')[0]}.csv`;
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
                {loading && aulas.length === 0 ? (
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
                        <p style={{ marginTop: "16px", color: "#6b7280" }}>Carregando aulas...</p>
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
                                {aulas.length} de {totalCount} aulas
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
                                minWidth: "1200px"
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
                                        }}>Data/Horário</th>
                                        <th style={{
                                            padding: "16px 12px",
                                            textAlign: "left",
                                            fontSize: "12px",
                                            fontWeight: "600",
                                            color: "#6b7280",
                                            textTransform: "uppercase",
                                            letterSpacing: "0.05em"
                                        }}>Disciplina</th>
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
                                        }}>Duração</th>
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
                                        }}>Link</th>
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
                                    {aulas.length === 0 ? (
                                        <tr>
                                            <td colSpan={8} style={{
                                                padding: "48px 24px",
                                                textAlign: "center",
                                                color: "#9ca3af",
                                                fontSize: "14px"
                                            }}>
                                                {searchTerm || filterStatus || filterProfessor || filterDisciplina || filterDataInicio || filterDataFim
                                                    ? "Nenhuma aula encontrada com os filtros aplicados."
                                                    : "Nenhuma aula agendada."}
                                            </td>
                                        </tr>
                                    ) : (
                                        aulas.map((aula) => {
                                            const status = getStatusColor(aula.Status);
                                            const totalAlunos = contarAlunos(aula.Aulas_Alunos);
                                            const aulaProxima = isAulaProxima(aula.Data_hora_inicio);
                                            const aulaAtrasada = isAulaAtrasada(aula.Data_hora_inicio, aula.Status);

                                            return (
                                                <tr
                                                    key={aula.Aula_ID}
                                                    style={{
                                                        borderBottom: "1px solid #f3f4f6",
                                                        backgroundColor: aulaProxima ? "#f0f9ff" :
                                                            aulaAtrasada ? "#fef2f2" : "transparent",
                                                        transition: "background-color 0.2s"
                                                    }}
                                                    onMouseEnter={(e) => {
                                                        e.currentTarget.style.backgroundColor = aulaProxima ? "#e0f2fe" :
                                                            aulaAtrasada ? "#fee2e2" : "#f9fafb";
                                                    }}
                                                    onMouseLeave={(e) => {
                                                        e.currentTarget.style.backgroundColor = aulaProxima ? "#f0f9ff" :
                                                            aulaAtrasada ? "#fef2f2" : "transparent";
                                                    }}
                                                >
                                                    <td style={{ padding: "16px 12px" }}>
                                                        <div style={{ fontWeight: "600", color: "#1f2937", marginBottom: "4px" }}>
                                                            {formatDate(aula.Data_hora_inicio)}
                                                        </div>
                                                        <div style={{
                                                            fontSize: "12px",
                                                            color: "#6b7280",
                                                            marginBottom: "4px"
                                                        }}>
                                                            {formatTime(aula.Data_hora_inicio)} - {formatTime(aula.Data_hora_fim)}
                                                        </div>
                                                        <div style={{
                                                            fontSize: "11px",
                                                            color: "#9ca3af"
                                                        }}>
                                                            ID: #{aula.Aula_ID.toString().padStart(3, '0')}
                                                        </div>
                                                        {aulaProxima && (
                                                            <div style={{
                                                                display: "inline-flex",
                                                                alignItems: "center",
                                                                padding: "4px 8px",
                                                                borderRadius: "12px",
                                                                fontSize: "11px",
                                                                fontWeight: "600",
                                                                backgroundColor: "#0ea5e9",
                                                                color: "white",
                                                                marginTop: "6px"
                                                            }}>
                                                                ⏰ Próxima
                                                            </div>
                                                        )}
                                                        {aulaAtrasada && (
                                                            <div style={{
                                                                display: "inline-flex",
                                                                alignItems: "center",
                                                                padding: "4px 8px",
                                                                borderRadius: "12px",
                                                                fontSize: "11px",
                                                                fontWeight: "600",
                                                                backgroundColor: "#dc2626",
                                                                color: "white",
                                                                marginTop: "6px"
                                                            }}>
                                                                ⚠️ Atrasada
                                                            </div>
                                                        )}
                                                    </td>

                                                    <td style={{ padding: "16px 12px" }}>
                                                        <div style={{ fontWeight: "500", color: "#1f2937", marginBottom: "4px" }}>
                                                            {aula.Disciplinas?.Nome || "Sem disciplina"}
                                                        </div>
                                                        {aula.Descricao && (
                                                            <div style={{
                                                                fontSize: "12px",
                                                                color: "#6b7280",
                                                                maxWidth: "200px",
                                                                whiteSpace: "nowrap",
                                                                overflow: "hidden",
                                                                textOverflow: "ellipsis"
                                                            }}>
                                                                {aula.Descricao}
                                                            </div>
                                                        )}
                                                    </td>

                                                    <td style={{ padding: "16px 12px" }}>
                                                        <div style={{ fontWeight: "500", color: "#1f2937" }}>
                                                            {aula.Professores?.Usuarios?.Nome || "Não definido"}
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
                                                            backgroundColor: "#f3f4f6",
                                                            color: "#374151"
                                                        }}>
                                                            <span style={{ marginRight: "4px" }}>⏱️</span>
                                                            {calcularDuracao(aula.Data_hora_inicio, aula.Data_hora_fim)}
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
                                                            <span style={{ marginRight: "6px" }}>
                                                                {status.icon}
                                                            </span>
                                                            {status.label}
                                                        </span>
                                                    </td>

                                                    <td style={{ padding: "16px 12px" }}>
                                                        {aula.Link_reuniao ? (
                                                            <a
                                                                href={aula.Link_reuniao}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                style={{
                                                                    display: "inline-flex",
                                                                    alignItems: "center",
                                                                    padding: "6px 12px",
                                                                    borderRadius: "6px",
                                                                    backgroundColor: "#10b981",
                                                                    color: "white",
                                                                    textDecoration: "none",
                                                                    fontSize: "12px",
                                                                    fontWeight: "500",
                                                                    transition: "all 0.2s"
                                                                }}
                                                                onMouseEnter={(e) => {
                                                                    e.currentTarget.style.backgroundColor = "#059669";
                                                                }}
                                                                onMouseLeave={(e) => {
                                                                    e.currentTarget.style.backgroundColor = "#10b981";
                                                                }}
                                                            >
                                                                <span style={{ marginRight: "6px" }}>🔗</span>
                                                                Entrar
                                                            </a>
                                                        ) : (
                                                            <span style={{
                                                                fontSize: "12px",
                                                                color: "#9ca3af",
                                                                fontStyle: "italic"
                                                            }}>
                                                                Sem link
                                                            </span>
                                                        )}
                                                    </td>

                                                    <td style={{ padding: "16px 12px" }}>
                                                        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                                                            {aula.Status === "agendada" && aula.Link_reuniao && (
                                                                <button
                                                                    onClick={() => window.open(aula.Link_reuniao!, "_blank")}
                                                                    style={{
                                                                        padding: "8px 12px",
                                                                        borderRadius: "6px",
                                                                        border: "none",
                                                                        backgroundColor: "#10b981",
                                                                        color: "white",
                                                                        cursor: "pointer",
                                                                        fontSize: "12px",
                                                                        display: "flex",
                                                                        alignItems: "center",
                                                                        gap: "6px",
                                                                        transition: "all 0.2s",
                                                                        fontWeight: "500"
                                                                    }}
                                                                    onMouseEnter={(e) => {
                                                                        e.currentTarget.style.backgroundColor = "#059669";
                                                                    }}
                                                                    onMouseLeave={(e) => {
                                                                        e.currentTarget.style.backgroundColor = "#10b981";
                                                                    }}
                                                                >
                                                                    <span style={{ fontSize: "14px" }}>🎥</span>
                                                                    Iniciar
                                                                </button>
                                                            )}

                                                            <button
                                                                onClick={() => navigate(`/aulas/${aula.Aula_ID}/editar`)}
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
                                                                onClick={() => handleDelete(aula.Aula_ID, aula.Descricao)}
                                                                style={{
                                                                    padding: "8px 12px",
                                                                    borderRadius: "6px",
                                                                    border: "1px solid #fecaca",
                                                                    backgroundColor: "#fef2f2",
                                                                    cursor: "pointer",
                                                                    fontSize: "12px",
                                                                    display: "flex",
                                                                    alignItems: "center",
                                                                    gap: "6px",
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
                                                                <span style={{ fontSize: "14px" }}>🗑️</span>
                                                                Excluir
                                                            </button>
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
                        {aulas.length > 0 && totalPages > 1 && (
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