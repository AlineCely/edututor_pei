import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-hot-toast";
import DashboardLayout from "../layouts/DashboardLayout";
import Input from "../components/Form/Input";
import Section from "../components/Form/Section";
import Select from "../components/Form/Select";
import { supabase } from "../lib/supabase";

interface TurmaFormData {
    Nome: string;
    Descricao: string;
    Professor_ID: string;
    Data_inicio: string;
    Data_fim: string;
}

export default function TurmasForm() {
    const { id } = useParams();
    const navigate = useNavigate();
    const isEditing = !!id;

    const [professores, setProfessores] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [loadingData, setLoadingData] = useState(isEditing);
    const [alunosVinculados, setAlunosVinculados] = useState<any[]>([]);

    const [formData, setFormData] = useState<TurmaFormData>({
        Nome: '',
        Descricao: '',
        Professor_ID: '',
        Data_inicio: '',
        Data_fim: ''
    });

    useEffect(() => {
        fetchProfessores();
        if (isEditing) {
            fetchTurma();
            fetchAlunosVinculados();
        }
    }, [id]);

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

            // Formatar dados dos professores
            

            setProfessores(data || []);
        } catch (err: any) {
            console.error("Erro ao buscar professores:", err);
            toast.error("Erro ao carregar professores");
        }
    }

    async function fetchTurma() {
        if (!id) return;

        try {
            setLoadingData(true);
            const { data, error } = await supabase
                .from("Turmas")
                .select(`
          *,
          Professores:Professor_ID (
            Professor_ID,
            Usuarios:Usuario_ID (
              Nome
            )
          )
        `)
                .eq("Turma_ID", id)
                .single();

            if (error) throw error;

            if (data) {
                setFormData({
                    Nome: data.Nome || "",
                    Descricao: data.Descricao || "",
                    Professor_ID: data.Professor_ID?.toString() || "",
                    Data_inicio: data.Data_inicio || "",
                    Data_fim: data.Data_fim || ""
                });
            }
        } catch (err: any) {
            console.error("Erro ao carregar turma:", err);
            toast.error("Erro ao carregar dados da turma");
        } finally {
            setLoadingData(false);
        }
    }

    async function fetchAlunosVinculados() {
        if (!id) return;

        try {
            const { data, error } = await supabase
                .from("Alunos_Turmas")
                .select(`
                    Alunos (
                        Aluno_ID,
                        Nome
                    )
                `)
                .eq("Turma_ID", id);

            if (error) throw error;

            const alunosFormatados =
            data?.map((item: any) => item.Alunos).filter(Boolean) || [];

            setAlunosVinculados(alunosFormatados);
        } catch (err: any) {
            console.error("Erro ao buscar alunos:", err);
            toast.error("Erro ao carregar alunos vinculados");
        }
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validações
        if (!formData.Nome.trim()) {
            toast.error("O nome da turma é obrigatório");
            return;
        }

        if (!formData.Professor_ID) {
            toast.error("Selecione um professor");
            return;
        }

        if (!formData.Data_inicio) {
            toast.error("A data de início é obrigatória");
            return;
        }

        // Validar se data de fim é posterior à data de início
        if (formData.Data_fim && new Date(formData.Data_fim) < new Date(formData.Data_inicio)) {
            toast.error("A data de fim não pode ser anterior à data de início");
            return;
        }

        setLoading(true);

        try {
            const payload = {
                Nome: formData.Nome,
                Descricao: formData.Descricao,
                Professor_ID: formData.Professor_ID ? Number(formData.Professor_ID) : null,
                Data_inicio: formData.Data_inicio || null,
                Data_fim: formData.Data_fim || null
            };

            if (isEditing) {
                const { error } = await supabase
                    .from("Turmas")
                    .update(payload)
                    .eq("Turma_ID", id);

                if (error) throw error;
                toast.success('Turma atualizada com sucesso!');
            } else {
                const { error } = await supabase
                    .from("Turmas")
                    .insert(payload)
                    .select()

                if (error) throw error;
                toast.success('Turma criada com sucesso!');
            }

            navigate('/turmas');
        } catch (err: any) {
            console.error("Erro detalhado:", err);

            if (err.code === '23502') {
                if (err.message.includes('Nome')) {
                    toast.error("Erro: Nome da turma é obrigatório.");
                }
            } else if (err.code === '23505') {
                toast.error("Já existe uma turma com este nome.");
            } else if (err.code === '23503') {
                toast.error("Professor selecionado não existe.");
            } else {
                toast.error('Erro ao salvar turma: ' + (err.message || 'Erro desconhecido'));
            }
        } finally {
            setLoading(false);
        }
    };

    // Mostrar loading enquanto busca os dados
    if (loadingData) {
        return (
            <DashboardLayout>
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '200px' }}>
                    <p>Carregando dados da turma...</p>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout>
            <h1>{isEditing ? "Editar Turma" : "Nova Turma"}</h1>

            <p style={{ color: "#666" }}>
                {isEditing ? "Atualize as informações da turma abaixo." : "Preencha o formulário para adicionar uma nova turma."}
            </p>

            {/* Alert para turmas com alunos */}
            {isEditing && alunosVinculados.length > 0 && (
                <div style={{
                    background: "#fef3c7",
                    border: "1px solid #fcd34d",
                    borderRadius: "8px",
                    padding: "16px",
                    marginBottom: "20px"
                }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px" }}>
                        <span style={{ fontSize: "18px" }}>👨‍🎓</span>
                        <strong style={{ color: "#92400e" }}>Alunos Vinculados</strong>
                    </div>
                    <p style={{ margin: "0 0 10px 0", fontSize: "14px", color: "#92400e" }}>
                        Esta turma possui {alunosVinculados.length} aluno(s) vinculado(s):
                    </p>
                    <ul style={{ margin: 0, paddingLeft: "20px", fontSize: "13px", color: "#78350f" }}>
                        {alunosVinculados.map((aluno) => (
                            <li key={aluno.Aluno_ID}>
                                {aluno.Nome || `Aluno ${aluno.Aluno_ID}`}
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            <form
                onSubmit={handleSubmit}
                style={{
                    background: "#fff",
                    borderRadius: "12px",
                    padding: "24px",
                    marginTop: "24px",
                    boxShadow: "0 6px 24px rgba(0,0,0,0.04)"
                }}
            >
                {/* DADOS DA TURMA */}
                <Section title="Dados da Turma">
                    <Input
                        label="Nome da Turma *"
                        name="Nome"
                        value={formData.Nome}
                        onChange={handleChange}
                        required
                    />

                    <div style={{ gridColumn: 'span 2' }}>
                        <label style={{
                            display: 'block',
                            marginBottom: '8px',
                            fontSize: '14px',
                            color: '#374151',
                            fontWeight: '500'
                        }}>
                            Descrição
                        </label>
                        <textarea
                            name="Descricao"
                            value={formData.Descricao}
                            onChange={handleChange}
                            placeholder="Descreva os objetivos e características da turma..."
                            rows={3}
                            style={{
                                width: "100%",
                                padding: "12px",
                                borderRadius: "8px",
                                border: "1px solid #D1D5DB",
                                background: "#fff",
                                color: "#333",
                                fontSize: "14px",
                                fontFamily: "inherit",
                                resize: "vertical",
                                boxSizing: "border-box"
                            }}
                        />
                    </div>

                    <Select
                        label="Professor *"
                        name="Professor_ID"
                        value={formData.Professor_ID}
                        onChange={handleChange}
                        required
                    >
                        <option value="">Selecione um professor</option>
                        {professores.length === 0 ? (
                            <option value="" disabled>
                                Nenhum professor disponível
                            </option>
                        ) : (
                            professores.map(professor => (
                                <option key={professor.Professor_ID} value={professor.Professor_ID}>
                                    {professor.Nome}
                                </option>
                            ))
                        )}
                    </Select>
                </Section>

                {/* PERÍODO DA TURMA */}
                <Section title="Período da Turma">
                    <Input
                        label="Data de Início *"
                        name="Data_inicio"
                        type="date"
                        value={formData.Data_inicio}
                        onChange={handleChange}
                        required
                        min={new Date().toISOString().split('T')[0]}
                    />

                    <Input
                        label="Data de Fim"
                        name="Data_fim"
                        type="date"
                        value={formData.Data_fim}
                        onChange={handleChange}
                        min={formData.Data_inicio || new Date().toISOString().split('T')[0]}
                    />
                </Section>

                {/* Informações sobre datas */}
                <div style={{
                    background: '#f0f9ff',
                    padding: '16px',
                    borderRadius: '8px',
                    border: '1px solid #bae6fd',
                    marginBottom: '24px'
                }}>
                    <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                        <div style={{ fontSize: '18px', color: '#0369a1' }}>ℹ️</div>
                        <div>
                            <p style={{ margin: '0 0 8px 0', color: '#0369a1', fontWeight: '500' }}>
                                Informações sobre o período
                            </p>
                            <ul style={{
                                margin: 0,
                                paddingLeft: '20px',
                                fontSize: '13px',
                                color: '#374151'
                            }}>
                                <li>A data de início é obrigatória</li>
                                <li>A data de fim é opcional - turmas sem data de fim são consideradas ativas indefinidamente</li>
                                <li>Se não houver data de fim, a turma será considerada "Ativa"</li>
                                <li>Se a data de fim for preenchida e já passou, a turma será considerada "Finalizada"</li>
                                <li>Se a data de início for no futuro, a turma será considerada "Futura"</li>
                            </ul>
                        </div>
                    </div>
                </div>

                {/* AÇÕES */}
                <div style={{
                    display: 'flex',
                    justifyContent: 'flex-end',
                    gap: '12px',
                    marginTop: '24px'
                }}>
                    <button
                        type="button"
                        onClick={() => navigate('/turmas')}
                        style={{
                            padding: '10px 20px',
                            borderRadius: '8px',
                            border: '1px solid #ddd',
                            background: '#fff',
                            color: '#374151',
                            cursor: 'pointer',
                            fontSize: '14px',
                            fontWeight: '500',
                            transition: 'all 0.2s'
                        }}
                        disabled={loading}
                        onMouseOver={(e) => e.currentTarget.style.background = '#f9fafb'}
                        onMouseOut={(e) => e.currentTarget.style.background = '#fff'}
                    >
                        Cancelar
                    </button>
                    <button
                        type="submit"
                        style={{
                            background: '#4F46E5',
                            color: '#fff',
                            borderRadius: '8px',
                            padding: '10px 20px',
                            border: 'none',
                            cursor: 'pointer',
                            fontSize: '14px',
                            fontWeight: '500',
                            transition: 'all 0.2s'
                        }}
                        disabled={loading}
                        onMouseOver={(e) => e.currentTarget.style.background = '#4338CA'}
                        onMouseOut={(e) => e.currentTarget.style.background = '#4F46E5'}
                    >
                        {loading ? 'Salvando...' : isEditing ? 'Atualizar' : 'Salvar Turma'}
                    </button>
                </div>
            </form>
        </DashboardLayout>
    );
}