import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-hot-toast";
import DashboardLayout from "../layouts/DashboardLayout";
import Input from "../components/Form/Input";
import Section from "../components/Form/Section";
import Select from "../components/Form/Select";
import { supabase } from "../lib/supabase";

interface UsuarioFormData {
    Nome: string;
    Email: string;
    Telefone: string;
    Tipo: string;
    Status: string;
}

export default function UsuariosForm() {
    const { id } = useParams();
    const navigate = useNavigate();
    const isEditing = !!id;

    // const [plataformas, setPlataformas] = useState<any[]>([]);

    const [loading, setLoading] = useState(false);
    const [password, setPassword] = useState('');

    // const [loadingPlataformas, setLoadingPlataformas] = useState(true);

    const [formData, setFormData] = useState<UsuarioFormData>({
        Nome: '',
        Email: '',
        Telefone: '',
        Tipo: 'GESTOR',
        Status: 'Ativo'
    });

    // const [selectedPlataformaId, setSelectedPlataformaId] = useState<string>('');

    const tipoOptions = [
        { value: 'GESTOR', label: 'Gestor' },
        { value: 'PROFISSIONAL', label: 'Profissional' },
        { value: 'FAMILIA', label: 'Família' }
    ];

    const statusOptions = [
        { value: 'Ativo', label: 'Ativo' },
        { value: 'Inativo', label: 'Inativo' },
        { value: 'Pendente', label: 'Pendente' }
    ];

    useEffect(() => {
        // fetchPlataformas();
        if (isEditing) fetchUsuario();
    }, [id]);

    // async function fetchPlataformas() {
    //     try {
    //         const { data, error } = await supabase
    //             .from("Plataformas")
    //             .select("Plataforma_ID, Nome")
    //             .order("Nome");

    //         if (error) throw error;
    //         setPlataformas(data || []);
    //     } catch (err: any) {
    //         console.error("Erro ao buscar plataformas:", err);
    //         toast.error("Erro ao carregar plataformas");
    //     } finally {
    //         setLoadingPlataformas(false);
    //     }
    // }

    async function fetchUsuario() {
        if (!id) return;

        try {
            const { data, error } = await supabase
                .from("Usuarios")
                .select("*")
                .eq("Usuario_ID", id)
                .single();

            if (error) throw error;

            if (data) {
                setFormData({
                    Nome: data.Nome || "",
                    Email: data.Email || "",
                    Telefone: data.Telefone || "",
                    Tipo: data.Tipo || "GESTOR",
                    Status: data.Status || "Ativo"
                });
                // setSelectedPlataformaId(data.Plataforma_ID?.toString() || '');
            }
        } catch (err: any) {
            console.error("Erro ao carregar usuário:", err);
            toast.error("Erro ao carregar usuário");
        }
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    // const handlePlataformaChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    //     setSelectedPlataformaId(e.target.value);
    // };

    const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setPassword(e.target.value);
    };

    // Gerar senha aleatória
    const generatePassword = () => {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
        let password = '';
        for (let i = 0; i < 12; i++) {
            password += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        setPassword(password);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validações
        // if (!selectedPlataformaId) {
        //     toast.error("Selecione uma plataforma");
        //     return;
        // }

        if (!formData.Nome.trim()) {
            toast.error("O nome do usuário é obrigatório");
            return;
        }

        if (!formData.Email.trim()) {
            toast.error("O email é obrigatório");
            return;
        }

        // Validação de email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.Email)) {
            toast.error("Email inválido");
            return;
        }

        // Se for criação, verificar senha
        if (!isEditing && !password) {
            toast.error("A senha é obrigatória para novo usuário");
            return;
        }

        setLoading(true);

        try {

            // // Primeiro criar/atualizar o usuário no auth do Supabase
            const payload = {
                ...formData
                // Plataforma_ID: Number(id)
            };

            if (isEditing) {
                // Atualizar usuário existente
                const { error } = await supabase
                    .from("Usuarios")
                    .update(payload)
                    .eq("Usuario_ID", id)

                if (error) throw error;
                toast.success(isEditing ? 'Usuário atualizado com sucesso!' : 'Usuário criado com sucesso!');
            } else {
                // Inserir na tabela Usuarios
                const { error } = await supabase
                    .from("Usuarios")
                    .insert([payload]);

                if (error) throw error;
            }

            // Mostrar senha gerada se for novo usuário
            if (!isEditing) {
                toast.success(`Senha gerada: ${password}`, { duration: 10000 });
            }


            navigate('/usuarios');
        } catch (err: any) {
            console.error("Erro detalhado:", err);

            if (err.code === "23505") {
                toast.error("Email já cadastrado");
            } else {
                toast.error(err.message || "Erro ao salvar usuário");
            }
        } finally {
            setLoading(false);
        }
    };

    // // Mostrar loading enquanto busca as plataformas
    // if (loadingPlataformas) {
    //     return (
    //         <DashboardLayout>
    //             <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '200px' }}>
    //                 <p>Carregando plataformas...</p>
    //             </div>
    //         </DashboardLayout>
    //     );
    // }

    return (
        <DashboardLayout>
            <h1>{isEditing ? "Editar Usuário" : "Novo Usuário"}</h1>

            <p style={{ color: "#666" }}>
                {isEditing ? "Atualize as informações do usuário abaixo." : "Preencha o formulário para adicionar um novo usuário."}
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

                {/* DADOS DO USUÁRIO */}
                <Section title="Dados do Usuário">
                    <Input
                        label="Nome Completo *"
                        name="Nome"
                        value={formData.Nome}
                        onChange={handleChange}
                        required

                    />

                    <Input
                        label="Email *"
                        name="Email"
                        type="email"
                        value={formData.Email}
                        onChange={handleChange}
                        required

                    />

                    {!isEditing && (
                        <div style={{ gridColumn: 'span 2' }}>
                            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                                <Input
                                    // style={{ flex: 1 }}

                                    label="Senha *"
                                    name="password"
                                    type="text"
                                    value={password}
                                    onChange={handlePasswordChange}
                                    required={!isEditing}

                                />
                                <button
                                    type="button"
                                    onClick={generatePassword}
                                    style={{
                                        marginTop: '24px',
                                        padding: '10px 16px',
                                        background: '#10b981',
                                        color: '#fff',
                                        border: 'none',
                                        borderRadius: '8px',
                                        cursor: 'pointer',
                                        fontSize: '14px',
                                        fontWeight: '500',
                                        transition: 'all 0.2s'
                                    }}
                                    onMouseOver={(e) => e.currentTarget.style.background = '#059669'}
                                    onMouseOut={(e) => e.currentTarget.style.background = '#10b981'}
                                >
                                    Gerar Senha
                                </button>
                            </div>
                            <p style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px' }}>
                                A senha será usada para o primeiro acesso do usuário. Guarde esta senha.
                            </p>
                        </div>
                    )}

                    <Input
                        label="Telefone"
                        name="Telefone"
                        value={formData.Telefone}
                        onChange={handleChange}

                    />

                    <Select
                        label="Tipo de Usuário *"
                        name="Tipo"
                        value={formData.Tipo}
                        onChange={handleChange}
                        required
                    >
                        {tipoOptions.map(tipo => (
                            <option key={tipo.value} value={tipo.value}>
                                {tipo.label}
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
                        onClick={() => navigate('/usuarios')}
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
                        {loading ? 'Salvando...' : isEditing ? 'Atualizar' : 'Salvar Usuário'}
                    </button>
                </div>
            </form>
        </DashboardLayout>
    );
}