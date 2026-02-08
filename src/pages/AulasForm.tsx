import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-hot-toast";
import DashboardLayout from "../layouts/DashboardLayout";
import Input from "../components/Form/Input";
import Section from "../components/Form/Section";
import { supabase } from "../lib/supabase";

interface AulaFormData {
    Professor_ID: string;
    Disciplina_ID: string;
    Data_hora_inicio: string;
    Data_hora_fim: string;
    Status: string;
    Descricao: string;
    Link_reuniao: string;
}

interface Professor {
    Professor_ID: number;
    Nome: string;
}

interface Disciplina {
    Disciplina_ID: number;
    Nome: string;
    Status?: string;
}

// interface ProfessorDB {
//     Professor_ID: number;
//     Usuarios: {
//         Nome: string;
//     } | null;
// }

export default function AulasForm() {
    const { id } = useParams();
    const navigate = useNavigate();
    const isEditing = !!id;

    const [professores, setProfessores] = useState<Professor[]>([]);
    const [disciplinas, setDisciplinas] = useState<Disciplina[]>([]);
    const [loading, setLoading] = useState(false);
    const [loadingData, setLoadingData] = useState(isEditing);
    const [loadingProfessores, setLoadingProfessores] = useState(true);
    const [loadingDisciplinas, setLoadingDisciplinas] = useState(true);

    const [formData, setFormData] = useState<AulaFormData>({
        Professor_ID: '',
        Disciplina_ID: '',
        Data_hora_inicio: '',
        Data_hora_fim: '',
        Status: 'agendada',
        Descricao: '',
        Link_reuniao: ''
    });

    const statusOptions = [
        { value: "agendada", label: "Agendada" },
        { value: "em_andamento", label: "Em Andamento" },
        { value: "realizada", label: "Realizada" },
        { value: "cancelada", label: "Cancelada" },
        { value: "adiada", label: "Adiada" }
    ];

    useEffect(() => {
        fetchProfessores();
        fetchDisciplinas();
        if (isEditing) {
            fetchAula();
        }
    }, [id]);

    async function fetchProfessores() {
        try {
            setLoadingProfessores(true);
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

            const professoresFormatados: Professor[] = (data as any[] || []).map(prof => ({
                Professor_ID: prof.Professor_ID,
                Nome: prof.Usuarios?.Nome || "Professor sem nome"
            })) || [];

            setProfessores(professoresFormatados);
        } catch (err: any) {
            console.error("Erro ao buscar professores:", err);
            toast.error("Erro ao carregar professores");
        } finally {
            setLoadingProfessores(false);
        }
    }

    async function fetchDisciplinas() {
        try {
            setLoadingDisciplinas(true);
            console.log("Buscando disciplinas...");
            const { data, error } = await supabase
                .from("Disciplinas")
                .select("Disciplina_ID, Nome, Status")
                .or("Status.eq.Ativo,Status.is.null")
                .order("Nome");
                if (error) throw error;
                console.log("Disciplinas carregadas:", data);

                // Converter os dados do formato do Supabase para nosso formato
            const disciplinasFormatadas = (data || []).map(disc => ({
                Disciplina_ID: disc.Disciplina_ID,
                Nome: disc.Nome,
                Status: disc.Status || undefined
            }));
            setDisciplinas(disciplinasFormatadas);
        } catch (err: any) {
            console.error("Erro ao buscar disciplinas:", err);
            toast.error("Erro ao carregar disciplinas");
        } finally {
            setLoadingDisciplinas(false);
        }
    }

    async function fetchAula() {
        if (!id) return;

        try {
            setLoadingData(true);
            const { data, error } = await supabase
                .from("Aulas")
                .select(`
          *,
          Professores:Professor_ID (
            Professor_ID,
            Usuarios:Usuario_ID (
              Nome
            )
          ),
          Disciplinas:Disciplina_ID (
            Nome
          )
        `)
                .eq("Aula_ID", id)
                .single();

            if (error) throw error;

            if (data) {
                // Formatar datas para input datetime-local
                const formatDateTimeForInput = (dateTimeString: string | null) => {
                    if (!dateTimeString) return "";
                    const date = new Date(dateTimeString);
                    // Ajustar para fuso horário local
                    const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
                    return localDate.toISOString().slice(0, 16);
                };

                setFormData({
                    Professor_ID: data.Professor_ID?.toString() || "",
                    Disciplina_ID: data.Disciplina_ID?.toString() || "",
                    Data_hora_inicio: formatDateTimeForInput(data.Data_hora_inicio),
                    Data_hora_fim: formatDateTimeForInput(data.Data_hora_fim),
                    Status: data.Status || "agendada",
                    Descricao: data.Descricao || "",
                    Link_reuniao: data.Link_reuniao || ""
                });
            }
        } catch (err: any) {
            console.error("Erro ao carregar aula:", err);
            toast.error("Erro ao carregar dados da aula");
        } finally {
            setLoadingData(false);
        }
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));

        // Se Data_hora_inicio mudar, ajustar Data_hora_fim para 1 hora depois
        if (name === "Data_hora_inicio" && value && !formData.Data_hora_fim) {
            const inicioDate = new Date(value);
            const fimDate = new Date(inicioDate.getTime() + 60 * 60 * 1000); // +1 hora
            const formattedFim = fimDate.toISOString().slice(0, 16);
            setFormData(prev => ({
                ...prev,
                Data_hora_fim: formattedFim
            }));
        }
    };

    const validateForm = () => {
        if (!formData.Professor_ID) {
            toast.error("Selecione um professor");
            return false;
        }

        if (!formData.Disciplina_ID) {
            toast.error("Selecione uma disciplina");
            return false;
        }

        if (!formData.Data_hora_inicio) {
            toast.error("Informe a data e hora de início");
            return false;
        }

        if (!formData.Data_hora_fim) {
            toast.error("Informe a data e hora de término");
            return false;
        }

        const inicio = new Date(formData.Data_hora_inicio);
        const fim = new Date(formData.Data_hora_fim);

        if (fim <= inicio) {
            toast.error("A data/hora de término deve ser posterior à data/hora de início");
            return false;
        }

        // Verificar se aula não está no passado (para novas aulas)
        if (!isEditing && inicio < new Date()) {
            toast.error("Não é possível agendar aulas no passado");
            return false;
        }

        return true;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        // Verificar se tem professores e disciplinas antes de submeter
        if (professores.length === 0) {
            toast.error("Nenhum professor disponível. Cadastre um professor primeiro.");
            return;
        }

        if (disciplinas.length === 0) {
            toast.error("Nenhuma disciplina disponível. Cadastre uma disciplina primeiro.");
            return;
        }

        setLoading(true);

        try {
            const payload = {
                Professor_ID: formData.Professor_ID ? Number(formData.Professor_ID) : null,
                Disciplina_ID: formData.Disciplina_ID ? Number(formData.Disciplina_ID) : null,
                Data_hora_inicio: formData.Data_hora_inicio || null,
                Data_hora_fim: formData.Data_hora_fim || null,
                Status: formData.Status,
                Descricao: formData.Descricao || null,
                Link_reuniao: formData.Link_reuniao || null
            };

            if (isEditing) {
                const { error } = await supabase
                    .from("Aulas")
                    .update(payload)
                    .eq("Aula_ID", id);

                if (error) throw error;
                toast.success('Aula atualizada com sucesso!');
            } else {
                const { error } = await supabase
                    .from("Aulas")
                    .insert(payload);

                if (error) throw error;
                toast.success('Aula agendada com sucesso!');
            }

            navigate('/aulas');
        } catch (err: any) {
            console.error("Erro detalhado:", err);

            if (err.code === '23503') {
                if (err.message.includes('Professor_ID')) {
                    toast.error("Professor selecionado não existe.");
                } else if (err.message.includes('Disciplina_ID')) {
                    toast.error("Disciplina selecionada não existe.");
                }
            } else if (err.code === '23514') {
                toast.error("Erro de validação: verifique as datas e horários.");
            } else {
                toast.error('Erro ao salvar aula: ' + (err.message || 'Erro desconhecido'));
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
                    <p>Carregando dados da aula...</p>
                </div>
            </DashboardLayout>
        );
    }

    // Calcular duração sugerida
    const calcularDuracao = () => {
        if (!formData.Data_hora_inicio || !formData.Data_hora_fim) return "0 min";

        const inicio = new Date(formData.Data_hora_inicio);
        const fim = new Date(formData.Data_hora_fim);
        const diffMs = fim.getTime() - inicio.getTime();
        const diffMinutos = Math.floor(diffMs / (1000 * 60));

        if (diffMinutos < 60) return `${diffMinutos} min`;
        const horas = Math.floor(diffMinutos / 60);
        const minutos = diffMinutos % 60;
        return `${horas}h${minutos > 0 ? ` ${minutos}min` : ''}`;
    };

    return (
        <DashboardLayout>
            <h1>{isEditing ? "Editar Aula" : "Agendar Nova Aula"}</h1>

            <p style={{ color: "#666" }}>
                {isEditing
                    ? "Atualize as informações da aula abaixo."
                    : "Preencha o formulário para agendar uma nova aula."}
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
                {/* INFORMAÇÕES BÁSICAS */}
                <Section title="Informações Básicas">
                    <div>
                        <label style={{
                            display: 'block',
                            marginBottom: '8px',
                            fontSize: '14px',
                            color: '#374151',
                            fontWeight: '500'
                        }}>
                            Professor *
                        </label>
                        <select
                            name="Professor_ID"
                            value={formData.Professor_ID}
                            onChange={handleChange}
                            required
                            style={{
                                width: "100%",
                                padding: "12px 16px",
                                borderRadius: "8px",
                                border: "1px solid #d1d5db",
                                backgroundColor: "#fff",
                                color: "#374151",
                                fontSize: "14px",
                                cursor: "pointer",
                                boxSizing: "border-box"
                            }}
                            disabled={loadingProfessores}
                        >
                            <option value="">{loadingProfessores ? "Carregando professores..." : "Selecione um professor"}</option>
                            {professores.length === 0 && !loadingProfessores ? (
                                <option value="" disabled>
                                    Nenhum professor cadastrado
                                </option>
                            ) : (
                                professores.map(professor => (
                                    <option key={professor.Professor_ID} value={professor.Professor_ID}>
                                        {professor.Nome}
                                    </option>
                                ))
                            )}
                        </select>
                        {professores.length === 0 && !loadingProfessores && (
                            <p style={{ fontSize: '12px', color: '#dc2626', marginTop: '4px' }}>
                                ⚠️ Cadastre um professor primeiro para agendar aulas.
                            </p>
                        )}
                    </div>

                    <div>
                        <label style={{
                            display: 'block',
                            marginBottom: '8px',
                            fontSize: '14px',
                            color: '#374151',
                            fontWeight: '500'
                        }}>
                            Disciplina *
                        </label>
                        <select
                            name="Disciplina_ID"
                            value={formData.Disciplina_ID}
                            onChange={handleChange}
                            required
                            style={{
                                width: "100%",
                                padding: "12px 16px",
                                borderRadius: "8px",
                                border: "1px solid #d1d5db",
                                backgroundColor: "#fff",
                                color: "#374151",
                                fontSize: "14px",
                                cursor: "pointer",
                                boxSizing: "border-box"
                            }}
                            disabled={loadingDisciplinas}
                        >
                            <option value="">{loadingDisciplinas ? "Carregando disciplinas..." : "Selecione uma disciplina"}</option>
                            {disciplinas.length === 0 && !loadingDisciplinas ? (
                                <option value="" disabled>
                                    Nenhuma disciplina cadastrada
                                </option>
                            ) : (
                                disciplinas.map(disciplina => (
                                    <option key={disciplina.Disciplina_ID} value={disciplina.Disciplina_ID}>
                                        {disciplina.Nome} {disciplina.Status === "inativa" ? "(Inativa)" : ""}
                                    </option>
                                ))
                            )}
                        </select>
                        {disciplinas.length === 0 && !loadingDisciplinas && (
                            <p style={{ fontSize: '12px', color: '#dc2626', marginTop: '4px' }}>
                                ⚠️ Cadastre uma disciplina primeiro para agendar aulas.
                            </p>
                        )}
                        {disciplinas.length > 0 && !loadingDisciplinas && (
                            <p style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px' }}>
                                {disciplinas.length} disciplina(s) disponível(is)
                            </p>
                        )}
                    </div>

                    <div>
                        <label style={{
                            display: 'block',
                            marginBottom: '8px',
                            fontSize: '14px',
                            color: '#374151',
                            fontWeight: '500'
                        }}>
                            Status *
                        </label>
                        <select
                            name="Status"
                            value={formData.Status}
                            onChange={handleChange}
                            required
                            style={{
                                width: "100%",
                                padding: "12px 16px",
                                borderRadius: "8px",
                                border: "1px solid #d1d5db",
                                backgroundColor: "#fff",
                                color: "#374151",
                                fontSize: "14px",
                                cursor: "pointer",
                                boxSizing: "border-box"
                            }}
                        >
                            {statusOptions.map((status, idx) => (
                                <option key={idx} value={status.value}>{status.label}</option>
                            ))}
                        </select>
                    </div>
                </Section>

                {/* DATA E HORÁRIO */}
                <Section title="Data e Horário">
                    <Input
                        label="Data e Hora de Início *"
                        name="Data_hora_inicio"
                        type="datetime-local"
                        value={formData.Data_hora_inicio}
                        onChange={handleChange}
                        required
                        min={new Date().toISOString().slice(0, 16)}
                    />

                    <Input
                        label="Data e Hora de Término *"
                        name="Data_hora_fim"
                        type="datetime-local"
                        value={formData.Data_hora_fim}
                        onChange={handleChange}
                        required
                        min={formData.Data_hora_inicio || new Date().toISOString().slice(0, 16)}
                    />

                    <div>
                        <label style={{
                            display: 'block',
                            marginBottom: '8px',
                            fontSize: '14px',
                            color: '#374151',
                            fontWeight: '500'
                        }}>
                            Duração
                        </label>
                        <div style={{
                            padding: "12px",
                            borderRadius: "8px",
                            border: "1px solid #d1d5db",
                            background: "#f9fafb",
                            color: "#374151",
                            fontSize: "14px",
                            fontWeight: "500"
                        }}>
                            {formData.Data_hora_inicio && formData.Data_hora_fim
                                ? calcularDuracao()
                                : "Preencha as datas para calcular a duração"}
                        </div>
                    </div>
                </Section>

                {/* DESCRIÇÃO E LINK */}
                <Section title="Detalhes da Aula">
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
                            placeholder="Descreva o conteúdo, objetivos ou observações da aula..."
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

                    <div style={{ gridColumn: 'span 2' }}>
                        <div>
                            <label style={{
                                display: 'block',
                                marginBottom: '8px',
                                fontSize: '14px',
                                color: '#374151',
                                fontWeight: '500'
                            }}>
                                Link da Reunião (Zoom, Meet, etc.)
                            </label>
                            <input
                                type="url"
                                name="Link_reuniao"
                                value={formData.Link_reuniao}
                                onChange={handleChange}
                                placeholder="https://meet.google.com/abc-defg-hij"
                                style={{
                                    width: "100%",
                                    padding: "12px",
                                    borderRadius: "8px",
                                    border: "1px solid #D1D5DB",
                                    background: "#fff",
                                    color: "#333",
                                    fontSize: "14px",
                                    boxSizing: "border-box"
                                }}
                            />
                        </div>
                        {formData.Link_reuniao && (
                            <div style={{
                                marginTop: "8px",
                                fontSize: "12px",
                                color: "#059669",
                                display: "flex",
                                alignItems: "center",
                                gap: "6px"
                            }}>
                                <span>🔗</span>
                                <a
                                    href={formData.Link_reuniao}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    style={{ color: "#059669", textDecoration: "underline" }}
                                >
                                    Testar link
                                </a>
                            </div>
                        )}
                    </div>
                </Section>

                {/* Informações */}
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
                                Informações importantes
                            </p>
                            <ul style={{
                                margin: 0,
                                paddingLeft: '20px',
                                fontSize: '13px',
                                color: '#374151'
                            }}>
                                <li>Aulas com status <strong>Agendada</strong> aparecem no calendário</li>
                                <li>Aulas <strong>Em Andamento</strong> podem ser iniciadas via link</li>
                                <li>Aulas <strong>Realizadas</strong> são mantidas para histórico</li>
                                <li>Links de reunião são gerados automaticamente em algumas plataformas</li>
                                <li>Verifique a disponibilidade do professor no horário selecionado</li>
                            </ul>
                        </div>
                    </div>
                </div>

                {/* Botões de ação com verificação de dados */}
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    gap: '12px',
                    marginTop: '24px',
                    paddingTop: '16px',
                    borderTop: '1px solid #e5e7eb'
                }}>
                    <div style={{ fontSize: '12px', color: '#6b7280' }}>
                        {professores.length === 0 ? (
                            <span style={{ color: '#dc2626' }}>⚠️ Nenhum professor cadastrado</span>
                        ) : disciplinas.length === 0 ? (
                            <span style={{ color: '#dc2626' }}>⚠️ Nenhuma disciplina cadastrada</span>
                        ) : (
                            <span>✅ {professores.length} professor(es) e {disciplinas.length} disciplina(s) disponíveis</span>
                        )}
                    </div>

                    <div style={{ display: 'flex', gap: '12px' }}>
                        <button
                            type="button"
                            onClick={() => navigate('/aulas')}
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
                                background: professores.length === 0 || disciplinas.length === 0 ? '#9ca3af' : '#4F46E5',
                                color: '#fff',
                                borderRadius: '8px',
                                padding: '10px 20px',
                                border: 'none',
                                cursor: professores.length === 0 || disciplinas.length === 0 ? 'not-allowed' : 'pointer',
                                fontSize: '14px',
                                fontWeight: '500',
                                transition: 'all 0.2s'
                            }}
                            disabled={loading || professores.length === 0 || disciplinas.length === 0}
                            onMouseOver={(e) => {
                                if (professores.length > 0 && disciplinas.length > 0) {
                                    e.currentTarget.style.background = '#4338CA';
                                }
                            }}
                            onMouseOut={(e) => {
                                if (professores.length > 0 && disciplinas.length > 0) {
                                    e.currentTarget.style.background = '#4F46E5';
                                }
                            }}
                        >
                            {loading ? 'Salvando...' : isEditing ? 'Atualizar Aula' : 'Agendar Aula'}
                        </button>
                    </div>
                </div>
            </form>
        </DashboardLayout>
    );
}