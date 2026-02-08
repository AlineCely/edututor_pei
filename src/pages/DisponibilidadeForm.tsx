import { useState, useEffect } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { toast } from "react-hot-toast";
import DashboardLayout from "../layouts/DashboardLayout";
import Section from "../components/Form/Section";
import Select from "../components/Form/Select";
import Input from "../components/Form/Input";
import { supabase } from "../lib/supabase";

interface DisponibilidadeFormData {
    Professor_ID: string;
    Dia_semana: string;
    Hora_inicio: string;
    Hora_fim: string;
    Status: string;
}

export default function DisponibilidadeForm() {
    const { id } = useParams();
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const isEditing = !!id;

    const [professores, setProfessores] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [loadingData, setLoadingData] = useState(isEditing);
    const [duracao, setDuracao] = useState<string>("");

    const diasSemana = [
        "Segunda-feira",
        "Terça-feira",
        "Quarta-feira",
        "Quinta-feira",
        "Sexta-feira",
        "Sábado",
        "Domingo"
    ];

    const statusOptions = [
        { value: "ativo", label: "Ativo" },
        { value: "inativo", label: "Inativo" },
        { value: "temporario", label: "Temporário" }
    ];

    const [formData, setFormData] = useState<DisponibilidadeFormData>({
        Professor_ID: searchParams.get("professor") || '',
        Dia_semana: '',
        Hora_inicio: '08:00',
        Hora_fim: '09:00',
        Status: 'ativo'
    });

    // Horários sugeridos (de 30 em 30 minutos)
    const horariosSugeridos = Array.from({ length: 48 }, (_, i) => {
        const hora = Math.floor(i / 2);
        const minutos = i % 2 === 0 ? '00' : '30';
        return `${hora.toString().padStart(2, '0')}:${minutos}`;
    });

    useEffect(() => {
        fetchProfessores();
        if (isEditing) {
            fetchDisponibilidade();
        }
    }, [id]);

    // Atualizar duração quando horários mudam
    useEffect(() => {
        calcularDuracao();
    }, [formData.Hora_inicio, formData.Hora_fim]);

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

    async function fetchDisponibilidade() {
        if (!id) return;

        try {
            setLoadingData(true);
            const { data, error } = await supabase
                .from("Disponibilidade")
                .select(`
          *,
          Professores:Professor_ID (
            Professor_ID,
            Usuarios:Usuario_ID (
              Nome
            )
          )
        `)
                .eq("Disponibilidade_ID", id)
                .single();

            if (error) throw error;

            if (data) {
                setFormData({
                    Professor_ID: data.Professor_ID?.toString() || "",
                    Dia_semana: data.Dia_semana || "",
                    Hora_inicio: data.Hora_inicio?.substring(0, 5) || "08:00",
                    Hora_fim: data.Hora_fim?.substring(0, 5) || "09:00",
                    Status: data.Status || "ativo"
                });
            }
        } catch (err: any) {
            console.error("Erro ao carregar disponibilidade:", err);
            toast.error("Erro ao carregar dados da disponibilidade");
        } finally {
            setLoadingData(false);
        }
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const calcularDuracao = () => {
        if (!formData.Hora_inicio || !formData.Hora_fim) {
            setDuracao("");
            return;
        }

        const inicio = new Date(`1970-01-01T${formData.Hora_inicio}`);
        const fim = new Date(`1970-01-01T${formData.Hora_fim}`);

        // Verificar se fim é anterior ao início (passou da meia-noite)
        let diffMs = fim.getTime() - inicio.getTime();

        if (diffMs < 0) {
            // Adiciona 24 horas se passar da meia-noite
            diffMs += 24 * 60 * 60 * 1000;
        }

        const diffHoras = diffMs / (1000 * 60 * 60);

        if (diffHoras < 1) {
            const minutos = Math.floor(diffHoras * 60);
            setDuracao(`${minutos} minutos`);
        } else {
            const horas = Math.floor(diffHoras);
            const minutos = Math.floor((diffHoras - horas) * 60);
            setDuracao(`${horas}h${minutos > 0 ? ` ${minutos}min` : ''}`);
        }
    };

    const validateForm = () => {
        if (!formData.Professor_ID) {
            toast.error("Selecione um professor");
            return false;
        }

        if (!formData.Dia_semana) {
            toast.error("Selecione um dia da semana");
            return false;
        }

        if (!formData.Hora_inicio) {
            toast.error("Informe a hora de início");
            return false;
        }

        if (!formData.Hora_fim) {
            toast.error("Informe a hora de término");
            return false;
        }

        const inicio = new Date(`1970-01-01T${formData.Hora_inicio}`);
        const fim = new Date(`1970-01-01T${formData.Hora_fim}`);

        // Ajustar para caso passe da meia-noite
        let diffMs = fim.getTime() - inicio.getTime();
        if (diffMs < 0) {
            diffMs += 24 * 60 * 60 * 1000;
        }

        if (diffMs <= 0) {
            toast.error("A hora de término deve ser posterior à hora de início");
            return false;
        }

        // Verificar se duração é muito longa (mais de 12 horas)
        const diffHoras = diffMs / (1000 * 60 * 60);
        if (diffHoras > 12) {
            toast.error("A duração máxima permitida é de 12 horas");
            return false;
        }

        // Verificar se duração é muito curta (menos de 15 minutos)
        if (diffHoras < 0.25) {
            toast.error("A duração mínima é de 15 minutos");
            return false;
        }

        return true;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        setLoading(true);

        try {
            const payload = {
                Professor_ID: formData.Professor_ID ? Number(formData.Professor_ID) : null,
                Dia_semana: formData.Dia_semana || null,
                Hora_inicio: formData.Hora_inicio || null,
                Hora_fim: formData.Hora_fim || null,
                Status: formData.Status || null
            };

            if (isEditing) {
                const { error } = await supabase
                    .from("Disponibilidade")
                    .update(payload)
                    .eq("Disponibilidade_ID", id);

                if (error) throw error;
                toast.success('Disponibilidade atualizada com sucesso!');
            } else {
                const { error } = await supabase
                    .from("Disponibilidade")
                    .insert(payload);

                if (error) throw error;
                toast.success('Disponibilidade cadastrada com sucesso!');
            }

            navigate('/disponibilidade');
        } catch (err: any) {
            console.error("Erro detalhado:", err);

            if (err.code === '23503') {
                toast.error("Professor selecionado não existe.");
            } else if (err.code === '23505') {
                toast.error("Este professor já possui disponibilidade neste horário.");
            } else {
                toast.error('Erro ao salvar disponibilidade: ' + (err.message || 'Erro desconhecido'));
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
                    <p>Carregando dados da disponibilidade...</p>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout>
            <h1>{isEditing ? "Editar Disponibilidade" : "Nova Disponibilidade"}</h1>

            <p style={{ color: "#666" }}>
                {isEditing
                    ? "Atualize as informações da disponibilidade abaixo."
                    : "Cadastre um novo horário de disponibilidade para um professor."}
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
                    <Select
                        label="Professor *"
                        name="Professor_ID"
                        value={formData.Professor_ID}
                        onChange={handleChange}
                        required
                        disabled={!!searchParams.get("professor")}
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
                        label="Dia da Semana *"
                        name="Dia_semana"
                        value={formData.Dia_semana}
                        onChange={handleChange}
                        required
                    >
                        <option value="">Selecione um dia</option>
                        {diasSemana.map((dia, idx) => (
                            <option key={idx} value={dia}>{dia}</option>
                        ))}
                    </Select>

                    <Select
                        label="Status *"
                        name="Status"
                        value={formData.Status}
                        onChange={handleChange}
                        required
                    >
                        {statusOptions.map((status, idx) => (
                            <option key={idx} value={status.value}>{status.label}</option>
                        ))}
                    </Select>
                </Section>

                {/* HORÁRIOS */}
                <Section title="Horário de Disponibilidade">
                    <Select
                        label="Hora de Início *"
                        name="Hora_inicio"
                        value={formData.Hora_inicio}
                        onChange={handleChange}
                        required
                    >
                        {horariosSugeridos.map((hora, idx) => (
                            <option key={`inicio-${idx}`} value={hora}>
                                {hora}
                            </option>
                        ))}
                    </Select>

                    <Select
                        label="Hora de Término *"
                        name="Hora_fim"
                        value={formData.Hora_fim}
                        onChange={handleChange}
                        required
                    >
                        {horariosSugeridos.map((hora, idx) => (
                            <option key={`fim-${idx}`} value={hora}>
                                {hora}
                            </option>
                        ))}
                    </Select>

                    <div>
                        <label style={{
                            display: 'block',
                            marginBottom: '8px',
                            fontSize: '14px',
                            color: '#374151',
                            fontWeight: '500'
                        }}>
                            Duração Total
                        </label>
                        <div style={{
                            padding: "12px",
                            borderRadius: "8px",
                            border: "1px solid #d1d5db",
                            background: "#f9fafb",
                            color: "#374151",
                            fontSize: "14px",
                            fontWeight: "500",
                            textAlign: "center"
                        }}>
                            {duracao || "Selecione os horários"}
                        </div>
                    </div>
                </Section>

                {/* Exemplo de Horários */}
                <div style={{
                    background: '#f0f9ff',
                    padding: '16px',
                    borderRadius: '8px',
                    border: '1px solid #bae6fd',
                    marginBottom: '24px'
                }}>
                    <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                        <div style={{ fontSize: '18px', color: '#0369a1' }}>💡</div>
                        <div>
                            <p style={{ margin: '0 0 8px 0', color: '#0369a1', fontWeight: '500' }}>
                                Exemplos de Horários
                            </p>
                            <div style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                                gap: '12px',
                                fontSize: '13px',
                                color: '#374151'
                            }}>
                                <div>
                                    <strong>Manhã:</strong> 08:00 - 12:00 (4h)
                                </div>
                                <div>
                                    <strong>Tarde:</strong> 14:00 - 18:00 (4h)
                                </div>
                                <div>
                                    <strong>Noite:</strong> 19:00 - 22:00 (3h)
                                </div>
                                <div>
                                    <strong>Integral:</strong> 09:00 - 17:00 (8h)
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Informações */}
                <div style={{
                    background: '#fef3c7',
                    padding: '16px',
                    borderRadius: '8px',
                    border: '1px solid #fcd34d',
                    marginBottom: '24px'
                }}>
                    <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                        <div style={{ fontSize: '18px', color: '#92400e' }}>ℹ️</div>
                        <div>
                            <p style={{ margin: '0 0 8px 0', color: '#92400e', fontWeight: '500' }}>
                                Informações importantes
                            </p>
                            <ul style={{
                                margin: 0,
                                paddingLeft: '20px',
                                fontSize: '13px',
                                color: '#78350f'
                            }}>
                                <li>Horários podem passar da meia-noite (ex: 22:00 - 01:00)</li>
                                <li>Duração mínima: 15 minutos</li>
                                <li>Duração máxima: 12 horas</li>
                                <li>Status <strong>Ativo</strong>: Horário disponível para agendamento</li>
                                <li>Status <strong>Inativo</strong>: Horário temporariamente indisponível</li>
                                <li>Status <strong>Temporário</strong>: Horário disponível por período limitado</li>
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
                        onClick={() => navigate('/disponibilidade')}
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
                        {loading ? 'Salvando...' : isEditing ? 'Atualizar Disponibilidade' : 'Salvar Disponibilidade'}
                    </button>
                </div>
            </form>
        </DashboardLayout>
    );
}