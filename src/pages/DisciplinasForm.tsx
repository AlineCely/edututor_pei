import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-hot-toast";
import DashboardLayout from "../layouts/DashboardLayout";
import Input from "../components/Form/Input";
import Section from "../components/Form/Section";
import Select from "../components/Form/Select";
import { supabase } from "../lib/supabase";

/* =======================
   TIPAGENS
======================= */

interface DisciplinaFormData {
    Nome: string;
    Descricao: string;
    Categoria: string;
    Status: string;
}

/* =======================
   COMPONENTE
======================= */

export default function DisciplinasForm() {
    const { id } = useParams();
    const navigate = useNavigate();
    const isEditing = !!id;

    const [plataformas, setPlataformas] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [loadingPlataformas, setLoadingPlataformas] = useState(true);

    const [formData, setFormData] = useState<DisciplinaFormData>({
        Nome: '',
        Descricao: '',
        Categoria: '',
        Status: 'Ativo'
    });

    const [selectedPlataformaId, setSelectedPlataformaId] = useState<string>('');

    const categoriasOptions = [
        { value: 'Matemática', label: 'Matemática' },
        { value: 'Português', label: 'Português' },
        { value: 'Ciências', label: 'Ciências' },
        { value: 'História', label: 'História' },
        { value: 'Geografia', label: 'Geografia' },
        { value: 'Inglês', label: 'Inglês' },
        { value: 'Artes', label: 'Artes' },
        { value: 'Educação Física', label: 'Educação Física' },
        { value: 'Filosofia', label: 'Filosofia' },
        { value: 'Sociologia', label: 'Sociologia' },
        { value: 'Química', label: 'Química' },
        { value: 'Física', label: 'Física' },
        { value: 'Biologia', label: 'Biologia' },
        { value: 'Programação', label: 'Programação' },
        { value: 'Outra', label: 'Outra' }
    ];

    const statusOptions = [
        { value: 'Ativo', label: 'Ativo' },
        { value: 'Inativo', label: 'Inativo' },
        { value: 'Em Desenvolvimento', label: 'Em Desenvolvimento' }
    ];

    useEffect(() => {
        fetchPlataformas();
        if (isEditing) fetchDisciplina();
    }, [id]);

    async function fetchPlataformas() {
        try {
            const { data, error } = await supabase
                .from("Plataformas")
                .select("Plataforma_ID, Nome")
                .order("Nome");

            if (error) {
                console.error("Erro ao buscar plataformas:", error);
                toast.error("Erro ao carregar plataformas");
                return;
            }

            setPlataformas(data || []);
        } catch (err) {
            console.error("Erro ao buscar plataformas:", err);
            toast.error("Erro ao carregar plataformas");
        } finally {
            setLoadingPlataformas(false);
        }
    }

    async function fetchDisciplina() {
        if (!id) return;

        try {
            const { data, error } = await supabase
                .from("Disciplinas")
                .select("*")
                .eq("Disciplina_ID", id)
                .single();

            if (error) {
                console.error("Erro ao carregar disciplina:", error);
                toast.error("Erro ao carregar disciplina");
                return;
            }

            if (data) {
                setFormData({
                    Nome: data.Nome || "",
                    Descricao: data.Descricao || "",
                    Categoria: data.Categoria || "",
                    Status: data.Status || ""
                });
                setSelectedPlataformaId(data.Plataforma_ID?.toString() || '');
            }
        } catch (err) {
            console.error("Erro ao carregar disciplina:", err);
            toast.error("Erro ao carregar disciplina");
        }
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handlePlataformaChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setSelectedPlataformaId(e.target.value);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validações
        // if (!selectedPlataformaId) {
        //     toast.error("Selecione uma plataforma");
        //     return;
        // }

        if (!formData.Nome.trim()) {
            toast.error("O nome da disciplina é obrigatório");
            return;
        }

        // Verificar se a plataforma selecionada existe
        if (selectedPlataformaId) {
            const plataformaExiste = plataformas.some(p => p.Plataforma_ID.toString() === selectedPlataformaId);
            if (!plataformaExiste) {
                toast.error("A plataforma selecionada não existe");
                return;
            }
        }

        setLoading(true);

        try {
            const payload = {
                ...formData,
                Plataforma_ID: Number(id)
            };
            
            // Adicionar Plataforma_ID apenas se estiver selecionada
            if (selectedPlataformaId) {
                payload.Plataforma_ID = Number(selectedPlataformaId);
            }

            if (isEditing) {
                const { error } = await supabase
                    .from("Disciplinas")
                    .update(payload)
                    .eq("Disciplina_ID", id);

                if (error) throw error;
                toast.success('Disciplina atualizada com sucesso!');
            } else {
                const { error } = await supabase
                    .from("Disciplinas")
                    .insert(payload);

                if (error) throw error;
                toast.success('Disciplina criada com sucesso!');
            }

            navigate('/disciplina');
        } catch (err: any) {
            console.error("Erro detalhado:", err);

            if (err.code === '23502') {
                if (err.message.includes('Plataforma_ID')) {
                    toast.error("Erro: Plataforma não selecionada.");
                } else if (err.message.includes('Nome')) {
                    toast.error("Erro: Nome é obrigatório.");
                }
            } else if (err.code === '23505') {
                toast.error("Já existe uma disciplina com este nome.");
            } else if (err.code === '23503') {
                toast.error("Plataforma selecionada não existe.");
            } else {
                toast.error('Erro ao salvar disciplina: ' + (err.message || 'Erro desconhecido'));
            }
        } finally {
            setLoading(false);
        }
    };

    // Mostrar loading enquanto busca as plataformas
    if (loadingPlataformas) {
        return (
            <DashboardLayout>
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '200px' }}>
                    <p>Carregando plataformas...</p>
                </div>
            </DashboardLayout>
        );
    }


    return (
        <DashboardLayout>
            <h1>{isEditing ? "Editar Disciplina" : "Nova Disciplina"}</h1>

            <p style={{ color: "#666" }}>
                {isEditing ? "Atualize as informações da disciplina abaixo." : "Preencha o formulário para adicionar uma nova disciplina."}
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
                {/* SELEÇÃO DE PLATAFORMA */}
                {/* <Section title="Plataforma">
                    <Select
                        label="Plataforma *"
                        name="Plataforma_ID"
                        value={selectedPlataformaId}
                        onChange={handlePlataformaChange}
                        required
                    >
                        <option value="">Selecione uma plataforma</option>
                        {plataformas.map(plataforma => (
                            <option key={plataforma.Plataforma_ID} value={plataforma.Plataforma_ID}>
                                {plataforma.Nome}
                            </option>
                        ))}
                    </Select>
                </Section> */}

                {/* DADOS DA DISCIPLINA */}
                <Section title="Dados da Disciplina">
                    <Input
                        label="Nome da Disciplina *"
                        name="Nome"
                        value={formData.Nome}
                        onChange={handleChange}

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
                            placeholder="Descreva os objetivos, conteúdos e características da disciplina"
                            rows={4}
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
                        label="Categoria"
                        name="Categoria"
                        value={formData.Categoria}
                        onChange={handleChange}
                    >
                        <option value="">Selecione uma categoria</option>
                        {categoriasOptions.map(categoria => (
                            <option key={categoria.value} value={categoria.value}>
                                {categoria.label}
                            </option>
                        ))}
                    </Select>

                    <Select
                        label="Status"
                        name="Status"
                        value={formData.Status}
                        onChange={handleChange}
                    >
                        {statusOptions.map(status => (
                            <option key={status.value} value={status.value}>
                                {status.label}
                            </option>
                        ))}
                    </Select>
                </Section>

                {/* AÇÕES */}
                <div style={{
                    display: 'flex',
                    justifyContent: 'flex-end',
                    gap: '12px',
                    marginTop: '24px'
                }}>
                    <button
                        type="button"
                        onClick={() => navigate('/disciplina')}
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
                        {loading ? 'Salvando...' : isEditing ? 'Atualizar' : 'Salvar Disciplina'}
                    </button>
                </div>
            </form>
        </DashboardLayout>
    );
}