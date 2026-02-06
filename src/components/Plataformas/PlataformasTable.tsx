import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabase";
import Pagination from "../Table/Pagination";
import { toast } from "react-hot-toast";

interface Plataforma {
    Plataforma_ID: number;
    Nome: string;
    Descricao: string | null;
    Dominio: string | null;
    Status: string;
    Data_criado: string;
    // Estatísticas
    totalUsuarios?: number;
    totalAlunos?: number;
    totalProfessores?: number;
}

export default function PlataformasTable() {
    const navigate = useNavigate();
    const [plataformas, setPlataformas] = useState<Plataforma[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [filterStatus, setFilterStatus] = useState<string>("");
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalCount, setTotalCount] = useState(0);
    const itemsPerPage = 10;

    // Buscar plataformas
    useEffect(() => {
        fetchPlataformas();
    }, [searchTerm, filterStatus, currentPage]);

    async function fetchPlataformas() {
        try {
            setLoading(true);

            let query = supabase
                .from("Plataformas")
                .select("*", { count: 'exact' });

            // Aplicar filtros
            if (filterStatus) {
                query = query.eq("Status", filterStatus);
            }

            if (searchTerm) {
                query = query.or(`
          Nome.ilike.%${searchTerm}%,
          Descricao.ilike.%${searchTerm}%,
          Dominio.ilike.%${searchTerm}%
        `);
            }

            // Paginação
            const from = (currentPage - 1) * itemsPerPage;
            const to = from + itemsPerPage - 1;

            query = query
                .order("Data_criado", { ascending: false })
                .range(from, to);

            const { data, error, count } = await query;

            if (error) throw error;

            // Buscar estatísticas para cada plataforma
            const plataformasComEstatisticas = await Promise.all(
                (data || []).map(async (plataforma) => {
                    try {
                        // Buscar contagem de usuários
                        const { count: usuariosCount } = await supabase
                            .from("Usuarios")
                            .select("*", { count: 'exact', head: true })
                            .eq("Plataforma_ID", plataforma.Plataforma_ID);

                        // Buscar contagem de alunos
                        const { count: alunosCount } = await supabase
                            .from("Alunos")
                            .select("*", { count: 'exact', head: true })
                            .eq("Plataforma_ID", plataforma.Plataforma_ID);

                        // Buscar contagem de professores (através de Usuarios)
                        const { count: professoresCount } = await supabase
                            .from("Usuarios")
                            .select("*", { count: 'exact', head: true })
                            .eq("Plataforma_ID", plataforma.Plataforma_ID)
                            .eq("Tipo", "PROFISSIONAL");

                        return {
                            ...plataforma,
                            totalUsuarios: usuariosCount || 0,
                            totalAlunos: alunosCount || 0,
                            totalProfessores: professoresCount || 0
                        };
                    } catch (err) {
                        console.error(`Erro ao buscar estatísticas da plataforma ${plataforma.Plataforma_ID}:`, err);
                        return {
                            ...plataforma,
                            totalUsuarios: 0,
                            totalAlunos: 0,
                            totalProfessores: 0
                        };
                    }
                })
            );

            setPlataformas(plataformasComEstatisticas);
            setTotalCount(count || 0);
            setTotalPages(Math.ceil((count || 0) / itemsPerPage));
            setError(null);
        } catch (err: any) {
            console.error("Erro ao buscar plataformas:", err);
            setError("Erro ao carregar plataformas. Tente novamente.");
        } finally {
            setLoading(false);
        }
    }

    // Calcular estatísticas
    const plataformasAtivas = plataformas.filter(p => p.Status === "Ativo").length;
    const plataformasInativas = plataformas.filter(p => p.Status === "Inativo").length;
    const dominiosConfigurados = plataformas.filter(p => p.Dominio && p.Dominio.trim() !== "").length;

    // Formatar data
    const formatDate = (dateString: string) => {
        if (!dateString) return "-";
        const date = new Date(dateString);
        return date.toLocaleDateString("pt-BR", {
            day: "2-digit",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit"
        });
    };

    // Formatar domínio
    const formatDominio = (dominio: string | null) => {
        if (!dominio || dominio.trim() === "") return "Não configurado";
        if (!dominio.startsWith("http")) return `https://${dominio}`;
        return dominio;
    };

    // Handle delete
    const handleDelete = async (id: number, nome: string, temUsuarios: boolean) => {
        if (temUsuarios) {
            toast.error("Esta plataforma possui usuários vinculados. Transfira os usuários primeiro.");
            return;
        }

        if (!window.confirm(`Tem certeza que deseja excluir a plataforma "${nome}"? Esta ação não pode ser desfeita.`)) {
            return;
        }

        try {
            const { error } = await supabase
                .from("Plataformas")
                .delete()
                .eq("Plataforma_ID", id);

            if (error) throw error;

            toast.success("Plataforma excluída com sucesso!");
            fetchPlataformas(); // Recarregar a lista
        } catch (err: any) {
            console.error("Erro ao excluir plataforma:", err);
            toast.error("Erro ao excluir plataforma: " + err.message);
        }
    };

    // Handle search
    const handleSearch = (term: string) => {
        setSearchTerm(term);
        setCurrentPage(1);
    };

    // Handle filter change
    const handleFilterChange = (filter: { status?: string }) => {
        if (filter.status !== undefined) setFilterStatus(filter.status);
        setCurrentPage(1);
    };

    // Exportar dados
    const exportData = () => {
        const dataToExport = plataformas.map(plataforma => ({
            ID: plataforma.Plataforma_ID,
            Nome: plataforma.Nome,
            Descrição: plataforma.Descricao || "",
            Domínio: plataforma.Dominio || "",
            Status: plataforma.Status,
            "Total Usuários": plataforma.totalUsuarios || 0,
            "Total Alunos": plataforma.totalAlunos || 0,
            "Total Professores": plataforma.totalProfessores || 0,
            "Data Criação": formatDate(plataforma.Data_criado)
        }));

        const csvContent = [
            Object.keys(dataToExport[0] || {}).join(","),
            ...dataToExport.map(row => Object.values(row).join(","))
        ].join("\n");

        const blob = new Blob([csvContent], { type: "text/csv" });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `plataformas_${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);

        toast.success("Dados exportados com sucesso!");
    };

    return (
        <div>
            {/* Header com estatísticas e filtros */}
            {/* <PlataformasHeader
        totalPlataformas={totalCount}
        plataformasAtivas={plataformasAtivas}
        plataformasInativas={plataformasInativas}
        dominiosConfigurados={dominiosConfigurados}
        onSearch={handleSearch}
        onFilterChange={handleFilterChange}
      /> */}

            {/* Tabela */}
            <div style={{
                background: "#fff",
                borderRadius: "12px",
                overflow: "hidden",
                boxShadow: "0 2px 8px rgba(0,0,0,0.05)"
            }}>
                {/* Loading State */}
                {loading && plataformas.length === 0 ? (
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
                        <p style={{ marginTop: "16px", color: "#6b7280" }}>Carregando plataformas...</p>
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
                                {plataformas.length} de {totalCount} plataformas
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
                                        }}>Plataforma</th>
                                        <th style={{
                                            padding: "16px 12px",
                                            textAlign: "left",
                                            fontSize: "12px",
                                            fontWeight: "600",
                                            color: "#6b7280",
                                            textTransform: "uppercase",
                                            letterSpacing: "0.05em"
                                        }}>Domínio</th>
                                        <th style={{
                                            padding: "16px 12px",
                                            textAlign: "left",
                                            fontSize: "12px",
                                            fontWeight: "600",
                                            color: "#6b7280",
                                            textTransform: "uppercase",
                                            letterSpacing: "0.05em"
                                        }}>Estatísticas</th>
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
                                        }}>Criada em</th>
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
                                    {plataformas.length === 0 ? (
                                        <tr>
                                            <td colSpan={6} style={{
                                                padding: "48px 24px",
                                                textAlign: "center",
                                                color: "#9ca3af",
                                                fontSize: "14px"
                                            }}>
                                                {searchTerm || filterStatus
                                                    ? "Nenhuma plataforma encontrada com os filtros aplicados."
                                                    : "Nenhuma plataforma cadastrada."}
                                            </td>
                                        </tr>
                                    ) : (
                                        plataformas.map((plataforma) => {
                                            const temUsuarios = (plataforma.totalUsuarios || 0) > 0;

                                            return (
                                                <tr
                                                    key={plataforma.Plataforma_ID}
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
                                                            {plataforma.Nome}
                                                        </div>
                                                        <div style={{
                                                            fontSize: "12px",
                                                            color: "#6b7280"
                                                        }}>
                                                            ID: #{plataforma.Plataforma_ID.toString().padStart(3, '0')}
                                                        </div>
                                                        {plataforma.Descricao && (
                                                            <div style={{
                                                                fontSize: "12px",
                                                                color: "#6b7280",
                                                                marginTop: "4px",
                                                                maxWidth: "200px",
                                                                whiteSpace: "nowrap",
                                                                overflow: "hidden",
                                                                textOverflow: "ellipsis"
                                                            }}>
                                                                {plataforma.Descricao}
                                                            </div>
                                                        )}
                                                    </td>

                                                    <td style={{ padding: "16px 12px" }}>
                                                        <div style={{
                                                            display: "flex",
                                                            alignItems: "center",
                                                            gap: "6px",
                                                            color: plataforma.Dominio ? "#1f2937" : "#9ca3af"
                                                        }}>
                                                            <span style={{ fontSize: "14px" }}>🌐</span>
                                                            <div>
                                                                {formatDominio(plataforma.Dominio)}
                                                            </div>
                                                        </div>
                                                    </td>

                                                    <td style={{ padding: "16px 12px" }}>
                                                        <div style={{ display: "flex", gap: "12px" }}>
                                                            <div style={{ textAlign: "center" }}>
                                                                <div style={{ fontSize: "14px", fontWeight: "700", color: "#4F46E5" }}>
                                                                    {plataforma.totalUsuarios || 0}
                                                                </div>
                                                                <div style={{ fontSize: "11px", color: "#6b7280" }}>Usuários</div>
                                                            </div>
                                                            <div style={{ textAlign: "center" }}>
                                                                <div style={{ fontSize: "14px", fontWeight: "700", color: "#059669" }}>
                                                                    {plataforma.totalAlunos || 0}
                                                                </div>
                                                                <div style={{ fontSize: "11px", color: "#6b7280" }}>Alunos</div>
                                                            </div>
                                                            <div style={{ textAlign: "center" }}>
                                                                <div style={{ fontSize: "14px", fontWeight: "700", color: "#0ea5e9" }}>
                                                                    {plataforma.totalProfessores || 0}
                                                                </div>
                                                                <div style={{ fontSize: "11px", color: "#6b7280" }}>Professores</div>
                                                            </div>
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
                                                                color: plataforma.Status === "Ativo" ? "#059669" :
                                                                    plataforma.Status === "Inativo" ? "#dc2626" : "#d97706",
                                                                backgroundColor: plataforma.Status === "Ativo" ? "#d1fae5" :
                                                                    plataforma.Status === "Inativo" ? "#fee2e2" : "#fef3c7"
                                                            }}
                                                        >
                                                            {plataforma.Status === "Ativo" && (
                                                                <span style={{
                                                                    width: "6px",
                                                                    height: "6px",
                                                                    backgroundColor: "#059669",
                                                                    borderRadius: "50%",
                                                                    marginRight: "6px"
                                                                }}></span>
                                                            )}
                                                            {plataforma.Status}
                                                        </span>
                                                    </td>

                                                    <td style={{
                                                        padding: "16px 12px",
                                                        fontSize: "14px",
                                                        color: "#6b7280"
                                                    }}>
                                                        {formatDate(plataforma.Data_criado)}
                                                    </td>

                                                    <td style={{ padding: "16px 12px" }}>
                                                        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                                                            <button
                                                                onClick={() => navigate(`/plataformas/ver/${plataforma.Plataforma_ID}`)}
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
                                                                onClick={() => navigate(`/plataformas/${plataforma.Plataforma_ID}/editar`)}
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
                                                                onClick={() => handleDelete(plataforma.Plataforma_ID, plataforma.Nome, temUsuarios)}
                                                                disabled={temUsuarios}
                                                                style={{
                                                                    padding: "8px 12px",
                                                                    borderRadius: "6px",
                                                                    border: `1px solid ${temUsuarios ? "#f3f4f6" : "#fecaca"}`,
                                                                    backgroundColor: temUsuarios ? "#f9fafb" : "#fef2f2",
                                                                    cursor: temUsuarios ? "not-allowed" : "pointer",
                                                                    fontSize: "12px",
                                                                    display: "flex",
                                                                    alignItems: "center",
                                                                    gap: "6px",
                                                                    transition: "all 0.2s",
                                                                    color: temUsuarios ? "#9ca3af" : "#dc2626",
                                                                    fontWeight: "500"
                                                                }}
                                                                onMouseEnter={(e) => {
                                                                    if (!temUsuarios) {
                                                                        e.currentTarget.style.backgroundColor = "#fee2e2";
                                                                        e.currentTarget.style.borderColor = "#f87171";
                                                                    }
                                                                }}
                                                                onMouseLeave={(e) => {
                                                                    if (!temUsuarios) {
                                                                        e.currentTarget.style.backgroundColor = "#fef2f2";
                                                                        e.currentTarget.style.borderColor = "#fca5a5";
                                                                    }
                                                                }}
                                                            >
                                                                <span style={{ fontSize: "14px" }}>🗑️</span>
                                                                Excluir
                                                            </button>

                                                            {temUsuarios && (
                                                                <button
                                                                    onClick={() => navigate(`/usuarios?plataforma=${plataforma.Plataforma_ID}`)}
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
                                                                    <span style={{ fontSize: "14px" }}>👥</span>
                                                                    Ver Usuários
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
                        {plataformas.length > 0 && totalPages > 1 && (
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
                                //   currentPage={currentPage}
                                //   totalPages={totalPages}
                                //   onPageChange={(page) => setCurrentPage(page)}
                                />
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    )
}