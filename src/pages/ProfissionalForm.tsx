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

interface Usuario {
  Usuario_ID: number;
  Nome: string;
  Email: string;
  Telefone: string;
  Tipo: string;
}

interface ProfessorData {
  Professor_ID: number;
  Usuario_ID: number;
  Especialidades: string | null;
  Biografia: string | null;
  Formacao: string | null;
  Experiencia: string | null;
  Valor_hora: number | null;
  Usuarios: Usuario | null;
}

/* =======================
   COMPONENTE
======================= */

export default function ProfissionalForm() {
  const { id } = useParams<{ id: string }>(); 
  const navigate = useNavigate();
  const isEditing = Boolean(id);

  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(isEditing);
  const [plataformas, setPlataformas] = useState<any[]>([]);

  const [form, setForm] = useState({
    Nome: "",
    Email: "",
    Telefone: "",
    Tipo: "PROFISSIONAL",
    Especialidades: "",
    Biografia: "",
    Formacao: "",
    Experiencia: "",
    Valor_hora: ""
  });

  const [selectedPlataformaId, setSelectedPlataformaId] = useState<string>("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const perfilOptions = [
    { value: "PROFISSIONAL", label: "Profissional" },
    { value: "GESTOR", label: "Gestor" },
    { value: "FAMILIA", label: "Família" }
  ];

  const especialidadesOptions = [
    { value: "Informática", label: "Informática" },
    { value: "Psicologia", label: "Psicologia" },
    { value: "Fonoaudiologia", label: "Fonoaudiologia" },
    { value: "Pedagogia", label: "Pedagogia" },
    { value: "Terapia Ocupacional", label: "Terapia Ocupacional" },
    { value: "Educação Física", label: "Educação Física" },
    { value: "Psicopedagogia", label: "Psicopedagogia" },
    { value: "Outra", label: "Outra" }
  ];

  /* =======================
     CARREGAR DADOS
  ======================= */
  useEffect(() => {
    fetchPlataformas();
    if (isEditing) {
      fetchProfessor();
    }
  }, [id, isEditing]);

  async function fetchPlataformas() {
    try {
      const { data, error } = await supabase
        .from("Plataformas")
        .select("Plataforma_ID, Nome")
        .order("Nome");

      if (error) throw error;
      setPlataformas(data || []);
    } catch (err: any) {
      console.error("Erro ao buscar plataformas:", err);
      toast.error("Erro ao carregar plataformas");
    }
  }

  async function fetchProfessor() {
    if (!id) return;
    
    try {
      setLoadingData(true);
      const { data, error } = await supabase
        .from("Professores")
        .select(`
          Professor_ID,
          Usuario_ID,
          Especialidades,
          Biografia,
          Formacao,
          Experiencia,
          Valor_hora,
          Usuarios:Usuario_ID (
            Usuario_ID,
            Nome,
            Email,
            Telefone,
            Tipo,
            Plataforma_ID
          )
        `)
        .eq("Professor_ID", id)
        .single();

      if (error) throw error;

      if (data) {
        setForm({
          Nome: data.Usuarios?.Nome ?? "",
          Email: data.Usuarios?.Email ?? "",
          Telefone: data.Usuarios?.Telefone ?? "",
          Tipo: data.Usuarios?.Tipo ?? "PROFISSIONAL",
          Especialidades: data.Especialidades ?? "",
          Biografia: data.Biografia ?? "",
          Formacao: data.Formacao ?? "",
          Experiencia: data.Experiencia ?? "",
          Valor_hora: data.Valor_hora?.toString() ?? ""
        });
        
        setSelectedPlataformaId(data.Usuarios?.Plataforma_ID?.toString() || "");
      }
    } catch (err: any) {
      console.error("Erro ao carregar profissional:", err);
      toast.error("Erro ao carregar dados do profissional");
    } finally {
      setLoadingData(false);
    }
  }

  /* =======================
     HANDLERS
  ======================= */

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  const handlePlataformaChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedPlataformaId(e.target.value);
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
  };

  // Máscara para telefone
  const formatTelefone = (telefone: string) => {
    const numbers = telefone.replace(/\D/g, '');
    if (numbers.length <= 10) {
      return numbers
        .replace(/^(\d{2})(\d)/, '($1) $2')
        .replace(/(\d{4})(\d)/, '$1-$2');
    } else {
      return numbers
        .replace(/^(\d{2})(\d)/, '($1) $2')
        .replace(/(\d{5})(\d)/, '$1-$2');
    }
  };

  const handleTelefoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatTelefone(e.target.value);
    setForm(prev => ({
      ...prev,
      Telefone: formatted
    }));
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

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    
    // Validações
    if (!selectedPlataformaId) {
      toast.error("Selecione uma plataforma");
      return;
    }
    
    if (!form.Nome.trim()) {
      toast.error("O nome do profissional é obrigatório");
      return;
    }

    if (!form.Email.trim()) {
      toast.error("O email é obrigatório");
      return;
    }

    // Validação de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(form.Email)) {
      toast.error("Email inválido");
      return;
    }

    if (!form.Telefone.trim()) {
      toast.error("O telefone é obrigatório");
      return;
    }

    // Validar telefone (mínimo 10 dígitos)
    const phoneDigits = form.Telefone.replace(/\D/g, '');
    if (phoneDigits.length < 10) {
      toast.error("Telefone deve ter pelo menos 10 dígitos");
      return;
    }

    if (!form.Especialidades.trim()) {
      toast.error("A especialidade é obrigatória");
      return;
    }

    // Se for criação, verificar senha
    if (!isEditing && !password) {
      toast.error("A senha é obrigatória para novo profissional");
      return;
    }

    if (!isEditing && password.length < 8) {
      toast.error("A senha deve ter pelo menos 8 caracteres");
      return;
    }
    
    setLoading(true);

    try {
      if (isEditing) {
        // Buscar dados do professor
        const { data: prof, error: profError } = await supabase
          .from("Professores")
          .select("Usuario_ID")
          .eq("Professor_ID", id)
          .single();

        if (profError || !prof) throw profError;

        // Atualizar usuário
        await supabase
          .from("Usuarios")
          .update({
            Nome: form.Nome,
            Email: form.Email,
            Telefone: form.Telefone,
            Tipo: form.Tipo,
            Plataforma_ID: Number(selectedPlataformaId)
          })
          .eq("Usuario_ID", prof.Usuario_ID);

        // Atualizar professor
        await supabase
          .from("Professores")
          .update({
            Especialidades: form.Especialidades,
            Biografia: form.Biografia,
            Formacao: form.Formacao,
            Experiencia: form.Experiencia,
            Valor_hora: form.Valor_hora ? Number(form.Valor_hora) : null
          })
          .eq("Professor_ID", id);

        toast.success('Profissional atualizado com sucesso!');
      } else {
        // Criar novo usuário no Auth
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email: form.Email,
          password: password,
          options: {
            data: {
              nome: form.Nome,
              plataforma_id: Number(selectedPlataformaId),
              tipo: form.Tipo
            },
            emailRedirectTo: `${window.location.origin}/login`
          }
        });

        if (authError) throw authError;

        if (!authData.user) {
          throw new Error("Falha ao criar usuário no sistema de autenticação");
        }

        // Inserir na tabela Usuarios
        const { data: usuario, error: usuarioError } = await supabase
          .from("Usuarios")
          .insert({
            id: authData.user.id,
            Nome: form.Nome,
            Email: form.Email,
            Telefone: form.Telefone,
            Tipo: form.Tipo,
            Status: "Ativo",
            Plataforma_ID: Number(selectedPlataformaId)
          })
          .select()
          .single();

        if (usuarioError || !usuario) throw usuarioError;

        // Inserir na tabela Professores
        await supabase
          .from("Professores")
          .insert({
            Usuario_ID: usuario.Usuario_ID,
            Especialidades: form.Especialidades,
            Biografia: form.Biografia,
            Formacao: form.Formacao,
            Experiencia: form.Experiencia,
            Valor_hora: form.Valor_hora ? Number(form.Valor_hora) : null
          });

        // Mostrar modal com senha
        toast.custom((t) => (
          <div style={{
            background: '#fff',
            padding: '20px',
            borderRadius: '12px',
            boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
            maxWidth: '400px'
          }}>
            <h3 style={{ margin: '0 0 10px 0', color: '#059669' }}>
              ✅ Profissional criado com sucesso!
            </h3>
            <p style={{ margin: '0 0 15px 0', color: '#374151' }}>
              Anote a senha para o primeiro acesso:
            </p>
            <div style={{ 
              background: '#f3f4f6', 
              padding: '12px',
              borderRadius: '8px',
              marginBottom: '15px',
              fontFamily: 'monospace',
              fontSize: '14px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <span>{password}</span>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(password);
                  toast.success("Senha copiada!");
                }}
                style={{
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  color: '#2563eb'
                }}
              >
                📋
              </button>
            </div>
            <p style={{ fontSize: '12px', color: '#6b7280', margin: '0' }}>
              Esta senha será necessária para o primeiro login.
            </p>
          </div>
        ), { duration: 10000 });
      }

      setTimeout(() => {
        navigate("/profissionais");
      }, 2000);

    } catch (err: any) {
      console.error("Erro detalhado:", err);
      
      if (err.code === '23502') {
        toast.error("Erro: Plataforma não selecionada.");
      } else if (err.code === '23505') {
        toast.error("Já existe um profissional com este email.");
      } else if (err.code === '23503') {
        toast.error("Plataforma selecionada não existe.");
      } else if (err.code === 'auth/email-already-in-use') {
        toast.error("Este email já está em uso.");
      } else if (err.code === 'auth/invalid-email') {
        toast.error("Email inválido.");
      } else if (err.code === 'auth/weak-password') {
        toast.error("Senha muito fraca. Use pelo menos 8 caracteres.");
      } else {
        toast.error('Erro ao salvar profissional: ' + (err.message || 'Erro desconhecido'));
      }
    } finally {
      setLoading(false);
    }
  }

  // Mostrar loading enquanto busca os dados
  if (loadingData) {
    return (
      <DashboardLayout>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '200px' }}>
          <p>Carregando dados do profissional...</p>
        </div>
      </DashboardLayout>
    );
  }

  /* =======================
     RENDER
  ======================= */

  return (
    <DashboardLayout>
      <h1>{isEditing ? "Editar Profissional" : "Cadastrar Profissional"}</h1>

      <p style={{ color: "#666" }}>
        {isEditing ? "Atualize as informações do profissional abaixo." : "Preencha o formulário para adicionar um novo profissional."}
      </p>

      <form
        onSubmit={handleSubmit}
        style={{
          background: "#fff",
          borderRadius: "12px",
          padding: "24px",
          marginTop: "24px",
          boxShadow: "0 2px 8px rgba(0,0,0,0.05)"
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

        {/* DADOS PESSOAIS */}
        <Section title="Dados Pessoais">
          <Input 
            label="Nome Completo *" 
            name="Nome" 
            value={form.Nome} 
            onChange={handleChange} 
            required
          />
          <Input 
            label="Email *" 
            name="Email" 
            type="email"
            value={form.Email} 
            onChange={handleChange} 
            required
          />
          <Input 
            label="Telefone *" 
            name="Telefone" 
            value={form.Telefone} 
            onChange={handleTelefoneChange} 
            required
            
          />
        </Section>

        {!isEditing && (
          <Section title="Acesso">
            <div style={{ gridColumn: 'span 2' }}>
              <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '8px' }}>
                <Input
                  label="Senha *"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={handlePasswordChange}
                  required={!isEditing}
                  
                  style={{ flex: 1 }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    marginTop: '24px',
                    padding: '10px',
                    background: '#f3f4f6',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '16px'
                  }}
                >
                  {showPassword ? '🙈' : '👁️'}
                </button>
              </div>
              
              <div style={{ display: 'flex', gap: '10px', marginBottom: '8px' }}>
                <button
                  type="button"
                  onClick={generatePassword}
                  style={{
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
                  onMouseEnter={(e) => e.currentTarget.style.background = '#059669'}
                  onMouseLeave={(e) => e.currentTarget.style.background = '#10b981'}
                >
                  🎲 Gerar Senha Segura
                </button>
                
                {password && (
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(password);
                      toast.success("Senha copiada!");
                    }}
                    style={{
                      padding: '10px 16px',
                      background: '#3b82f6',
                      color: '#fff',
                      border: 'none',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontSize: '14px',
                      fontWeight: '500',
                      transition: 'all 0.2s'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = '#2563eb'}
                    onMouseLeave={(e) => e.currentTarget.style.background = '#3b82f6'}
                  >
                    📋 Copiar Senha
                  </button>
                )}
              </div>
            </div>
          </Section>
        )}

        <Section title="Perfil">
          <Select label="Tipo de Usuário" name="Tipo" value={form.Tipo} onChange={handleChange}>
            {perfilOptions.map((p) => (
              <option key={p.value} value={p.value}>
                {p.label}
              </option>
            ))}
          </Select>
        </Section>

        <Section title="Informações Profissionais">
          <Select 
            label="Especialidades *" 
            name="Especialidades" 
            value={form.Especialidades} 
            onChange={handleChange}
            required
          >
            <option value="">Selecione uma especialidade</option>
            {especialidadesOptions.map(especialidade => (
              <option key={especialidade.value} value={especialidade.value}>
                {especialidade.label}
              </option>
            ))}
          </Select>
          
          <Input label="Formação" name="Formacao" value={form.Formacao} onChange={handleChange} />
          <Input label="Experiência" name="Experiencia" value={form.Experiencia} onChange={handleChange} />
          <Input 
            label="Valor Hora (R$)" 
            type="number" 
            name="Valor_hora" 
            value={form.Valor_hora} 
            onChange={handleChange}
            placeholder="0.00"
            step="0.01"
            min="0"
          />

          <div style={{ gridColumn: 'span 2' }}>
            <label style={{ 
              display: 'block', 
              marginBottom: '8px', 
              fontSize: '14px', 
              color: '#374151',
              fontWeight: '500' 
            }}>
              Biografia
            </label>
            <textarea
              name="Biografia"
              placeholder="Descreva a biografia do profissional..."
              value={form.Biografia}
              onChange={handleChange}
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
        </Section>

        {/* Informações importantes para novo profissional */}
        {!isEditing && (
          <div style={{
            background: '#eff6ff',
            padding: '16px',
            borderRadius: '8px',
            border: '1px solid #bfdbfe',
            marginBottom: '24px'
          }}>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
              <div style={{ fontSize: '18px', color: '#1d4ed8' }}>ℹ️</div>
              <div>
                <p style={{ margin: '0 0 8px 0', color: '#1d4ed8', fontWeight: '500' }}>
                  Informações importantes
                </p>
                <ul style={{ 
                  margin: 0, 
                  paddingLeft: '20px',
                  fontSize: '13px',
                  color: '#374151'
                }}>
                  <li>Um email de confirmação será enviado para o profissional</li>
                  <li>O profissional precisará confirmar o email antes do primeiro acesso</li>
                  <li>A senha gerada deve ser compartilhada com segurança</li>
                  <li>O profissional pode resetar a senha através do link "Esqueci minha senha"</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px", marginTop: "24px" }}>
          <button 
            type="button" 
            onClick={() => navigate("/profissionais")}
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
            disabled={loading}
            style={{
              background: "#2563eb",
              color: "#fff",
              borderRadius: '8px',
              padding: '10px 20px',
              border: 'none',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '500',
              transition: 'all 0.2s'
            }}
            onMouseOver={(e) => e.currentTarget.style.background = '#1d4ed8'}
            onMouseOut={(e) => e.currentTarget.style.background = '#2563eb'}
          >
            {loading ? "Salvando..." : (isEditing ? "Atualizar" : "Salvar Profissional")}
          </button>
        </div>
      </form>
    </DashboardLayout>
  );
}