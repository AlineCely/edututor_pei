import { useState, useEffect } from "react";
import Pagination from "../Table/Pagination";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabase";

interface Props {
  onTotalChange?: (total: number) => void;
}
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

export default function ProfissionaisTable({ onTotalChange }: Props) {
  const navigate = useNavigate();
  const [profissionais, setProfissionais] = useState<Profissional[]>([]);
  const [loading, setLoading] = useState(true);

  // 🔹 Carregar profissionais do banco de dados
  useEffect(() => {
    async function carregarProfissionais() {
      try {
        const { data, error } = await supabase
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
          `)
          .order("Professor_ID", { ascending: true });

        console.log("DATA SUPABASE:", data);

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
            Usuarios: p.Usuarios ?? null // 👈 OBJETO
          }));

          setProfissionais(profissionaisFormatados);
          onTotalChange?.(profissionaisFormatados.length);
        }
      } catch (error) {
        console.error("Erro ao carregar profissionais:", error);
      } finally {
        setLoading(false);
      }
    }

    carregarProfissionais();
  }, [onTotalChange]);

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "20px" }}>
        Carregando profissionais...
      </div>
    );
  }

  return (
    <div
      style={{
        background: "#fff",
        borderRadius: "12px",
        padding: "16px"
      }}
    >
      {/* Filtros */}
      <div style={{ display: "flex", gap: "12px", marginBottom: "16px" }}>
        <select style={{ padding: "8px", borderRadius: "6px", border: "1px solid #ccc", backgroundColor: "#f9f9f9", color: "#555" }}>
          <option>Selecionar disciplina</option>
          <option>Informática</option>
          <option>Psicologia</option>
          <option>Fonoaudiologia</option>
        </select>
      </div>

      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr style={{ borderBottom: "1px solid #eee", textAlign: "left", color: "#555" }}>
            <th>Profissional</th>
            <th>Disciplina</th>
            <th>Telefone</th>
            <th>Email</th>
            <th>Registro Profissional</th>
            <th>Ação</th>
          </tr>
        </thead>

        <tbody>
          {profissionais.map((prof) => (
            <tr key={prof.Professor_ID} style={{ borderBottom: "1px solid #f1f1f1", color: "#777" }}>
              <td style={{ padding: "12px" }}>{prof.Usuarios?.Nome || "-"}</td>
              <td>{prof.Especialidades || "-"}</td>
              <td>{prof.Usuarios?.Telefone || "-"}</td>
              <td>{prof.Usuarios?.Email || "-"}</td>
              <td>
                <div style={{ display: "flex", gap: "8px" }}>
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
