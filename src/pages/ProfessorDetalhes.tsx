import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import DashboardLayout from "../layouts/DashboardLayout";
import { supabase } from "../lib/supabase";

interface Usuario {
    nome: string;
    email: string;
    telefone: number;
    perfil: string;
}

interface Professor {
    Professor_ID: number;
    Especialidades: string;
    Biografia: string;
    Formacao: string;
    Experiencia: string;
    Valor_hora: number;
    Media: number | null;
    Total_aulas: number;
    Registro_profissional: string;
    Usuarios: Usuario[];
}

export default function ProfessorDetalhes() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [professor, setProfessor] = useState<Professor | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function carregarProfessor() {
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
                .eq("Professor_ID", id)
                .single();

            if (!error && data) {
                setProfessor(data);
            } else {
                console.error("Erro ao carregar professor:", error);
            }
            setLoading(false);
        }

        carregarProfessor();
    }, [id]);

    if (loading) return <DashboardLayout><p>Carregando...</p></DashboardLayout>;
    if (!professor) return <DashboardLayout><p>Professor não encontrado</p></DashboardLayout>;

    const usuario = professor.Usuarios?.[0] || {
        nome: "",
        email: "",
        telefone: "",
        perfil: ""
    };

    return (
        <DashboardLayout>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <h1>Detalhes do Profissional</h1>
                <button onClick={() => navigate(`/profissionais/${id}/editar`)}>
                    Editar
                </button>
            </div>

            {/* DADOS PRINCIPAIS */}
            <div
                style={{
                    background: "#fff",
                    borderRadius: "12px",
                    padding: "24px",
                    marginTop: "24px",
                    boxShadow: "0 6px 24px rgba(0,0,0,0.04)"
                }}
            >
                <h3>Dados Gerais</h3>

                <p><strong>Nome:</strong> {usuario.nome}</p>
                <p><strong>Email:</strong> {usuario.email}</p>
                <p><strong>Telefone:</strong> {usuario.telefone}</p>
                <p><strong>Perfil:</strong> {usuario.perfil}</p>
                <p><strong>Registro Profissional:</strong> {professor.Registro_profissional}</p>

                <hr />

                <p><strong>Especialidades:</strong> {professor.Especialidades || "-"}</p>
                <p><strong>Formação:</strong> {professor.Formacao || "-"}</p>
                <p><strong>Experiência:</strong> {professor.Experiencia || "-"}</p>

                <p><strong>Valor por Hora:</strong> R$ {professor.Valor_hora?.toFixed(2)}</p>
                <p><strong>Avaliação Média:</strong> ⭐ {professor.Media ?? "Sem avaliação"}</p>
                <p><strong>Total de Aulas:</strong> {professor.Total_aulas}</p>
            </div>

            {/* BIOGRAFIA */}
            <div
                style={{
                    background: "#fff",
                    borderRadius: "12px",
                    padding: "24px",
                    marginTop: "24px"
                }}
            >
                <h3>Biografia</h3>
                <p>{professor.Biografia || "Não informado"}</p>
            </div>

            {/* ALUNOS / PEI */}
            <div
                style={{
                    background: "#fff",
                    borderRadius: "12px",
                    padding: "24px",
                    marginTop: "24px"
                }}
            >
                <h3>Alunos Acompanhados</h3>
                <p style={{ color: "#666" }}>
                    Relação Profissional × Aluno × PEI
                </p>

                {/* Placeholder – depois liga no Professor_Aluno_PEI */}
                <table style={{ width: "100%", marginTop: "12px" }}>
                    <thead>
                        <tr>
                            <th>Aluno</th>
                            <th>PEI</th>
                            <th>Ação</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>Ana Clara</td>
                            <td>PEI Ativo</td>
                            <td>
                                <button>Ver PEI</button>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </DashboardLayout>
    );
}
