import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-hot-toast";
import DashboardLayout from "../layouts/DashboardLayout";
import Section from "../components/Form/Section";
import Select from "../components/Form/Select";
import { supabase } from "../lib/supabase";

interface AvaliacaoFormData {
    Professor_ID: string;
    Aula_ID: string;
    Nota: string;
    Comentario: string;
}

export default function AvaliacoesForm() {
    const { id } = useParams();
    const navigate = useNavigate();
    const isEditing = !!id;

    const [professores, setProfessores] = useState<any[]>([]);
    const [aulas, setAulas] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [loadingData, setLoadingData] = useState(isEditing);
    const [selectedProfessorAulas, setSelectedProfessorAulas] = useState<any[]>([]);
    const [selectedAulaInfo, setSelectedAulaInfo] = useState<any>(null);

    const [formData, setFormData] = useState<AvaliacaoFormData>({
        Professor_ID: '',
        Aula_ID: '',
        Nota: '5',
        Comentario: ''
    });

    const notaOptions = [
        { value: "1", label: "1 ⭐ (Muito Ruim)" },
        { value: "2", label: "2 ⭐⭐ (Ruim)" },
        { value: "3", label: "3 ⭐⭐⭐ (Regular)" },
        { value: "4", label: "4 ⭐⭐⭐⭐ (Bom)" },
        { value: "5", label: "5 ⭐⭐⭐⭐⭐ (Muito Bom)" },
        { value: "6", label: "6 ⭐⭐⭐⭐⭐⭐ (Excelente)" },
        { value: "7", label: "7 ⭐⭐⭐⭐⭐⭐⭐ (Ótimo)" },
        { value: "8", label: "8 ⭐⭐⭐⭐⭐⭐⭐⭐ (Excelente)" },
        { value: "9", label: "9 ⭐⭐⭐⭐⭐⭐⭐⭐⭐ (Excepcional)" },
        { value: "10", label: "10 ⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐ (Perfeito)" }
    ];

    useEffect(() => {
        fetchProfessores();
        fetchAulas();
        if (isEditing) {
            fetchAvaliacao();
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

            const professoresFormatados = data?.map(prof => ({
                Professor_ID: prof.Professor_ID,
                Nome: prof.Usuarios?.Nome || "Professor sem nome"
            })) || [];

            setProfessores(professoresFormatados);
        } catch (err: any) {
            console.error("Erro ao buscar professores:", err);
            toast.error("Erro ao carregar professores");
        }
    }

    async function fetchAulas() {
        try {
            const { data, error } = await supabase
                .from("Aulas")
                .select(`
          Aula_ID,
          Data_hora_inicio,
          Professores:Professor_ID (
            Professor_ID
          ),
          Disciplinas:Disciplina_ID (
            Nome
          )
        `)
                .order("Data_hora_inicio", { ascending: false });

            if (error) throw error;
            setAulas(data || []);
        } catch (err: any) {
            console.error("Erro ao buscar aulas:", err);
            toast.error("Erro ao carregar aulas");
        }
    }

    async function fetchAvaliacao() {
        if (!id) return;

        try {
            setLoadingData(true);
            const { data, error } = await supabase
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
        `)
                .eq("Avaliacao_ID", id)
                .single();

            if (error) throw error;

            if (data) {
                setFormData({
                    Professor_ID: data.Professor_ID?.toString() || "",
                    Aula_ID: data.Aula_ID?.toString() || "",
                    Nota: data.Nota?.toString() || "5",
                    Comentario: data.Comentario || ""
                });

                // Se já tiver professor selecionado, filtrar aulas
                if (data.Professor_ID) {
                    const aulasDoProfessor = aulas.filter(aula =>
                        aula.Professores?.Professor_ID === data.Professor_ID
                    );
                    setSelectedProfessorAulas(aulasDoProfessor);
                }

                // Se já tiver aula selecionada, buscar informações
                if (data.Aula_ID) {
                    const aulaSelecionada = aulas.find(a => a.Aula_ID === data.Aula_ID);
                    setSelectedAulaInfo(aulaSelecionada);
                }
            }
        } catch (err: any) {
            console.error("Erro ao carregar avaliação:", err);
            toast.error("Erro ao carregar dados da avaliação");
        } finally {
            setLoadingData(false);
        }
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;

        if (name === "Professor_ID") {
            // Filtrar aulas do professor selecionado
            const aulasDoProfessor = aulas.filter(aula =>
                aula.Professores?.Professor_ID === parseInt(value)
            );
            setSelectedProfessorAulas(aulasDoProfessor);

            // Limpar aula selecionada se mudar o professor
            if (formData.Aula_ID) {
                const aulaSelecionada = aulasDoProfessor.find(a => a.Aula_ID === parseInt(formData.Aula_ID));
                if (!aulaSelecionada) {
                    setFormData(prev => ({
                        ...prev,
                        Aula_ID: ''
                    }));
                    setSelectedAulaInfo(null);
                }
            }
        }

        if (name === "Aula_ID") {
            const aulaSelecionada = aulas.find(a => a.Aula_ID === parseInt(value));
            setSelectedAulaInfo(aulaSelecionada);
        }

        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    // Renderizar estrelas para visualização
    const renderStars = (nota: string) => {
        const notaNum = parseInt(nota);
        const stars = [];

        for (let i = 1; i <= 10; i++) {
            stars.push(
                <span
                    key={i}
                    style={{
                        color: i <= notaNum ? "#f59e0b" : "#d1d5db",
                        fontSize: "24px",
                        marginRight: "4px",
                        transition: "color 0.3s"
                    }}
                >
                    ★
                </span>
            );
        }

        return (
            <div style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
                margin: "20px 0"
            }}>
                {stars}
                <span style={{
                    fontSize: "18px",
                    fontWeight: "600",
                    color: "#1f2937",
                    marginLeft: "12px"
                }}>
                    {notaNum}/10
                </span>
            </div>
        );
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validações
        if (!formData.Professor_ID) {
            toast.error("Selecione um professor");
            return;
        }

        if (!formData.Aula_ID) {
            toast.error("Selecione uma aula");
            return;
        }

        if (!formData.Nota) {
            toast.error("Selecione uma nota");
            return;
        }

        setLoading(true);

        try {
            const payload = {
                Professor_ID: formData.Professor_ID ? Number(formData.Professor_ID) : null,
                Aula_ID: formData.Aula_ID ? Number(formData.Aula_ID) : null,
                Nota: formData.Nota ? Number(formData.Nota) : null,
                Comentario: formData.Comentario || null
            };

            if (isEditing) {
                const { error } = await supabase
                    .from("Avaliacoes")
                    .update(payload)
                    .eq("Avaliacao_ID", id);

                if (error) throw error;
                toast.success('Avaliação atualizada com sucesso!');
            } else {
                const { error } = await supabase
                    .from("Avaliacoes")
                    .insert(payload);

                if (error) throw error;
                toast.success('Avaliação registrada com sucesso!');
            }

            navigate('/avaliacoes');
        } catch (err: any) {
            console.error("Erro detalhado:", err);

            if (err.code === '23503') {
                if (err.message.includes('Professor_ID')) {
                    toast.error("Professor selecionado não existe.");
                } else if (err.message.includes('Aula_ID')) {
                    toast.error("Aula selecionada não existe.");
                }
            } else if (err.code === '23505') {
                toast.error("Esta aula já possui uma avaliação.");
            } else {
                toast.error('Erro ao salvar avaliação: ' + (err.message || 'Erro desconhecido'));
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
                    <p>Carregando dados da avaliação...</p>
                </div>
            </DashboardLayout>
        );
    }

    // Formatar data da aula
    const formatDateAula = (dateString: string | null) => {
        if (!dateString) return "Data não informada";
        const date = new Date(dateString);
        return date.toLocaleDateString("pt-BR", {
            day: "2-digit",
            month: "long",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit"
        });
    };

    return (
        <DashboardLayout>
            <h1>{isEditing ? "Editar Avaliação" : "Nova Avaliação"}</h1>

            <p style={{ color: "#666" }}>
                {isEditing
                    ? "Atualize as informações da avaliação abaixo."
                    : "Avalie o desempenho do professor em uma aula específica."}
            </p>

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
                {/* SELEÇÃO DE PROFESSOR E AULA */}
                <Section title="Professor e Aula">
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

                    <Select
                        label="Aula *"
                        name="Aula_ID"
                        value={formData.Aula_ID}
                        onChange={handleChange}
                        required
                        disabled={!formData.Professor_ID}
                    >
                        <option value="">Selecione uma aula</option>
                        {!formData.Professor_ID ? (
                            <option value="" disabled>
                                Selecione primeiro um professor
                            </option>
                        ) : selectedProfessorAulas.length === 0 ? (
                            <option value="" disabled>
                                Nenhuma aula encontrada para este professor
                            </option>
                        ) : (
                            selectedProfessorAulas.map(aula => (
                                <option key={aula.Aula_ID} value={aula.Aula_ID}>
                                    Aula #{aula.Aula_ID} - {formatDateAula(aula.Data_hora_inicio)} - {aula.Disciplinas?.Nome || "Sem disciplina"}
                                </option>
                            ))
                        )}
                    </Select>
                </Section>

                {/* INFORMAÇÕES DA AULA SELECIONADA */}
                {selectedAulaInfo && (
                    <div style={{
                        background: '#f0f9ff',
                        padding: '16px',
                        borderRadius: '8px',
                        border: '1px solid #bae6fd',
                        marginBottom: '24px'
                    }}>
                        <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                            <div style={{ fontSize: '18px', color: '#0369a1' }}>📚</div>
                            <div>
                                <p style={{ margin: '0 0 8px 0', color: '#0369a1', fontWeight: '500' }}>
                                    Informações da Aula
                                </p>
                                <div style={{
                                    display: 'grid',
                                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                                    gap: '12px',
                                    fontSize: '13px',
                                    color: '#374151'
                                }}>
                                    <div>
                                        <strong>Data:</strong> {formatDateAula(selectedAulaInfo.Data_hora_inicio)}
                                    </div>
                                    <div>
                                        <strong>Disciplina:</strong> {selectedAulaInfo.Disciplinas?.Nome || "Não informada"}
                                    </div>
                                    <div>
                                        <strong>ID da Aula:</strong> #{selectedAulaInfo.Aula_ID}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* AVALIAÇÃO */}
                <Section title="Avaliação">
                    <div style={{ gridColumn: 'span 2' }}>
                        <label style={{
                            display: 'block',
                            marginBottom: '8px',
                            fontSize: '14px',
                            color: '#374151',
                            fontWeight: '500'
                        }}>
                            Nota do Professor *
                        </label>

                        {/* Visualização das estrelas */}
                        {renderStars(formData.Nota)}

                        <select
                            name="Nota"
                            value={formData.Nota}
                            onChange={handleChange}
                            required
                            style={{
                                width: "100%",
                                padding: "12px",
                                borderRadius: "8px",
                                border: "1px solid #D1D5DB",
                                background: "#fff",
                                color: "#333",
                                fontSize: "14px",
                                cursor: "pointer",
                                marginTop: "16px"
                            }}
                        >
                            {notaOptions.map((option, idx) => (
                                <option key={idx} value={option.value}>{option.label}</option>
                            ))}
                        </select>

                        <div style={{
                            marginTop: "8px",
                            fontSize: "12px",
                            color: "#6b7280",
                            display: "flex",
                            justifyContent: "space-between"
                        }}>
                            <span>1 ⭐ (Muito Ruim)</span>
                            <span>10 ⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐ (Perfeito)</span>
                        </div>
                    </div>

                    <div style={{ gridColumn: 'span 2' }}>
                        <label style={{
                            display: 'block',
                            marginBottom: '8px',
                            fontSize: '14px',
                            color: '#374151',
                            fontWeight: '500'
                        }}>
                            Comentário
                        </label>
                        <textarea
                            name="Comentario"
                            value={formData.Comentario}
                            onChange={handleChange}
                            placeholder="Descreva sua experiência, pontos fortes, áreas de melhoria, sugestões..."
                            rows={5}
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
                        <div style={{
                            marginTop: "4px",
                            fontSize: "12px",
                            color: "#6b7280",
                            textAlign: "right"
                        }}>
                            {formData.Comentario.length}/500 caracteres
                        </div>
                    </div>
                </Section>

                {/* Dicas de Avaliação */}
                <div style={{
                    background: '#fef3c7',
                    padding: '16px',
                    borderRadius: '8px',
                    border: '1px solid #fcd34d',
                    marginBottom: '24px'
                }}>
                    <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                        <div style={{ fontSize: '18px', color: '#92400e' }}>💡</div>
                        <div>
                            <p style={{ margin: '0 0 8px 0', color: '#92400e', fontWeight: '500' }}>
                                Dicas para uma boa avaliação
                            </p>
                            <ul style={{
                                margin: 0,
                                paddingLeft: '20px',
                                fontSize: '13px',
                                color: '#78350f'
                            }}>
                                <li>Seja específico e construtivo</li>
                                <li>Mencione pontos fortes e áreas de melhoria</li>
                                <li>Relacione a avaliação com a aula específica</li>
                                <li>Evite comentários genéricos ou pessoais</li>
                                <li>Sugira melhorias quando possível</li>
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
                        onClick={() => navigate('/avaliacoes')}
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
                        {loading ? 'Salvando...' : isEditing ? 'Atualizar Avaliação' : 'Salvar Avaliação'}
                    </button>
                </div>
            </form>
        </DashboardLayout>
    );
}