import { useState, useEffect } from "react";
import Pagination from "../Table/Pagination";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabase";

interface Disciplina {
    Disciplina_ID: number;
    Nome: string;
    Descricao: string;
    Categoria: string;
    Status: string;
    created_at?: string;
    Plataforma_ID?: number | null;
    // // Relacionamentos
    // Plataformas?: {
    //     Nome: string;
    // };
    // Turmas_Disciplinas?: Array<{
    //     Turma_ID: number;
    // }>;
}

export default function DisciplinasTable() {
    const navigate = useNavigate();
    const [disciplinas, setDisciplinas] = useState<Disciplina[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [filterStatus, setFilterStatus] = useState<string>("");
    const [filterCategoria, setFilterCategoria] = useState<string>("");
    // const [filterPlataforma, setFilterPlataforma] = useState<string>("");
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalCount, setTotalCount] = useState(0);
    //   const [plataformas, setPlataformas] = useState<any[]>([]);
    const [categorias, setCategorias] = useState<string[]>([]);
    const itemsPerPage = 10;

    // Buscar disciplinas
    useEffect(() => {
        fetchDisciplinas();
        // fetchPlataformas();
    }, [searchTerm, filterStatus, filterCategoria, currentPage]);

    async function fetchDisciplinas() {
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

            setDisciplinas(data || []);
            setTotalCount(count || 0);
            setTotalPages(Math.ceil((count || 0) / itemsPerPage));
            setError(null);
        } catch (err: any) {
            console.error("Erro ao buscar disciplinas:", err);
            setError("Erro ao carregar disciplinas. Tente novamente.");
        } finally {
            setLoading(false);
        }
    }

    // async function fetchPlataformas() {
    //     try {
    //         const { data, error } = await supabase
    //             .from("Plataformas")
    //             .select("Plataforma_ID, Nome")
    //             .order("Nome");

    //         if (error) throw error;
    //         setPlataformas(data || []);
    //     } catch (err) {
    //         console.error("Erro ao buscar plataformas:", err);
    //     }
    // }

    // Buscar categorias únicas para o filtro

    useEffect(() => {
        fetchCategorias();
    }, []);

    async function fetchCategorias() {
        try {
            const { data, error } = await supabase
                .from("Disciplinas")
                .select("Categoria")
                .not("Categoria", "is", null);

            if (error) throw error;

            const uniqueCategorias = [...new Set(data.map(item => item.Categoria).filter(Boolean) || [])];
            setCategorias(uniqueCategorias);
        } catch (err) {
            console.error("Erro ao buscar categorias:", err);
        }
    }

    // Formatar data
    const formatDate = (dateString: string) => {
        if (!dateString) return "-";
        const date = new Date(dateString);
        return date.toLocaleDateString("pt-BR", {
            day: "2-digit",
            month: "short",
            year: "numeric"
        });
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

            // Recarregar a lista
            fetchDisciplinas();
            alert("Disciplina excluída com sucesso!");
        } catch (err: any) {
            console.error("Erro ao excluir disciplina:", err);
            alert("Erro ao excluir disciplina: " + err.message);
        }
    };

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
    };

    if (loading && disciplinas.length === 0) {
        return (
            <div
                style={{
                    background: "#fff",
                    borderRadius: "12px",
                    padding: "40px",
                    textAlign: "center",
                    color: "#333",
                }}
            >
                <p>Carregando disciplinas...</p>
            </div>
        );
    }

    if (error && disciplinas.length === 0) {
        return (
            <div
                style={{
                    background: "#fff",
                    borderRadius: "12px",
                    padding: "40px",
                    textAlign: "center",
                    color: "#333",
                }}
            >
                <p style={{ color: "#dc2626" }}>{error}</p>
                <button
                    onClick={() => fetchDisciplinas()}
                    style={{
                        marginTop: "16px",
                        padding: "8px 16px",
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
        <div
            style={{
                background: "#fff",
                borderRadius: "12px",
                padding: "16px",
                color: "#333",
            }}
        >
            {/* Filtros */}
            <div style={{ display: "flex", gap: "12px", marginBottom: "16px", flexWrap: "wrap" }}>
                <select
                    value={filterStatus}
                    onChange={(e) => {
                        setFilterStatus(e.target.value);
                        setCurrentPage(1);
                    }}
                    style={{ padding: "8px", borderRadius: "6px", border: "1px solid #ccc", backgroundColor: "#f9f9f9", color: "#555" }}>
                    <option>Todos os status</option>
                    <option>Ativo</option>
                    <option>Inativo</option>
                </select>

                <select 
                    value={filterCategoria}
                    onChange={(e) => {
                        setFilterCategoria(e.target.value);
                        setCurrentPage(1);
                    }}
                    style={{ 
                        padding: "8px", 
                        borderRadius: "6px", 
                        border: "1px solid #ccc",
                        backgroundColor: "#f9f9f9", 
                        color: "#555",
                        minWidth: "150px"
                    }}
                >
                    <option value="">Todas categorias</option>
                    {categorias.map((cat) => (
                        <option key={cat} value={cat}>{cat}</option>
                    ))}
                </select>

                <button
                    onClick={() => {
                        setSearchTerm("");
                        setFilterStatus("");
                        setFilterCategoria("");
                        setCurrentPage(1);
                    }}
                    style={{
                        padding: "8px 16px",
                        borderRadius: "6px",
                        border: "1px solid #ccc",
                        backgroundColor: "#f9f9f9",
                        cursor: "pointer",
                        color: "#555"
                    }}
                >
                    Limpar filtros
                </button>
            </div>

            {/* Informações de resultados */}
            <div style={{ 
                marginBottom: "16px", 
                color: "#666",
                fontSize: "14px" 
            }}>
                {totalCount > 0 ? (
                    <p>
                        Mostrando {((currentPage - 1) * itemsPerPage) + 1} a {Math.min(currentPage * itemsPerPage, totalCount)} 
                        de {totalCount} disciplinas
                    </p>
                ) : (
                    <p>Nenhuma disciplina encontrada</p>
                )}
            </div>

            <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                    <tr style={{ borderBottom: "1px solid #eee", textAlign: "left" }}>
                        <th style={{ padding: "12px" }}>Nome da Disciplina</th>
                        <th style={{ padding: "12px" }}>Descrição</th>
                        <th style={{ padding: "12px" }}>Categoria</th>
                        <th style={{ padding: "12px" }}>Status</th>
                        <th style={{ padding: "12px" }}>Cadastrado em</th>
                        <th style={{ padding: "12px" }}>Ações</th>
                    </tr>
                </thead>

                <tbody>
                    {disciplinas.map((d) => (
                        <tr key={d.Disciplina_ID} style={{ borderBottom: "1px solid #f1f1f1" }}>
                            <td style={{ padding: "12px" }}>{d.Nome}</td>
                            <td style={{ padding: "12px" }}>{d.Descricao}</td>
                            <td style={{ padding: "12px" }}>{d.Categoria || "-"}</td>
                            <td style={{ padding: "12px" }}>
                                <span
                                    style={{
                                        color: d.Status === "Ativo" ? "#16a34a" : "#dc2626",
                                        fontWeight: 500
                                    }}
                                >
                                    {d.Status || "Inativo"}
                                </span>
                            </td>
                            <td style={{ padding: "12px" }}>{d.created_at}</td>
                            <td style={{ padding: "12px" }}>
                                <div style={{ display: "flex", gap: "8px" }}>
                                    <button
                                        onClick={() => navigate(`/disciplinas/${d.Disciplina_ID}`)}
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
                                        onClick={() => navigate(`/disciplinas/${d.Disciplina_ID}/editar`)}
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
                                    <button
                                        onClick={() => handleDelete(d.Disciplina_ID, d.Nome)}
                                        style={{
                                            padding: "8px 12px",
                                            borderRadius: "6px",
                                            border: "1px solid #dc2626",
                                            backgroundColor: "white",
                                            cursor: "pointer",
                                            fontSize: "14px",
                                            display: "flex",
                                            alignItems: "center",
                                            gap: "4px",
                                            transition: "all 0.2s",
                                            color: "#dc2626"
                                        }}
                                        onMouseEnter={(e) => {
                                            e.currentTarget.style.backgroundColor = "#fee2e2";
                                            e.currentTarget.style.borderColor = "#b91c1c";
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.backgroundColor = "white";
                                            e.currentTarget.style.borderColor = "#dc2626";
                                        }}
                                    >
                                        🗑️ Excluir
                                    </button>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            <Pagination />
        </div>
    );
}
