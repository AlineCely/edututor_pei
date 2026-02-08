import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabase";
import Pagination from "../Table/Pagination";
import { toast } from "react-hot-toast";

interface Familia {
  Familia_ID: number;
  Nome_responsavel: string;
  Telefone: string;
  Email: string;
  Endereco: string;
  created_at?: string;
  Plataforma_ID?: number;
  // Relacionamentos
  Alunos?: Array<{
    Aluno_ID: number;
    Nome: string;
    Status: string;
  }>;
}

interface Props {
  onStatsUpdate?: (stats: {
    totalFamilias: number;
    familiasComTelefone: number;
    familiasComEmail: number;
  }) => void;
  externalSearchTerm?: string;
  externalFilters?: { telefone?: boolean; email?: boolean };
}

export default function FamiliasTable({
  onStatsUpdate,
  externalSearchTerm = "",
  externalFilters = {}
}: Props) {
  const navigate = useNavigate();
  const [familias, setFamilias] = useState<Familia[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState(externalSearchTerm);
  const [filterTelefone, setFilterTelefone] = useState<boolean | null>(externalFilters.telefone !== undefined ? externalFilters.telefone : null);
  const [filterEmail, setFilterEmail] = useState<boolean | null>(externalFilters.email !== undefined ? externalFilters.email : null);
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
    if (externalFilters.telefone !== undefined) {
      setFilterTelefone(externalFilters.telefone);
    }
    if (externalFilters.email !== undefined) {
      setFilterEmail(externalFilters.email);
    }
  }, [externalFilters]);

  // Buscar famílias
  const fetchFamilias = useCallback(async () => {
    try {
      setLoading(true);

      let query = supabase
        .from("Familias")
        .select(`
          *,
          Alunos (
            Aluno_ID,
            Nome,
            Status
          )
        `, { count: 'exact' });

      // Aplicar filtros
      if (filterTelefone !== null) {
        if (filterTelefone) {
          query = query.not("Telefone", "is", null);
        } else {
          query = query.is("Telefone", null);
        }
      }

      if (filterEmail !== null) {
        if (filterEmail) {
          query = query.not("Email", "is", null);
        } else {
          query = query.is("Email", null);
        }
      }

      if (searchTerm) {
        query = query.or(`
          Nome_responsavel.ilike.%${searchTerm}%,
          Telefone.ilike.%${searchTerm}%,
          Email.ilike.%${searchTerm}%,
          Endereco.ilike.%${searchTerm}%
        `);
      }

      // Paginação
      const from = (currentPage - 1) * itemsPerPage;
      const to = from + itemsPerPage - 1;

      // query = query
      //   .order("created_at", { ascending: false })
      //   .range(from, to);

      const { data, error, count } = await query;

      if (error) throw error;

      const familiasData = data || [];
      setFamilias(familiasData);
      setTotalCount(count || 0);
      setTotalPages(Math.ceil((count || 0) / itemsPerPage));

       // Calcular estatísticas e notificar componente pai
      if (onStatsUpdate) {
        const familiasComTelefone = familiasData.filter(f => f.Telefone && f.Telefone.trim() !== "").length;
        const familiasComEmail = familiasData.filter(f => f.Email && f.Email.trim() !== "").length;
        
        onStatsUpdate({
          totalFamilias: count || 0,
          familiasComTelefone,
          familiasComEmail
        });
      }

    } catch (err: any) {
      console.error("Erro ao buscar famílias:", err);
      toast.error("Erro ao carregar famílias. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }, [searchTerm, filterEmail, filterTelefone, currentPage, onStatsUpdate]);

  useEffect(() => {
    fetchFamilias();
  }, [fetchFamilias]);

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

  // Contar alunos ativos
  const contarAlunosAtivos = (alunos?: Array<{ Status: string }>) => {
    if (!alunos) return 0;
    return alunos.filter(aluno => aluno.Status === "Ativo").length;
  };

  // Handle delete
  const handleDelete = async (id: number, nome: string, temAlunos: boolean) => {
    if (temAlunos) {
      toast.error("Esta família possui alunos vinculados. Remova os alunos primeiro.");
      return;
    }

    if (!window.confirm(`Tem certeza que deseja excluir a família "${nome}"?`)) {
      return;
    }

    try {
      const { error } = await supabase
        .from("Familias")
        .delete()
        .eq("Familia_ID", id);

      if (error) throw error;

      toast.success("Família excluída com sucesso!");
      fetchFamilias(); // Recarregar a lista
    } catch (err: any) {
      console.error("Erro ao excluir família:", err);
      toast.error("Erro ao excluir família: " + err.message);
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
        {loading && familias.length === 0 ? (
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
            <p style={{ marginTop: "16px", color: "#6b7280" }}>Carregando famílias...</p>
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
                    }}>Responsável</th>
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
                    }}>Alunos</th>
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
                  {familias.length === 0 ? (
                    <tr>
                      <td colSpan={6} style={{
                        padding: "48px 24px",
                        textAlign: "center",
                        color: "#9ca3af",
                        fontSize: "14px"
                      }}>
                        {searchTerm || filterTelefone !== null || filterEmail !== null
                          ? "Nenhuma família encontrada com os filtros aplicados."
                          : "Nenhuma família cadastrada."}
                      </td>
                    </tr>
                  ) : (
                    familias.map((familia) => {
                      const totalAlunos = familia.Alunos?.length || 0;
                      const alunosAtivos = contarAlunosAtivos(familia.Alunos);
                      const temAlunos = totalAlunos > 0;

                      return (
                        <tr
                          key={familia.Familia_ID}
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
                            #{familia.Familia_ID.toString().padStart(3, '0')}
                          </td>

                          <td style={{ padding: "16px 24px" }}>
                            <div style={{ fontWeight: "600", color: "#1f2937", marginBottom: "4px" }}>
                              {familia.Nome_responsavel || "Sem responsável"}
                            </div>
                            <div style={{
                              fontSize: "12px",
                              color: "#6b7280"
                            }}>
                              {familia.Endereco ?
                                familia.Endereco.substring(0, 30) + (familia.Endereco.length > 30 ? "..." : "") :
                                "Sem endereço"
                              }
                            </div>
                          </td>

                          <td style={{ padding: "16px 24px" }}>
                            <div style={{ marginBottom: "4px" }}>
                              <div style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "6px",
                                fontSize: "14px",
                                color: familia.Telefone ? "#1f2937" : "#9ca3af"
                              }}>
                                <span style={{ fontSize: "12px" }}>📞</span>
                                {formatTelefone(familia.Telefone)}
                              </div>
                            </div>
                            <div>
                              <div style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "6px",
                                fontSize: "12px",
                                color: familia.Email ? "#1f2937" : "#9ca3af"
                              }}>
                                <span style={{ fontSize: "10px" }}>✉️</span>
                                {familia.Email || "Sem email"}
                              </div>
                            </div>
                          </td>

                          <td style={{ padding: "16px 24px" }}>
                            {temAlunos ? (
                              <div>
                                <div style={{
                                  display: "inline-flex",
                                  alignItems: "center",
                                  padding: "4px 10px",
                                  borderRadius: "20px",
                                  fontSize: "12px",
                                  fontWeight: "600",
                                  backgroundColor: alunosAtivos > 0 ? "#d1fae5" : "#fef3c7",
                                  color: alunosAtivos > 0 ? "#059669" : "#d97706",
                                  marginBottom: "4px"
                                }}>
                                  <span style={{ marginRight: "4px" }}>
                                    {alunosAtivos > 0 ? "✅" : "⚠️"}
                                  </span>
                                  {alunosAtivos} de {totalAlunos} ativos
                                </div>
                                {familia.Alunos && familia.Alunos.length > 0 && (
                                  <div style={{ fontSize: "11px", color: "#6b7280", marginTop: "2px" }}>
                                    {familia.Alunos.slice(0, 2).map(aluno => aluno.Nome).join(", ")}
                                    {familia.Alunos.length > 2 && "..."}
                                  </div>
                                )}
                              </div>
                            ) : (
                              <span style={{
                                fontSize: "12px",
                                color: "#9ca3af",
                                fontStyle: "italic"
                              }}>
                                Sem alunos
                              </span>
                            )}
                          </td>

                          <td style={{
                            padding: "16px 24px",
                            fontSize: "14px",
                            color: "#6b7280"
                          }}>
                            {formatDate(familia.created_at || "")}
                          </td>

                          <td style={{ padding: "16px 24px" }}>
                            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                              <button
                                onClick={() => navigate(`/familias/ver/${familia.Familia_ID}`)}
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
                                onClick={() => navigate(`/familias/${familia.Familia_ID}/editar`)}
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
                                onClick={() => handleDelete(familia.Familia_ID, familia.Nome_responsavel || "Sem nome", temAlunos)}
                                disabled={temAlunos}
                                style={{
                                  padding: "8px 12px",
                                  borderRadius: "6px",
                                  border: `1px solid ${temAlunos ? "#f3f4f6" : "#fecaca"}`,
                                  backgroundColor: temAlunos ? "#f9fafb" : "#fef2f2",
                                  cursor: temAlunos ? "not-allowed" : "pointer",
                                  fontSize: "12px",
                                  display: "flex",
                                  alignItems: "center",
                                  gap: "6px",
                                  transition: "all 0.2s",
                                  color: temAlunos ? "#9ca3af" : "#dc2626",
                                  fontWeight: "500"
                                }}
                                onMouseEnter={(e) => {
                                  if (!temAlunos) {
                                    e.currentTarget.style.backgroundColor = "#fee2e2";
                                    e.currentTarget.style.borderColor = "#f87171";
                                  }
                                }}
                                onMouseLeave={(e) => {
                                  if (!temAlunos) {
                                    e.currentTarget.style.backgroundColor = "#fef2f2";
                                    e.currentTarget.style.borderColor = "#fca5a5";
                                  }
                                }}
                              >
                                <span style={{ fontSize: "14px" }}>🗑️</span>
                                Excluir
                              </button>

                              {temAlunos && (
                                <button
                                  onClick={() => navigate(`/alunos?familia=${familia.Familia_ID}`)}
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
                                  <span style={{ fontSize: "14px" }}>👨‍👩‍👧‍👦</span>
                                  Ver Alunos
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
            {familias.length > 0 && totalPages > 1 && (
              <div style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "20px 24px",
                borderTop: "1px solid #e5e7eb"
              }}>
                <div style={{ color: "#6b7280", fontSize: "14px" }}>
                  Mostrando {familias.length} de {totalCount} famílias
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