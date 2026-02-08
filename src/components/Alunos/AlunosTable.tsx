import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabase";
import Pagination from "../Table/Pagination";
import AlunosHeader from "./AlunosHeader";
import { toast } from "react-hot-toast";

interface Aluno {
    Aluno_ID: number;
    Nome: string | null;
    Data_nascimento: string | null;
    Serie: string | null;
    Status: string | null;
    created_at: string;
    // Relacionamentos
    Escolas?: {
        Nome: string;
    };
    Familias?: {
        Nome_responsavel: string;
        Telefone: string;
    };
}

export default function AlunosTable() {
    const navigate = useNavigate();
    const [alunos, setAlunos] = useState<Aluno[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [filterStatus, setFilterStatus] = useState<string>("");
    const [filterEscola, setFilterEscola] = useState<string>("");
    const [filterCID, setFilterCID] = useState<string>("");
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalCount, setTotalCount] = useState(0);
    const [escolas, setEscolas] = useState<any[]>([]);
    const itemsPerPage = 10;

    // Buscar alunos e escolas
    useEffect(() => {
        fetchAlunos();
        fetchEscolas();
    }, [searchTerm, filterStatus, filterEscola, filterCID, currentPage]);

    async function fetchAlunos() {
        try {
            setLoading(true);

            let query = supabase
                .from("Alunos")
                .select(`
          *,
          Escolas (
            Nome
          ),
          Familias (
            Nome_responsavel,
            Telefone
          )
        `, { count: 'exact' });

            // Aplicar filtros
            if (filterStatus) {
                query = query.eq("Status", filterStatus);
            }

            if (filterEscola) {
                query = query.eq("Escola_ID", filterEscola);
            }

            // Filtro por CID (se tiver essa coluna na tabela)
            // if (filterCID) {
            //   query = query.eq("CID", filterCID);
            // }

            if (searchTerm) {
                query = query.or(`
          Nome.ilike.%${searchTerm}%,
          Serie.ilike.%${searchTerm}%,
          Escolas.Nome.ilike.%${searchTerm}%,
          Familias.Nome_responsavel.ilike.%${searchTerm}%
        `);
            }

            // Paginação
            const from = (currentPage - 1) * itemsPerPage;
            const to = from + itemsPerPage - 1;

            // query = query
            //     .order("created_at", { ascending: false })
            //     .range(from, to);

            const { data, error, count } = await query;

            if (error) throw error;

            setAlunos(data || []);
            setTotalCount(count || 0);
            setTotalPages(Math.ceil((count || 0) / itemsPerPage));
            setError(null);
        } catch (err: any) {
            console.error("Erro ao buscar alunos:", err);
            setError("Erro ao carregar alunos. Tente novamente.");
        } finally {
            setLoading(false);
        }
    }

    async function fetchEscolas() {
        try {
            const { data, error } = await supabase
                .from("Escolas")
                .select("Escola_ID, Nome")
                .order("Nome");

            if (error) throw error;
            setEscolas(data || []);
        } catch (err) {
            console.error("Erro ao buscar escolas:", err);
        }
    }

    // Calcular estatísticas
    const alunosAtivos = alunos.filter(a => a.Status === "Ativo").length;

    const alunosPorEscola = alunos.reduce((acc, aluno) => {
        const escolaNome = aluno.Escolas?.Nome || "Sem escola";
        acc[escolaNome] = (acc[escolaNome] || 0) + 1;
        return acc;
    }, {} as { [key: string]: number });

    // Calcular idade
    const calcularIdade = (dataNascimento: string | null) => {
        if (!dataNascimento) return "-";
        const nascimento = new Date(dataNascimento);
        const hoje = new Date();
        let idade = hoje.getFullYear() - nascimento.getFullYear();
        const mesDiff = hoje.getMonth() - nascimento.getMonth();

        if (mesDiff < 0 || (mesDiff === 0 && hoje.getDate() < nascimento.getDate())) {
            idade--;
        }

        return `${idade} anos`;
    };

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

    // Formatar telefone
    const formatTelefone = (telefone: string) => {
        if (!telefone) return "-";
        const numbers = telefone.replace(/\D/g, '');
        if (numbers.length <= 10) {
            return numbers
                .replace(/^(\d{2})(\d)/, '($1) $2')
                .replace(/(\d{4})(\d)/, '$1-$2');
        } else {
            return numbers
                .replace(/^(\d{2})(\d)/, '($1) $2')
                .replace(/(\d{5})(\d)/, '$1-$2');
        }
    };

    // Handle delete
    const handleDelete = async (id: number, nome: string) => {
        if (!window.confirm(`Tem certeza que deseja excluir o aluno "${nome}"?`)) {
            return;
        }

        try {
            const { error } = await supabase
                .from("Alunos")
                .delete()
                .eq("Aluno_ID", id);

            if (error) throw error;

            toast.success("Aluno excluído com sucesso!");
            fetchAlunos(); // Recarregar a lista
        } catch (err: any) {
            console.error("Erro ao excluir aluno:", err);
            toast.error("Erro ao excluir aluno: " + err.message);
        }
    };

    // Handle search
    const handleSearch = (term: string) => {
        setSearchTerm(term);
        setCurrentPage(1);
    };

    // Handle filter change
    const handleFilterChange = (filter: { status?: string; escola?: string; cid?: string }) => {
        if (filter.status !== undefined) setFilterStatus(filter.status);
        if (filter.escola !== undefined) setFilterEscola(filter.escola);
        if (filter.cid !== undefined) setFilterCID(filter.cid);
        setCurrentPage(1);
    };

    // Exportar dados
    const exportData = () => {
        const dataToExport = alunos.map(aluno => ({
            ID: aluno.Aluno_ID,
            Nome: aluno.Nome,
            Idade: calcularIdade(aluno.Data_nascimento),
            Série: aluno.Serie,
            Status: aluno.Status,
            Escola: aluno.Escolas?.Nome || "-",
            Responsável: aluno.Familias?.Nome_responsavel || "-",
            Telefone: aluno.Familias?.Telefone || "-",
            "Data Cadastro": formatDate(aluno.created_at)
        }));

        const csvContent = [
            Object.keys(dataToExport[0] || {}).join(","),
            ...dataToExport.map(row => Object.values(row).join(","))
        ].join("\n");

        const blob = new Blob([csvContent], { type: "text/csv" });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `alunos_${new Date().toISOString().split('T')[0]}.csv`;
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
                {loading && alunos.length === 0 ? (
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
                        <p style={{ marginTop: "16px", color: "#6b7280" }}>Carregando alunos...</p>
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
                                {alunos.length} de {totalCount} alunos
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
                                        }}>Aluno</th>
                                        <th style={{
                                            padding: "16px 12px",
                                            textAlign: "left",
                                            fontSize: "12px",
                                            fontWeight: "600",
                                            color: "#6b7280",
                                            textTransform: "uppercase",
                                            letterSpacing: "0.05em"
                                        }}>Idade</th>
                                        <th style={{
                                            padding: "16px 12px",
                                            textAlign: "left",
                                            fontSize: "12px",
                                            fontWeight: "600",
                                            color: "#6b7280",
                                            textTransform: "uppercase",
                                            letterSpacing: "0.05em"
                                        }}>Série/Ano</th>
                                        <th style={{
                                            padding: "16px 12px",
                                            textAlign: "left",
                                            fontSize: "12px",
                                            fontWeight: "600",
                                            color: "#6b7280",
                                            textTransform: "uppercase",
                                            letterSpacing: "0.05em"
                                        }}>Escola</th>
                                        <th style={{
                                            padding: "16px 12px",
                                            textAlign: "left",
                                            fontSize: "12px",
                                            fontWeight: "600",
                                            color: "#6b7280",
                                            textTransform: "uppercase",
                                            letterSpacing: "0.05em"
                                        }}>Responsável</th>
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
                                    {alunos.length === 0 ? (
                                        <tr>
                                            <td colSpan={8} style={{
                                                padding: "48px 24px",
                                                textAlign: "center",
                                                color: "#9ca3af",
                                                fontSize: "14px"
                                            }}>
                                                {searchTerm || filterStatus || filterEscola || filterCID
                                                    ? "Nenhum aluno encontrado com os filtros aplicados."
                                                    : "Nenhum aluno cadastrado."}
                                            </td>
                                        </tr>
                                    ) : (
                                        alunos.map((aluno) => (
                                            <tr
                                                key={aluno.Aluno_ID}
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
                                                        {aluno.Nome || "Sem nome"}
                                                    </div>
                                                    <div style={{
                                                        fontSize: "12px",
                                                        color: "#6b7280"
                                                    }}>
                                                        ID: #{aluno.Aluno_ID.toString().padStart(3, '0')}
                                                    </div>
                                                </td>

                                                <td style={{
                                                    padding: "16px 12px",
                                                    fontSize: "14px",
                                                    color: "#374151"
                                                }}>
                                                    {calcularIdade(aluno.Data_nascimento)}
                                                </td>

                                                <td style={{
                                                    padding: "16px 12px",
                                                    fontSize: "14px",
                                                    color: "#374151"
                                                }}>
                                                    {aluno.Serie || "-"}
                                                </td>

                                                <td style={{ padding: "16px 12px" }}>
                                                    <div style={{ fontWeight: "500", color: "#1f2937" }}>
                                                        {aluno.Escolas?.Nome || "Sem escola"}
                                                    </div>
                                                </td>

                                                <td style={{ padding: "16px 12px" }}>
                                                    <div style={{ marginBottom: "4px" }}>
                                                        <div style={{ fontWeight: "500", color: "#1f2937" }}>
                                                            {aluno.Familias?.Nome_responsavel || "Sem responsável"}
                                                        </div>
                                                    </div>
                                                    <div style={{ fontSize: "12px", color: "#6b7280" }}>
                                                        {formatTelefone(aluno.Familias?.Telefone || "")}
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
                                                            color: aluno.Status === "Ativo" ? "#059669" :
                                                                aluno.Status === "Inativo" ? "#dc2626" : "#d97706",
                                                            backgroundColor: aluno.Status === "Ativo" ? "#d1fae5" :
                                                                aluno.Status === "Inativo" ? "#fee2e2" : "#fef3c7"
                                                        }}
                                                    >
                                                        {aluno.Status === "Ativo" && (
                                                            <span style={{
                                                                width: "6px",
                                                                height: "6px",
                                                                backgroundColor: "#059669",
                                                                borderRadius: "50%",
                                                                marginRight: "6px"
                                                            }}></span>
                                                        )}
                                                        {aluno.Status || "Sem status"}
                                                    </span>
                                                </td>

                                                <td style={{
                                                    padding: "16px 12px",
                                                    fontSize: "14px",
                                                    color: "#6b7280"
                                                }}>
                                                    {formatDate(aluno.created_at)}
                                                </td>

                                                <td style={{ padding: "16px 12px" }}>
                                                    <div style={{ display: "flex", gap: "8px" }}>
                                                        <button
                                                            onClick={() => navigate(`/alunos/${aluno.Aluno_ID}`)}
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
                                                            onClick={() => navigate(`/alunos/${aluno.Aluno_ID}/editar`)}
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
                                                            onClick={() => handleDelete(aluno.Aluno_ID, aluno.Nome || "aluno")}
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
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Paginação */}
                        {alunos.length > 0 && totalPages > 1 && (
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