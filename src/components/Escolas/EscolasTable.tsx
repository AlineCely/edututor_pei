import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabase";
import Pagination from "../Table/Pagination";
import toast from "react-hot-toast";
// import EscolasHeader from "./EscolasHeader";

interface Escola {
    Escola_ID: number;
    Nome: string;
    CNPJ: string;
    Email: string;
    Telefone: string;
    Endereco: string;
    Status: string;
    created_at?: string;
    Plataforma_ID?: number;
}

interface Props {
    onStatsUpdate?: (stats: {
        totalEscolas: number;
        escolasAtivas: number;
    }) => void;
        externalSearchTerm?: string;
        externalFilters?: { status?: string };
    }

export default function EscolasTable({
        onStatsUpdate,
        externalSearchTerm = "",
        externalFilters = {}
    }: Props) {
    const navigate = useNavigate();
    const [escolas, setEscolas] = useState<Escola[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState(externalSearchTerm);
    const [filterStatus, setFilterStatus] = useState<string>(externalFilters.status || "" );
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalCount, setTotalCount] = useState(0);
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

    // Buscar escolas    
    const fetchEscolas = useCallback( async () => {
        try {
            setLoading(true);
            
            let query = supabase
            .from("Escolas")
            .select("*", { count: 'exact' });
            
            // Aplicar filtros
            if (filterStatus) {
                query = query.eq("Status", filterStatus);
            }

            if (searchTerm) {
                query = query.or(`Nome.ilike.%${searchTerm}%,CNPJ.ilike.%${searchTerm}%,Email.ilike.%${searchTerm}%`);
            }
            
            // Paginação
            const from = (currentPage - 1) * itemsPerPage;
            const to = from + itemsPerPage - 1;
            
            // query = query
            //     .order("created_at", { ascending: false })
            //     .range(from, to);
            
            const { data, error, count } = await query;
            
            if (error) throw error;
            
            const escolasData = data || [];

            setEscolas(escolasData);
            setTotalCount(count || 0);
            setTotalPages(Math.ceil((count || 0) / itemsPerPage));

            // Calcular estatísticas e notificar componente pai
            if (onStatsUpdate) {
                const escolasAtivas = escolasData.filter(e => e.Status === "Ativo").length;
                
                onStatsUpdate({
                    totalEscolas: count || 0,
                    escolasAtivas
                });
            }
        } catch (err: any) {
            console.error("Erro ao buscar escolas:", err);
            toast.error("Erro ao carregar escolas. Tente novamente.");
        } finally {
            setLoading(false);
        }
    }, [searchTerm, filterStatus, currentPage, onStatsUpdate]);
    
    useEffect(() => {
        fetchEscolas();
    }, [fetchEscolas]);

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

    // Formatar CNPJ
    const formatCNPJ = (cnpj: string) => {
        if (!cnpj) return "-";
        return cnpj.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, "$1.$2.$3/$4-$5");
    };

    // Handle delete
    const handleDelete = async (id: number, nome: string) => {
        if (!window.confirm(`Tem certeza que deseja excluir a escola "${nome}"? Esta ação não pode ser desfeita.`)) {
            return;
        }

        try {
            const { error } = await supabase
                .from("Escolas")
                .delete()
                .eq("Escola_ID", id);

            if (error) throw error;
            
            toast.success("Escola excluída com sucesso!");
            fetchEscolas(); // Recarregar a lista
        } catch (err: any) {
            console.error("Erro ao excluir escola:", err);
            alert("Erro ao excluir escola: " + err.message);
        }
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
                {loading && escolas.length === 0 ? (
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
                        <p style={{ marginTop: "16px", color: "#6b7280" }}>Carregando escolas...</p>
                    </div>
                ) : (
                    <>
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
                                            padding: "16px 24px",
                                            textAlign: "left",
                                            fontSize: "12px",
                                            fontWeight: "600",
                                            color: "#6b7280",
                                            textTransform: "uppercase",
                                            letterSpacing: "0.05em"
                                        }}>ID</th>
                                        <th style={{
                                            padding: "16px 24px",
                                            textAlign: "left",
                                            fontSize: "12px",
                                            fontWeight: "600",
                                            color: "#6b7280",
                                            textTransform: "uppercase",
                                            letterSpacing: "0.05em"
                                        }}>Nome da Escola</th>
                                        <th style={{
                                            padding: "16px 24px",
                                            textAlign: "left",
                                            fontSize: "12px",
                                            fontWeight: "600",
                                            color: "#6b7280",
                                            textTransform: "uppercase",
                                            letterSpacing: "0.05em"
                                        }}>CNPJ</th>
                                        <th style={{
                                            padding: "16px 24px",
                                            textAlign: "left",
                                            fontSize: "12px",
                                            fontWeight: "600",
                                            color: "#6b7280",
                                            textTransform: "uppercase",
                                            letterSpacing: "0.05em"
                                        }}>Contato</th>
                                        <th style={{
                                            padding: "16px 24px",
                                            textAlign: "left",
                                            fontSize: "12px",
                                            fontWeight: "600",
                                            color: "#6b7280",
                                            textTransform: "uppercase",
                                            letterSpacing: "0.05em"
                                        }}>Status</th>
                                        <th style={{
                                            padding: "16px 24px",
                                            textAlign: "left",
                                            fontSize: "12px",
                                            fontWeight: "600",
                                            color: "#6b7280",
                                            textTransform: "uppercase",
                                            letterSpacing: "0.05em"
                                        }}>Cadastro</th>
                                        <th style={{
                                            padding: "16px 24px",
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
                                    {escolas.length === 0 ? (
                                        <tr>
                                            <td colSpan={7} style={{
                                                padding: "48px 24px",
                                                textAlign: "center",
                                                color: "#9ca3af",
                                                fontSize: "14px"
                                            }}>
                                                {searchTerm || filterStatus
                                                    ? "Nenhuma escola encontrada com os filtros aplicados."
                                                    : "Nenhuma escola cadastrada."}
                                            </td>
                                        </tr>
                                    ) : (
                                        escolas.map((escola) => (
                                            <tr
                                                key={escola.Escola_ID}
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
                                                <td style={{
                                                    padding: "16px 24px",
                                                    color: "#6b7280",
                                                    fontSize: "14px",
                                                    fontWeight: "500"
                                                }}>
                                                    #{escola.Escola_ID.toString().padStart(3, '0')}
                                                </td>

                                                <td style={{ padding: "16px 24px" }}>
                                                    <div style={{ fontWeight: "600", color: "#1f2937" }}>
                                                        {escola.Nome}
                                                    </div>
                                                    <div style={{
                                                        fontSize: "12px",
                                                        color: "#6b7280",
                                                        marginTop: "4px"
                                                    }}>
                                                        {escola.Endereco ?
                                                            escola.Endereco.split(',')[0] + '...' :
                                                            "Sem endereço"
                                                        }
                                                    </div>
                                                </td>

                                                <td style={{ padding: "16px 24px", fontSize: "14px", color: "#1f2937" }}>
                                                    {formatCNPJ(escola.CNPJ)}
                                                </td>

                                                <td style={{ padding: "16px 24px" }}>
                                                    <div style={{ fontSize: "14px", color: "#1f2937" }}>
                                                        {escola.Email || "-"}
                                                    </div>
                                                    <div style={{
                                                        fontSize: "12px",
                                                        color: "#6b7280",
                                                        marginTop: "4px"
                                                    }}>
                                                        {escola.Telefone || "-"}
                                                    </div>
                                                </td>

                                                <td style={{ padding: "16px 24px" }}>
                                                    <span
                                                        style={{
                                                            display: "inline-flex",
                                                            alignItems: "center",
                                                            padding: "6px 12px",
                                                            borderRadius: "20px",
                                                            fontSize: "12px",
                                                            fontWeight: "600",
                                                            color: escola.Status === "Ativo" ? "#059669" :
                                                                escola.Status === "Inativo" ? "#dc2626" : "#d97706",
                                                            backgroundColor: escola.Status === "Ativo" ? "#d1fae5" :
                                                                escola.Status === "Inativo" ? "#fee2e2" : "#fef3c7"
                                                        }}
                                                    >
                                                        {escola.Status === "Ativo" && (
                                                            <span style={{
                                                                width: "6px",
                                                                height: "6px",
                                                                backgroundColor: "#059669",
                                                                borderRadius: "50%",
                                                                marginRight: "6px"
                                                            }}></span>
                                                        )}
                                                        {escola.Status}
                                                    </span>
                                                </td>

                                                <td style={{
                                                    padding: "16px 24px",
                                                    fontSize: "14px",
                                                    color: "#6b7280"
                                                }}>
                                                    {formatDate(escola.created_at || "")}
                                                </td>

                                                <td style={{ padding: "16px 24px" }}>
                                                    <div style={{ display: "flex", gap: "8px" }}>
                                                        <button
                                                            onClick={() => navigate(`/escolas/ver/${escola.Escola_ID}`)}
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
                                                            onClick={() => navigate(`/escolas/${escola.Escola_ID}/editar`)}
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
                                                            onClick={() => handleDelete(escola.Escola_ID, escola.Nome)}
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
                        {escolas.length > 0 && totalPages > 1 && (
                            <div style={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                                padding: "20px 24px",
                                borderTop: "1px solid #e5e7eb"
                            }}>
                                <div style={{ color: "#6b7280", fontSize: "14px" }}>
                                    Mostrando {escolas.length} de {totalCount} escolas
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