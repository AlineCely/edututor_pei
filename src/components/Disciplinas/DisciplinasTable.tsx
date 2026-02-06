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
    Plataforma_ID?: number;
}

export default function DisciplinasTable() {
    const navigate = useNavigate();
    const [disciplinas, setDisciplinas] = useState<Disciplina[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [filterStatus, setFilterStatus] = useState<string>("");
    const [filterCategoria, setFilterCategoria] = useState<string>("");
    const [searchTerm, setSearchTerm] = useState<string>("");
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const itemsPerPage = 10;

    // Buscar disciplinas
    useEffect(() => {
        fetchDisciplinas();
    }, [filterStatus, filterCategoria, searchTerm, currentPage]);

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
            setTotalPages(Math.ceil((count || 0) / itemsPerPage));
            setError(null);
        } catch (err: any) {
            console.error("Erro ao buscar disciplinas:", err);
            setError("Erro ao carregar disciplinas. Tente novamente.");
        } finally {
            setLoading(false);
        }
    }

    // Buscar categorias únicas para o filtro
    const [categorias, setCategorias] = useState<string[]>([]);

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

            const uniqueCategorias = [...new Set(data.map(item => item.Categoria).filter(Boolean))];
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
            <div style={{ display: "flex", gap: "12px", marginBottom: "16px", }}>
                <select style={{ padding: "8px", borderRadius: "6px", border: "1px solid #ccc", backgroundColor: "#f9f9f9", color: "#555" }}>
                    <option>Status</option>
                    <option>Ativo</option>
                    <option>Inativo</option>
                </select>
            </div>

            <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                    <tr style={{ borderBottom: "1px solid #eee", textAlign: "left" }}>
                        <th>Nome da Disciplina</th>
                        <th>Descrição</th>
                        <th>Ativo</th>
                        <th>Cadastrado em</th>
                        <th>Ação</th>
                    </tr>
                </thead>

                <tbody>
                    {disciplinas.map((d, index) => (
                        <tr key={index} style={{ borderBottom: "1px solid #f1f1f1" }}>
                            <td style={{ padding: "12px" }}>{d.Nome}</td>
                            <td>{d.Descricao}</td>
                            <td>
                                <span
                                    style={{
                                        color: d.Status ? "#16a34a" : "#dc2626",
                                        fontWeight: 500
                                    }}
                                >
                                    {d.Status ? "Ativo" : "Inativo"}
                                </span>
                            </td>
                            <td>{d.created_at}</td>
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
                            </div>
                        </tr>
                    ))}
                </tbody>
            </table>

            <Pagination />
        </div>
    );
}
