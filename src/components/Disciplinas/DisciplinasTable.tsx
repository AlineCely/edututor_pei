import { useState, useEffect, useCallback } from "react";
import Pagination from "../Table/Pagination";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabase";
import { toast } from "react-hot-toast";

interface Disciplina {
    Disciplina_ID: number;
    Nome: string;
    Descricao: string;
    Categoria: string;
    Status: string;
    created_at?: string;
    Plataforma_ID?: number | null;
}

interface DisciplinasTableProps {
    onStatsUpdate?: (stats: {
        totalDisciplinas: number;
        disciplinasAtivas: number;
        disciplinasInativas: number;
        categoriasCount: number;
        categoriasDisponiveis: string[];
    }) => void;
    externalSearchTerm?: string;
    externalFilters?: { status?: string; categoria?: string };
}

export default function DisciplinasTable({
    onStatsUpdate,
    externalSearchTerm = "",
    externalFilters = {}
}: DisciplinasTableProps) {
    const navigate = useNavigate();
    const [disciplinas, setDisciplinas] = useState<Disciplina[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState(externalSearchTerm);
    const [filterStatus, setFilterStatus] = useState<string>(externalFilters.status || "");
    const [filterCategoria, setFilterCategoria] = useState<string>(externalFilters.categoria || "");
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalCount, setTotalCount] = useState(0);
    const [categorias, setCategorias] = useState<string[]>([]);
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
        if (externalFilters.categoria !== undefined) {
            setFilterCategoria(externalFilters.categoria);
        }
    }, [externalFilters]);

    // Buscar disciplinas
    const fetchDisciplinas = useCallback(async () => {
        try {
            setLoading(true);

            let query = supabase
                .from("Disciplinas")
                .select("*", { count: 'exact' });

            // Aplicar filtros
            if (filterStatus) {
                query = query.eq("Status", filterStatus);
            }

            if (filterCategoria) {
                query = query.eq("Categoria", filterCategoria);
            }

            if (searchTerm) {
                query = query.or(`Nome.ilike.%${searchTerm}%,Descricao.ilike.%${searchTerm}%`);
            }

            // Paginação
            const from = (currentPage - 1) * itemsPerPage;
            const to = from + itemsPerPage - 1;

            query = query
                .order("Nome", { ascending: true })
                .range(from, to);

            const { data, error, count } = await query;

            if (error) throw error;

            const disciplinasData = data || [];
            setDisciplinas(disciplinasData);
            setTotalCount(count || 0);
            setTotalPages(Math.ceil((count || 0) / itemsPerPage));

            // Buscar categorias únicas
            const fetchCategorias = async () => {
                try {
                    const { data: catData, error: catError } = await supabase
                        .from("Disciplinas")
                        .select("Categoria")
                        .not("Categoria", "is", null);

                    if (catError) throw catError;

                    const uniqueCategorias = [...new Set((catData || []).map(item => item.Categoria).filter(Boolean) || [])];
                    setCategorias(uniqueCategorias);

                    // Calcular estatísticas e notificar componente pai
                    if (onStatsUpdate) {
                        const disciplinasAtivas = disciplinasData.filter(d => d.Status === "Ativo" || d.Status === "ativa").length;
                        const disciplinasInativas = disciplinasData.filter(d => d.Status === "Inativo" || d.Status === "inativa").length;
                        
                        onStatsUpdate({
                            totalDisciplinas: count || 0,
                            disciplinasAtivas,
                            disciplinasInativas,
                            categoriasCount: uniqueCategorias.length,
                            categoriasDisponiveis: uniqueCategorias
                        });
                    }
                } catch (err) {
                    console.error("Erro ao buscar categorias:", err);
                }
            };

            fetchCategorias();
        } catch (err: any) {
            console.error("Erro ao buscar disciplinas:", err);
            toast.error("Erro ao carregar disciplinas. Tente novamente.");
        } finally {
            setLoading(false);
        }
    }, [searchTerm, filterStatus, filterCategoria, currentPage, onStatsUpdate]);

    useEffect(() => {
        fetchDisciplinas();
    }, [fetchDisciplinas]);

    // Formatar data
    const formatDate = (dateString: string | undefined) => {
        if (!dateString) return "-";
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString("pt-BR", {
                day: "2-digit",
                month: "short",
                year: "numeric"
            });
        } catch (err) {
            return "-";
        }
    };

    // Handle delete
    const handleDelete = async (id: number, nome: string) => {
        if (!window.confirm(`Tem certeza que deseja excluir a disciplina "${nome}"?`)) {
            return;
        }

        try {
            const { error } = await supabase
                .from("Disciplinas")
                .delete()
                .eq("Disciplina_ID", id);

            if (error) throw error;

            toast.success("Disciplina excluída com sucesso!");
            fetchDisciplinas(); // Recarregar a lista
        } catch (err: any) {
            console.error("Erro ao excluir disciplina:", err);
            toast.error("Erro ao excluir disciplina: " + err.message);
        }
    };

    // Exportar dados
    const exportData = () => {
        const dataToExport = disciplinas.map(d => ({
            ID: d.Disciplina_ID,
            Nome: d.Nome,
            Descricao: d.Descricao,
            Categoria: d.Categoria || "-",
            Status: d.Status || "Inativo",
            "Data Cadastro": formatDate(d.created_at)
        }));

        const csvContent = [
            Object.keys(dataToExport[0] || {}).join(","),
            ...dataToExport.map(row => Object.values(row).join(","))
        ].join("\n");

        const blob = new Blob([csvContent], { type: "text/csv" });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `disciplinas_${new Date().toISOString().split('T')[0]}.csv`;
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
                {loading && disciplinas.length === 0 ? (
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
                        <p style={{ marginTop: "16px", color: "#6b7280" }}>Carregando disciplinas...</p>
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
                                {disciplinas.length} de {totalCount} disciplinas
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
                            <table style={{ width: "100%", borderCollapse: "collapse" }}>
                                <thead>
                                    <tr style={{ borderBottom: "1px solid #eee", textAlign: "left" }}>
                                        <th style={{ 
                                            padding: "16px 12px",
                                            fontSize: "12px",
                                            fontWeight: "600",
                                            color: "#6b7280",
                                            textTransform: "uppercase",
                                            letterSpacing: "0.05em"
                                        }}>Nome da Disciplina</th>
                                        <th style={{ 
                                            padding: "16px 12px",
                                            fontSize: "12px",
                                            fontWeight: "600",
                                            color: "#6b7280",
                                            textTransform: "uppercase",
                                            letterSpacing: "0.05em"
                                        }}>Descrição</th>
                                        <th style={{ 
                                            padding: "16px 12px",
                                            fontSize: "12px",
                                            fontWeight: "600",
                                            color: "#6b7280",
                                            textTransform: "uppercase",
                                            letterSpacing: "0.05em"
                                        }}>Categoria</th>
                                        <th style={{ 
                                            padding: "16px 12px",
                                            fontSize: "12px",
                                            fontWeight: "600",
                                            color: "#6b7280",
                                            textTransform: "uppercase",
                                            letterSpacing: "0.05em"
                                        }}>Status</th>
                                        <th style={{ 
                                            padding: "16px 12px",
                                            fontSize: "12px",
                                            fontWeight: "600",
                                            color: "#6b7280",
                                            textTransform: "uppercase",
                                            letterSpacing: "0.05em"
                                        }}>Cadastrado em</th>
                                        <th style={{ 
                                            padding: "16px 12px",
                                            fontSize: "12px",
                                            fontWeight: "600",
                                            color: "#6b7280",
                                            textTransform: "uppercase",
                                            letterSpacing: "0.05em"
                                        }}>Ações</th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {disciplinas.length === 0 ? (
                                        <tr>
                                            <td colSpan={6} style={{ 
                                                padding: "48px 24px", 
                                                textAlign: "center", 
                                                color: "#9ca3af",
                                                fontSize: "14px"
                                            }}>
                                                {searchTerm || filterStatus || filterCategoria
                                                    ? "Nenhuma disciplina encontrada com os filtros aplicados."
                                                    : "Nenhuma disciplina cadastrada."}
                                            </td>
                                        </tr>
                                    ) : (
                                        disciplinas.map((d) => (
                                            <tr key={d.Disciplina_ID} style={{ 
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
                                                        {d.Nome}
                                                    </div>
                                                    <div style={{ 
                                                        fontSize: "12px", 
                                                        color: "#6b7280"
                                                    }}>
                                                        ID: #{d.Disciplina_ID.toString().padStart(3, '0')}
                                                    </div>
                                                </td>
                                                <td style={{ padding: "16px 12px", maxWidth: "300px" }}>
                                                    <div style={{ 
                                                        fontSize: "14px", 
                                                        color: "#374151",
                                                        overflow: "hidden",
                                                        textOverflow: "ellipsis",
                                                        whiteSpace: "nowrap"
                                                    }}>
                                                        {d.Descricao}
                                                    </div>
                                                </td>
                                                <td style={{ padding: "16px 12px" }}>
                                                    <span style={{ 
                                                        display: "inline-flex",
                                                        alignItems: "center",
                                                        padding: "4px 10px",
                                                        borderRadius: "6px",
                                                        fontSize: "12px",
                                                        fontWeight: "500",
                                                        backgroundColor: "#f3f4f6",
                                                        color: "#4b5563"
                                                    }}>
                                                        {d.Categoria || "-"}
                                                    </span>
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
                                                            color: (d.Status === "Ativo" || d.Status === "ativa") ? "#059669" : "#dc2626",
                                                            backgroundColor: (d.Status === "Ativo" || d.Status === "ativa") ? "#d1fae5" : "#fee2e2"
                                                        }}
                                                    >
                                                        {(d.Status === "Ativo" || d.Status === "ativa") && (
                                                            <span style={{ 
                                                                width: "6px", 
                                                                height: "6px", 
                                                                backgroundColor: "#059669",
                                                                borderRadius: "50%",
                                                                marginRight: "6px"
                                                            }}></span>
                                                        )}
                                                        {d.Status || "Inativo"}
                                                    </span>
                                                </td>
                                                <td style={{ padding: "16px 12px", fontSize: "14px", color: "#6b7280" }}>
                                                    {formatDate(d.created_at)}
                                                </td>
                                                <td style={{ padding: "16px 12px" }}>
                                                    <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                                                        <button
                                                            onClick={() => navigate(`/disciplinas/${d.Disciplina_ID}`)}
                                                            style={{
                                                                padding: "8px 12px",
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
                                                            👁️ Ver
                                                        </button>
                                                        <button
                                                            onClick={() => navigate(`/disciplinas/${d.Disciplina_ID}/editar`)}
                                                            style={{
                                                                padding: "8px 12px",
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
                                                            ✏️ Editar
                                                        </button>
                                                        <button
                                                            onClick={() => handleDelete(d.Disciplina_ID, d.Nome)}
                                                            style={{
                                                                padding: "8px 12px",
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
                                                            🗑️ Excluir
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Paginação */}
                        {disciplinas.length > 0 && totalPages > 1 && (
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