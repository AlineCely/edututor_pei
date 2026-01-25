import { useState, useEffect } from "react";
import Pagination from "../Table/Pagination";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabase";

interface Profissional {
  Professor_ID: number;  // Esta é a chave principal, não "id"
  Especialidades: string;
  Biografia: string;
  Formacao: string;
  Experiencia: string;
  Valor_hora: number;
  Media: number | null;
  Total_aulas: number;
  Registro_profissional: string;
  Usuarios: {
    nome: string;
    email: string;
    telefone: string;
    perfil: string;
  }[];
}

  // const profissionais: Profissional[] = Array.from({ length: 10 }).map(() => ({
  //   nome: "Ana Clara",
  //   disciplina: "Informática",
  //   telefone: "94 98130-8015",
  //   email: "gestor@edututorpei.com.br",
  //   registro: "20000"
  // }));

export default function ProfissionaisTable() {
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
            Registro_profissional,
            Usuarios (
              nome,
              email,
              telefone,
              perfil
            )
          `)
          .order("Professor_ID", { ascending: true });

        if (error) throw error;

        setProfissionais(data || []);
      } catch (error) {
        console.error("Erro ao carregar profissionais:", error);
      } finally {
        setLoading(false);
      }
    }

    carregarProfissionais();
  }, []);

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
              <td style={{ padding: "12px" }}>{prof.Usuarios?.[0]?.nome || "-"}</td>
              <td>{prof.Especialidades || "-"}</td>
              <td>{prof.Usuarios?.[0]?.telefone || "-"}</td>
              <td>{prof.Usuarios?.[0]?.email || "-"}</td>
              <td>{prof.Registro_profissional || "-"}</td>
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
            </tr>
          ))}
        </tbody>
      </table>

      <Pagination />
    </div>
  );
}
