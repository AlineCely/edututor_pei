import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabase";
import Pagination from "../Table/Pagination";
import { toast } from "react-hot-toast";

interface Usuario {
  Usuario_ID: number;
  Nome: string;
  Email: string;
  Telefone: string;
  Tipo: string;
  Status: string;
  created_at?: string;
  Plataforma_ID?: number;
  last_sign_in_at?: string;
}

interface Props {
  onStatsUpdate?: (stats: {
    totalUsuarios: number;
    usuariosAtivos: number;
    usuariosPorTipo: { GESTOR: number; PROFISSIONAL: number; FAMILIA: number };
  }) => void;
  externalSearchTerm?: string;
  externalFilters?: { status?: string; tipo?: string };
}

export default function UsuariosTable({
  onStatsUpdate,
  externalSearchTerm = "",
  externalFilters = {}
}: Props) {
  const navigate = useNavigate();
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState(externalSearchTerm);
  const [filterStatus, setFilterStatus] = useState<string>(externalFilters.status || "");
  const [filterTipo, setFilterTipo] = useState<string>(externalFilters.tipo || "");
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
    if (externalFilters.tipo !== undefined) {
      setFilterTipo(externalFilters.tipo);
    }
  }, [externalFilters]);

  // Buscar usuários
  const fetchUsuarios = useCallback(async () => {
    try {
      setLoading(true);

      let query = supabase
        .from("Usuarios")
        .select("*", { count: 'exact' });

      // Aplicar filtros
      if (filterStatus) {
        query = query.eq("Status", filterStatus);
      }

      if (filterTipo) {
        query = query.eq("Tipo", filterTipo);
      }

      if (searchTerm) {
        query = query.or(`Nome.ilike.%${searchTerm}%,Email.ilike.%${searchTerm}%`);
      }

      // Paginação
      const from = (currentPage - 1) * itemsPerPage;
      const to = from + itemsPerPage - 1;

      query = query
        .order("Data_criacao", { ascending: false })
        .range(from, to);

      const { data, error, count } = await query;

      if (error) throw error;

      setUsuarios(data || []);
      setTotalCount(count || 0);
      setTotalPages(Math.ceil((count || 0) / itemsPerPage));

      if (onStatsUpdate) {
        const usuariosAtivos = (data || []).filter(u => u.Status === "Ativo").length;
        const usuariosPorTipo = {
          GESTOR: (data || []).filter(u => u.Tipo === "GESTOR").length,
          PROFISSIONAL: (data || []).filter(u => u.Tipo === "PROFISSIONAL").length,
          FAMILIA: (data || []).filter(u => u.Tipo === "FAMILIA").length
        };

        onStatsUpdate({
          totalUsuarios: count || 0,
          usuariosAtivos,
          usuariosPorTipo
        });
      }

    } catch (err: any) {
      console.error("Erro ao buscar usuários:", err);
      toast.error("Erro ao carregar usuários. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }, [searchTerm, filterStatus, filterTipo, currentPage, onStatsUpdate]);

  useEffect(() => {
    fetchUsuarios();
  }, [fetchUsuarios]);

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

  // Formatar tipo
  const formatTipo = (tipo: string) => {
    const tipos: { [key: string]: string } = {
      GESTOR: "Gestor",
      PROFISSIONAL: "Profissional",
      FAMILIA: "Família"
    };
    return tipos[tipo] || tipo;
  };

  // Formatar última atividade
  const formatUltimaAtividade = (dateString?: string) => {
    if (!dateString) return "Nunca";

    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "Hoje";
    if (diffDays === 1) return "Ontem";
    if (diffDays < 7) return `${diffDays} dias atrás`;

    return formatDate(dateString);
  };

  // Handle delete
  const handleDelete = async (id: number, nome: string) => {
    if (!window.confirm(`Tem certeza que deseja excluir o usuário "${nome}"? Esta ação não pode ser desfeita.`)) {
      return;
    }

    try {
      // Primeiro excluir da tabela Usuarios
      const { error: deleteError } = await supabase
        .from("Usuarios")
        .delete()
        .eq("Usuario_ID", id);

      if (deleteError) throw deleteError;

      toast.success("Usuário excluído com sucesso!");
      fetchUsuarios(); // Recarregar a lista
    } catch (err: any) {
      console.error("Erro ao excluir usuário:", err);
      toast.error("Erro ao excluir usuário: " + err.message);
    }
  };

  // Handle reset password
  const handleResetPassword = async (email: string) => {
    if (!window.confirm(`Deseja enviar email de redefinição de senha para ${email}?`)) {
      return;
    }

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) throw error;

      toast.success("Email de redefinição enviado com sucesso!");
    } catch (err: any) {
      console.error("Erro ao resetar senha:", err);
      toast.error("Erro ao enviar email de redefinição: " + err.message);
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
        {loading && usuarios.length === 0 ? (
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
            <p style={{ marginTop: "16px", color: "#6b7280" }}>Carregando usuários...</p>
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
                    }}>Usuário</th>
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
                    }}>Tipo</th>
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
                  {usuarios.length === 0 ? (
                    <tr>
                      <td colSpan={7} style={{
                        padding: "48px 24px",
                        textAlign: "center",
                        color: "#9ca3af",
                        fontSize: "14px"
                      }}>
                        {searchTerm || filterStatus || filterTipo
                          ? "Nenhum usuário encontrado com os filtros aplicados."
                          : "Nenhum usuário cadastrado."}
                      </td>
                    </tr>
                  ) : (
                    usuarios.map((usuario) => (
                      <tr
                        key={usuario.Usuario_ID}
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
                          #{usuario.Usuario_ID.toString().padStart(3, '0')}
                        </td>

                        <td style={{ padding: "16px 24px" }}>
                          <div style={{ fontWeight: "600", color: "#1f2937", marginBottom: "4px" }}>
                            {usuario.Nome}
                          </div>
                          <div style={{
                            fontSize: "12px",
                            color: "#6b7280"
                          }}>
                            Última atividade: {formatUltimaAtividade(usuario.last_sign_in_at)}
                          </div>
                        </td>

                        <td style={{ padding: "16px 24px" }}>
                          <div style={{ fontSize: "14px", color: "#1f2937" }}>
                            {usuario.Email}
                          </div>
                          <div style={{
                            fontSize: "12px",
                            color: "#6b7280",
                            marginTop: "4px"
                          }}>
                            {usuario.Telefone || "-"}
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
                              backgroundColor: usuario.Tipo === "GESTOR" ? "#f3e8ff" :
                                usuario.Tipo === "PROFISSIONAL" ? "#f0f9ff" : "#f0fdf4",
                              color: usuario.Tipo === "GESTOR" ? "#7c3aed" :
                                usuario.Tipo === "PROFISSIONAL" ? "#0369a1" : "#16a34a"
                            }}
                          >
                            {formatTipo(usuario.Tipo)}
                          </span>
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
                              color: usuario.Status === "Ativo" ? "#059669" :
                                usuario.Status === "Inativo" ? "#dc2626" : "#d97706",
                              backgroundColor: usuario.Status === "Ativo" ? "#d1fae5" :
                                usuario.Status === "Inativo" ? "#fee2e2" : "#fef3c7"
                            }}
                          >
                            {usuario.Status === "Ativo" && (
                              <span style={{
                                width: "6px",
                                height: "6px",
                                backgroundColor: "#059669",
                                borderRadius: "50%",
                                marginRight: "6px"
                              }}></span>
                            )}
                            {usuario.Status}
                          </span>
                        </td>

                        <td style={{
                          padding: "16px 24px",
                          fontSize: "14px",
                          color: "#6b7280"
                        }}>
                          {formatDate(usuario.created_at || "")}
                        </td>

                        <td style={{ padding: "16px 24px" }}>
                          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                            <button
                              onClick={() => navigate(`/usuarios/${usuario.Usuario_ID}/editar`)}
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
                              onClick={() => handleResetPassword(usuario.Email)}
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
                              <span style={{ fontSize: "14px" }}>🔄</span>
                              Resetar Senha
                            </button>

                            <button
                              onClick={() => handleDelete(usuario.Usuario_ID, usuario.Nome)}
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
            {usuarios.length > 0 && totalPages > 1 && (
              <div style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "20px 24px",
                borderTop: "1px solid #e5e7eb"
              }}>
                <div style={{ color: "#6b7280", fontSize: "14px" }}>
                  Mostrando {usuarios.length} de {totalCount} usuários
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