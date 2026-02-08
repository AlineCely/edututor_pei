import { useState, useEffect, useCallback } from "react";
import Pagination from "../Table/Pagination";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabase";
import { toast } from "react-hot-toast";


interface Usuario {
  Nome: string;
  Email: string;
  Telefone: string;
  Tipo: string;
}

interface Profissional {
  Professor_ID: number;
  Especialidades: string | null;
  Biografia: string | null;
  Formacao: string | null;
  Experiencia: string | null;
  Valor_hora: number | null;
  Media: number | null;
  Total_aulas: number | null;
  Usuarios: Usuario | null;
}

interface Props {
  onStatsUpdate?: (stats: {
    totalProfissionais: number;
    profissionaisPorTipo: { [key: string]: number };
    valorMedioHora: number;
  }) => void;
  externalSearchTerm?: string;
  externalFilters?: { disciplina?: string; tipo?: string };
}

export default function ProfissionaisTable({
  onStatsUpdate,
  externalSearchTerm = "",
  externalFilters = {}
}: Props) {
  const navigate = useNavigate();
  const [profissionais, setProfissionais] = useState<Profissional[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState(externalSearchTerm);
  const [filterDisciplina, setFilterDisciplina] = useState<string>(externalFilters.disciplina || "");
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
    if (externalFilters.disciplina !== undefined) {
      setFilterDisciplina(externalFilters.disciplina);
    }
  }, [externalFilters]);

  // 🔹 Carregar profissionais do banco de dados
  const fetchProfissionais = useCallback(async () => {
    try {
      setLoading(true);

      let query = supabase
        .from("Professores")
        .select(`
          Professor_ID,
          Especialidades,
          Biografia,
          Formacao,
          Experiencia,
          Valor_hora,
          Media,
          Total_aulas,
          Usuarios:Usuario_ID (
            Nome,
            Email,
            Telefone,
            Tipo
          )
        `, { count: 'exact' })
        .order("Professor_ID", { ascending: true });

      // Aplicar filtros
      if (filterDisciplina) {
        query = query.ilike("Especialidades", `%${filterDisciplina}%`);
      }

      if (searchTerm) {
        query = query.or(`
          Usuarios.Nome.ilike.%${searchTerm}%,
          Especialidades.ilike.%${searchTerm}%,
          Formacao.ilike.%${searchTerm}%,
          Usuarios.Email.ilike.%${searchTerm}%
        `);
      }

      // Paginação
      const from = (currentPage - 1) * itemsPerPage;
      const to = from + itemsPerPage - 1;

      query = query.range(from, to);

      const { data, error, count } = await query;

      if (error) throw error;

      if (data) {
        const profissionaisFormatados: Profissional[] = data.map((p: any) => ({
          Professor_ID: p.Professor_ID,
          Especialidades: p.Especialidades ?? null,
          Biografia: p.Biografia ?? null,
          Formacao: p.Formacao ?? null,
          Experiencia: p.Experiencia ?? null,
          Valor_hora: p.Valor_hora ?? null,
          Media: p.Media ?? null,
          Total_aulas: p.Total_aulas ?? null,
          Usuarios: p.Usuarios ?? null
        }));

        setProfissionais(profissionaisFormatados);
        setTotalCount(count || 0);
        setTotalPages(Math.ceil((count || 0) / itemsPerPage));

        // Calcular estatísticas e notificar componente pai
        if (onStatsUpdate) {
          const valorMedioHora = profissionaisFormatados.reduce((sum, prof) =>
            sum + (prof.Valor_hora || 0), 0) / (profissionaisFormatados.length || 1);

          const profissionaisPorTipo = profissionaisFormatados.reduce((acc, prof) => {
            const tipo = prof.Usuarios?.Tipo || "Sem tipo";
            acc[tipo] = (acc[tipo] || 0) + 1;
            return acc;
          }, {} as { [key: string]: number });

          onStatsUpdate({
            totalProfissionais: count || 0,
            profissionaisPorTipo,
            valorMedioHora
          });
        }
      }
    } catch (error: any) {
      console.error("Erro ao carregar profissionais:", error);
      toast.error("Erro ao carregar profissionais. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }, [searchTerm, filterDisciplina, currentPage, onStatsUpdate]);

  useEffect(() => {
    fetchProfissionais();
  }, [fetchProfissionais]);

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
    if (!window.confirm(`Tem certeza que deseja excluir o profissional "${nome}"?`)) {
      return;
    }

    try {
      const { error } = await supabase
        .from("Professores")
        .delete()
        .eq("Professor_ID", id);

      if (error) throw error;

      toast.success("Profissional excluído com sucesso!");
      fetchProfissionais(); // Recarregar a lista
    } catch (err: any) {
      console.error("Erro ao excluir profissional:", err);
      toast.error("Erro ao excluir profissional: " + err.message);
    }
  };

  // Exportar dados
  const exportData = () => {
    const dataToExport = profissionais.map(prof => ({
      ID: prof.Professor_ID,
      Nome: prof.Usuarios?.Nome || "-",
      Especialidades: prof.Especialidades || "-",
      Email: prof.Usuarios?.Email || "-",
      Telefone: prof.Usuarios?.Telefone || "-",
      "Valor/Hora": prof.Valor_hora ? `R$ ${prof.Valor_hora.toFixed(2)}` : "-",
      "Total Aulas": prof.Total_aulas || 0,
      Média: prof.Media ? prof.Media.toFixed(1) : "-"
    }));

    const csvContent = [
      Object.keys(dataToExport[0] || {}).join(","),
      ...dataToExport.map(row => Object.values(row).join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `profissionais_${new Date().toISOString().split('T')[0]}.csv`;
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
        {loading && profissionais.length === 0 ? (
          <div style={{ padding: "40px", textAlign: "center" }}>
            <div style={{
              display: "inline-block",
              width: "40px",
              height: "40px",
              border: "3px solid #e5e7eb",
              borderTopColor: "#2563eb",
              borderRadius: "50%",
              animation: "spin 1s linear infinite"
            }}></div>
            <p style={{ marginTop: "16px", color: "#6b7280" }}>Carregando profissionais...</p>
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
                {profissionais.length} de {totalCount} profissionais
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
                minWidth: "800px",
              }}>
                <thead>
                  <tr style={{
                    borderBottom: "2px solid #e5e7eb",
                    backgroundColor: "#f9fafb",
                  }}>
                    <th style={{
                      padding: "16px 24px",
                      textAlign: "left",
                      fontWeight: "600",
                      color: "#374151",
                      fontSize: "14px"
                    }}>Profissional</th>
                    <th style={{
                      padding: "16px 24px",
                      textAlign: "left",
                      fontWeight: "600",
                      color: "#374151",
                      fontSize: "14px"
                    }}>Especialidades</th>
                    <th style={{
                      padding: "16px 24px",
                      textAlign: "left",
                      fontWeight: "600",
                      color: "#374151",
                      fontSize: "14px"
                    }}>Contato</th>
                    <th style={{
                      padding: "16px 24px",
                      textAlign: "left",
                      fontWeight: "600",
                      color: "#374151",
                      fontSize: "14px"
                    }}>Valor/Hora</th>
                    <th style={{
                      padding: "16px 24px",
                      textAlign: "center",
                      fontWeight: "600",
                      color: "#374151",
                      fontSize: "14px"
                    }}>Ações</th>
                  </tr>
                </thead>

                <tbody>
                  {profissionais.length === 0 ? (
                    <tr>
                      <td colSpan={5} style={{
                        padding: "48px 24px",
                        textAlign: "center",
                        color: "#9ca3af",
                        fontSize: "14px"
                      }}>
                        {searchTerm || filterDisciplina
                          ? "Nenhum profissional encontrado com os filtros aplicados."
                          : "Nenhum profissional cadastrado."}
                      </td>
                    </tr>
                  ) : (
                    profissionais.map((prof, index) => (
                      <tr
                        key={prof.Professor_ID}
                        style={{
                          borderBottom: "1px solid #f1f1f1",
                          backgroundColor: index % 2 === 0 ? "white" : "#fafafa",
                          transition: "background-color 0.2s"
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#f8f9fa"}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = index % 2 === 0 ? "white" : "#fafafa"}
                      >
                        <td style={{
                          padding: "16px 24px",
                          color: "#111827",
                          fontWeight: "500"
                        }}>
                          <div style={{ marginBottom: "4px" }}>
                            {prof.Usuarios?.Nome || "-"}
                          </div>
                          <div style={{
                            fontSize: "12px",
                            color: "#6b7280"
                          }}>
                            ID: #{prof.Professor_ID.toString().padStart(3, '0')}
                          </div>
                        </td>
                        <td style={{
                          padding: "16px 24px",
                          color: "#111827"
                        }}>
                          <div style={{ marginBottom: "4px" }}>
                            {prof.Especialidades || "-"}
                          </div>
                          <div style={{
                            fontSize: "12px",
                            color: "#6b7280"
                          }}>
                            {prof.Formacao ? prof.Formacao.substring(0, 30) + (prof.Formacao.length > 30 ? "..." : "") : ""}
                          </div>
                        </td>
                        <td style={{
                          padding: "16px 24px",
                          color: "#6b7280"
                        }}>
                          <div style={{ marginBottom: "4px" }}>
                            {prof.Usuarios?.Email || "-"}
                          </div>
                          <div style={{ fontSize: "12px" }}>
                            {formatTelefone(prof.Usuarios?.Telefone || "")}
                          </div>
                        </td>
                        <td style={{
                          padding: "16px 24px",
                          color: "#111827",
                          fontWeight: "500"
                        }}>
                          {prof.Valor_hora ?
                            <div>
                              <div style={{ color: "#059669", fontWeight: "600" }}>
                                R$ {prof.Valor_hora.toFixed(2)}
                              </div>
                              {prof.Total_aulas && prof.Total_aulas > 0 && (
                                <div style={{ fontSize: "11px", color: "#6b7280", marginTop: "2px" }}>
                                  {prof.Total_aulas} aulas
                                </div>
                              )}
                            </div> :
                            "-"
                          }
                        </td>
                        <td style={{
                          padding: "16px 24px"
                        }}>
                          <div style={{ display: "flex", justifyContent: "center", gap: "8px" }}>
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
                              onClick={() => navigate(`/profissionais/${prof.Professor_ID}`)}
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
                              onClick={() => navigate(`/profissionais/${prof.Professor_ID}/editar`)}
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
                              onClick={() => handleDelete(prof.Professor_ID, prof.Usuarios?.Nome || "profissional")}
                              style={{
                                padding: "8px 12px",
                                borderRadius: "6px",
                                border: "1px solid #fecaca",
                                backgroundColor: "#fef2f2",
                                cursor: "pointer",
                                fontSize: "14px",
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
            {profissionais.length > 0 && totalPages > 1 && (
              <div style={{
                marginTop: "24px",
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