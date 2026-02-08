import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabase";
import Pagination from "../Table/Pagination";
import { toast } from "react-hot-toast";

interface Avaliacao {
  Avaliacao_ID: number;
  Nota: number | null;
  Comentario: string | null;
  created_at: string;
  // Relacionamentos
  Professores?: {
    Professor_ID: number;
    Usuarios?: {
      Nome: string;
    };
  };
  Aulas?: {
    Aula_ID: number;
    Data_hora_inicio: string | null;
    Disciplinas?: {
      Nome: string;
    };
  };
}

interface AvaliacoesTableProps {
    searchTerm?: string;
    filters?: any;
    onUpdateStats?: (stats: {
        totalAvaliacoes: number;
        mediaGeral: number;
        avaliacoesPorStatus: {
            positivas: number;
            neutras: number;
            negativas: number;
        };
        professoresAvaliados: number;
        aulasAvaliadas: number;
    }) => void;
    onUpdateProfessores?: (professores: any[]) => void;
    onUpdateAulas?: (aulas: any[]) => void;
}

export default function AvaliacoesTable({ 
    searchTerm = "", 
    filters = {}, 
    onUpdateStats,
    onUpdateProfessores,
    onUpdateAulas 
}: AvaliacoesTableProps) {
  const navigate = useNavigate();
  const [avaliacoes, setAvaliacoes] = useState<Avaliacao[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [professores, setProfessores] = useState<any[]>([]);
  const [aulas, setAulas] = useState<any[]>([]);
  const itemsPerPage = 10;

  // Buscar avaliações
  useEffect(() => {
    fetchAvaliacoes();
    fetchProfessores();
    fetchAulas();
  }, [searchTerm, filters, currentPage]);

  async function fetchAvaliacoes() {
    try {
      setLoading(true);
      
      let query = supabase
        .from("Avaliacoes")
        .select(`
          *,
          Professores:Professor_ID (
            Professor_ID,
            Usuarios:Usuario_ID (
              Nome
            )
          ),
          Aulas:Aula_ID (
            Aula_ID,
            Data_hora_inicio,
            Disciplinas:Disciplina_ID (
              Nome
            )
          )
        `, { count: 'exact' });

      // Aplicar filtros das props
      if (searchTerm) {
        query = query.ilike("Comentario", `%${searchTerm}%`);
      }

      if (filters.professor) {
        query = query.eq("Professor_ID", filters.professor);
      }

      if (filters.aula) {
        query = query.eq("Aula_ID", filters.aula);
      }

      if (filters.notaMin !== undefined) {
        query = query.gte("Nota", filters.notaMin);
      }

      if (filters.notaMax !== undefined) {
        query = query.lte("Nota", filters.notaMax);
      }

      if (filters.dataInicio) {
        query = query.gte("created_at", `${filters.dataInicio}T00:00:00`);
      }

      if (filters.dataFim) {
        query = query.lte("created_at", `${filters.dataFim}T23:59:59`);
      }

      // Paginação
      const from = (currentPage - 1) * itemsPerPage;
      const to = from + itemsPerPage - 1;
      
      const { data, error, count } = await query;

      if (error) throw error;

      setAvaliacoes(data || []);
      setTotalCount(count || 0);
      setTotalPages(Math.ceil((count || 0) / itemsPerPage));
      setError(null);
    } catch (err: any) {
      console.error("Erro ao buscar avaliações:", err);
      setError("Erro ao carregar avaliações. Tente novamente.");
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
      const professoresData = data || [];
      setProfessores(professoresData);
      if (onUpdateProfessores) {
        onUpdateProfessores(professoresData);
      }
    } catch (err) {
      console.error("Erro ao buscar professores:", err);
    }
  }

  async function fetchAulas() {
    try {
      const { data, error } = await supabase
        .from("Aulas")
        .select(`
          Aula_ID,
          Data_hora_inicio,
          Disciplinas:Disciplina_ID (
            Nome
          )
        `)
        .order("Data_hora_inicio", { ascending: false });

      if (error) throw error;
      const aulasData = data || [];
      setAulas(aulasData);
      if (onUpdateAulas) {
        onUpdateAulas(aulasData);
      }
    } catch (err) {
      console.error("Erro ao buscar aulas:", err);
    }
  }

  // Calcular estatísticas
  const totalAvaliacoes = avaliacoes.length;
  const mediaGeral = avaliacoes.length > 0 
    ? avaliacoes.reduce((sum, av) => sum + (av.Nota || 0), 0) / avaliacoes.length
    : 0;
  
  const avaliacoesPorStatus = {
    positivas: avaliacoes.filter(av => (av.Nota || 0) >= 7).length,
    neutras: avaliacoes.filter(av => (av.Nota || 0) >= 4 && (av.Nota || 0) < 7).length,
    negativas: avaliacoes.filter(av => (av.Nota || 0) < 4).length
  };

  const professoresAvaliados = [...new Set(avaliacoes
    .map(av => av.Professores?.Professor_ID)
    .filter(Boolean))].length;

  const aulasAvaliadas = [...new Set(avaliacoes
    .map(av => av.Aulas?.Aula_ID)
    .filter(Boolean))].length;

  // Atualizar estatísticas no componente pai
  useEffect(() => {
    if (onUpdateStats) {
      onUpdateStats({
        totalAvaliacoes,
        mediaGeral,
        avaliacoesPorStatus,
        professoresAvaliados,
        aulasAvaliadas
      });
    }
  }, [avaliacoes]);

  // Formatar data
  const formatDate = (dateString: string | null) => {
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

  // Formatar data da aula
  const formatDateAula = (dateString: string | null) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return date.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "short"
    });
  };

  // Renderizar estrelas
  const renderStars = (nota: number | null) => {
    const stars = [];
    const notaNum = nota || 0;
    
    for (let i = 1; i <= 10; i++) {
      stars.push(
        <span
          key={i}
          style={{
            color: i <= notaNum ? "#f59e0b" : "#d1d5db",
            fontSize: "16px",
            marginRight: "2px"
          }}
        >
          ★
        </span>
      );
    }
    
    return (
      <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
        <div>{stars}</div>
        <span style={{ 
          fontSize: "12px", 
          color: "#6b7280",
          marginLeft: "4px"
        }}>
          ({notaNum}/10)
        </span>
      </div>
    );
  };

  // Determinar cor da avaliação
  const getAvaliacaoColor = (nota: number | null) => {
    const notaNum = nota || 0;
    
    if (notaNum >= 7) {
      return { color: "#059669", bgColor: "#d1fae5", label: "Positiva" };
    } else if (notaNum >= 4) {
      return { color: "#d97706", bgColor: "#fef3c7", label: "Neutra" };
    } else {
      return { color: "#dc2626", bgColor: "#fee2e2", label: "Negativa" };
    }
  };

  // Handle delete
  const handleDelete = async (id: number) => {
    if (!window.confirm("Tem certeza que deseja excluir esta avaliação?")) {
      return;
    }

    try {
      const { error } = await supabase
        .from("Avaliacoes")
        .delete()
        .eq("Avaliacao_ID", id);

      if (error) throw error;

      toast.success("Avaliação excluída com sucesso!");
      fetchAvaliacoes(); // Recarregar a lista
    } catch (err: any) {
      console.error("Erro ao excluir avaliação:", err);
      toast.error("Erro ao excluir avaliação: " + err.message);
    }
  };

  // Exportar dados
  const exportData = () => {
    const dataToExport = avaliacoes.map(avaliacao => {
      const status = getAvaliacaoColor(avaliacao.Nota);
      return {
        ID: avaliacao.Avaliacao_ID,
        Professor: avaliacao.Professores?.Usuarios?.Nome || "Não definido",
        Aula: avaliacao.Aulas?.Aula_ID || "",
        "Data Aula": formatDateAula(avaliacao.Aulas?.Data_hora_inicio),
        Disciplina: avaliacao.Aulas?.Disciplinas?.Nome || "Não definida",
        Nota: avaliacao.Nota || 0,
        Status: status.label,
        Comentário: avaliacao.Comentario?.substring(0, 50) + (avaliacao.Comentario?.length > 50 ? "..." : "") || "",
        "Data Avaliação": formatDate(avaliacao.created_at)
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
    a.download = `avaliacoes_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    
    toast.success("Dados exportados com sucesso!");
  };

  if (error && avaliacoes.length === 0) {
    return (
      <div style={{ padding: "40px", textAlign: "center" }}>
        <p style={{ color: "#dc2626", marginBottom: "16px" }}>{error}</p>
        <button
          onClick={() => fetchAvaliacoes()}
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
      {/* Tabela */}
      <div style={{
        background: "#fff",
        borderRadius: "12px",
        overflow: "hidden",
        boxShadow: "0 2px 8px rgba(0,0,0,0.05)"
      }}>
        {/* Loading State */}
        {loading && avaliacoes.length === 0 ? (
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
            <p style={{ marginTop: "16px", color: "#6b7280" }}>Carregando avaliações...</p>
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
                {avaliacoes.length} de {totalCount} avaliações
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
                    }}>Professor</th>
                    <th style={{ 
                      padding: "16px 12px", 
                      textAlign: "left", 
                      fontSize: "12px",
                      fontWeight: "600",
                      color: "#6b7280",
                      textTransform: "uppercase",
                      letterSpacing: "0.05em"
                    }}>Aula</th>
                    <th style={{ 
                      padding: "16px 12px", 
                      textAlign: "left", 
                      fontSize: "12px",
                      fontWeight: "600",
                      color: "#6b7280",
                      textTransform: "uppercase",
                      letterSpacing: "0.05em"
                    }}>Nota</th>
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
                    }}>Comentário</th>
                    <th style={{ 
                      padding: "16px 12px", 
                      textAlign: "left", 
                      fontSize: "12px",
                      fontWeight: "600",
                      color: "#6b7280",
                      textTransform: "uppercase",
                      letterSpacing: "0.05em"
                    }}>Data</th>
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
                  {avaliacoes.length === 0 ? (
                    <tr>
                      <td colSpan={7} style={{ 
                        padding: "48px 24px", 
                        textAlign: "center", 
                        color: "#9ca3af",
                        fontSize: "14px"
                      }}>
                        {searchTerm || filters.professor || filters.aula || filters.notaMin || filters.notaMax
                          ? "Nenhuma avaliação encontrada com os filtros aplicados." 
                          : "Nenhuma avaliação registrada."}
                      </td>
                    </tr>
                  ) : (
                    avaliacoes.map((avaliacao) => {
                      const status = getAvaliacaoColor(avaliacao.Nota);

                      return (
                        <tr 
                          key={avaliacao.Avaliacao_ID} 
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
                              {avaliacao.Professores?.Usuarios?.Nome || "Não definido"}
                            </div>
                            <div style={{ 
                              fontSize: "12px", 
                              color: "#6b7280"
                            }}>
                              ID: #{avaliacao.Professores?.Professor_ID?.toString().padStart(3, '0') || "000"}
                            </div>
                          </td>
                          
                          <td style={{ padding: "16px 12px" }}>
                            <div style={{ fontWeight: "500", color: "#1f2937", marginBottom: "4px" }}>
                              Aula #{avaliacao.Aulas?.Aula_ID}
                            </div>
                            <div style={{ fontSize: "12px", color: "#6b7280", marginBottom: "4px" }}>
                              {formatDateAula(avaliacao.Aulas?.Data_hora_inicio)}
                            </div>
                            <div style={{ 
                              fontSize: "11px", 
                              color: "#6b7280",
                              backgroundColor: "#f3f4f6",
                              padding: "4px 8px",
                              borderRadius: "4px",
                              display: "inline-block"
                            }}>
                              {avaliacao.Aulas?.Disciplinas?.Nome || "Sem disciplina"}
                            </div>
                          </td>
                          
                          <td style={{ padding: "16px 12px" }}>
                            {renderStars(avaliacao.Nota)}
                            <div style={{ 
                              fontSize: "14px", 
                              fontWeight: "600",
                              color: "#1f2937",
                              marginTop: "4px"
                            }}>
                              {avaliacao.Nota || 0}/10
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
                          
                          <td style={{ padding: "16px 12px" }}>
                            <div style={{ 
                              maxWidth: "300px",
                              fontSize: "13px",
                              color: "#374151",
                              lineHeight: "1.4"
                            }}>
                              {avaliacao.Comentario ? (
                                <>
                                  {avaliacao.Comentario.length > 100 ? (
                                    <>
                                      {avaliacao.Comentario.substring(0, 100)}...
                                      <button
                                        onClick={() => {
                                          // Mostrar comentário completo
                                          alert(avaliacao.Comentario);
                                        }}
                                        style={{
                                          background: "none",
                                          border: "none",
                                          color: "#4F46E5",
                                          cursor: "pointer",
                                          fontSize: "12px",
                                          marginLeft: "4px"
                                        }}
                                      >
                                        Ver mais
                                      </button>
                                    </>
                                  ) : (
                                    avaliacao.Comentario
                                  )}
                                </>
                              ) : (
                                <span style={{ color: "#9ca3af", fontStyle: "italic" }}>
                                  Sem comentário
                                </span>
                              )}
                            </div>
                          </td>
                          
                          <td style={{ padding: "16px 12px" }}>
                            <div style={{ 
                              fontSize: "13px",
                              color: "#6b7280"
                            }}>
                              {formatDate(avaliacao.created_at)}
                            </div>
                          </td>
                          
                          <td style={{ padding: "16px 12px" }}>
                            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                              <button
                                onClick={() => navigate(`/avaliacoes/${avaliacao.Avaliacao_ID}/editar`)}
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
                                onClick={() => handleDelete(avaliacao.Avaliacao_ID)}
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

                              <button
                                onClick={() => {
                                  // Ver detalhes da aula
                                  if (avaliacao.Aulas?.Aula_ID) {
                                    navigate(`/aulas/${avaliacao.Aulas.Aula_ID}/ver`);
                                  }
                                }}
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
                                <span style={{ fontSize: "14px" }}>👁️</span>
                                Ver Aula
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
            {avaliacoes.length > 0 && totalPages > 1 && (
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