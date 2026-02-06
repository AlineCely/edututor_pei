import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-hot-toast";
import DashboardLayout from "../layouts/DashboardLayout";
import Section from "../components/Form/Section";
import Input from "../components/Form/Input";
import Select from "../components/Form/Select";
import { supabase } from "../lib/supabase";

export default function AlunoForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = !!id;

  const [familias, setFamilias] = useState<any[]>([]);
  const [escolas, setEscolas] = useState<any[]>([]);
  // const [plataformaId, setPlataformaId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [showNewFamily, setShowNewFamily] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(isEditing);

  const [novaFamilia, setNovaFamilia] = useState({
    Nome_responsavel: '',
    Telefone: '',
    Email: '',
    Endereco: ''
  });

  const [formData, setFormData] = useState({
    Nome: '',
    Data_nascimento: '',
    Serie: '',
    Status: 'Ativo',
    Familia_ID: '',
    Escola_ID: ''
  });

  // Estado para controlar se as famílias já foram carregadas
  const [familiasLoaded, setFamiliasLoaded] = useState(false);

  // // Primeiro: buscar o usuário para obter plataformaId
  // useEffect(() => {
  //   fetchUser();
  // }, []);

  // Segundo: quando plataformaId estiver disponível, buscar dados
  useEffect(() => {
    fetchFamilias();
    fetchEscolas();

    if (isEditing) {
      fetchAluno();
      } else {
        setLoadingData(false);
      }
  }, []);

  // async function fetchUser() {
  //   try {
  //     const { data } = await supabase.auth.getUser();
  //     const user = data.user;

  //     if (!user) {
  //       toast.error("Usuário não autenticado");
  //       navigate('/login');
  //       return;
  //     }

  //     if (user?.user_metadata?.plataforma_id) {
  //       setPlataformaId(user.user_metadata.plataforma_id);
  //     } else {
  //       const { data: userData, error } = await supabase
  //         .from("Usuarios")
  //         .select("plataforma_id")
  //         .eq("id", user.id)
  //         .single();

  //       if (error) {
  //         console.error("Erro ao buscar dados do usuário:", error);
  //         toast.error("Erro ao carregar informações do usuário");
  //         return;
  //       }

  //       if (userData?.plataforma_id) {
  //         setPlataformaId(userData.plataforma_id);
  //       } else {
  //         toast.error("Usuário sem plataforma vinculada");
  //       }
  //     }
  //   } catch (err) {
  //     console.error("Erro ao buscar usuário:", err);
  //     toast.error("Erro ao carregar informações do usuário");
  //   } finally {
  //     setAuthLoading(false);
  //   }
  // }

  async function fetchFamilias() {
    try {
      const { data, error } = await supabase
        .from("Familias")
        .select("*")
        // .eq("Plataforma_ID", plataformaId)
        .order("Nome_responsavel");

      if (error) throw error;
      setFamilias(data || []);
    } catch (err) {
      toast.error("Erro ao carregar famílias");
    } finally {
      setFamiliasLoaded(true);
    }
  }

  async function fetchEscolas() {
    try {
      const { data, error } = await supabase
        .from("Escolas")
        .select("Escola_ID, Nome")
        // .eq("Plataforma_ID", plataformaId)
        .order("Nome");

      if (error) throw error;
      setEscolas(data || []);
    } catch (err) {
      toast.error("Erro ao carregar escolas");
    }
  }

  async function fetchAluno() {
    if (!id) return;
    try {
      setLoadingData(true);
      const { data, error } = await supabase
        .from("Alunos")
        .select(`
          *,
          Familias (
            Familia_ID,
            Nome_responsavel,
            Telefone,
            Email
          ),
          Escolas (
            Escola_ID,
            Nome
          )
        `)
        .eq("Aluno_ID", id)
        // .eq("Plataforma_ID", plataformaId)
        .single();

      if (error) throw error;

      if (data) {
        setFormData({
          Nome: data.Nome || "",
          Data_nascimento: data.Data_nascimento || "",
          Serie: data.Serie || "",
          Status: data.Status || "Ativo",
          Familia_ID: data.Familia_ID?.toString() || "",
          Escola_ID: data.Escola_ID?.toString() || "",
        });

        // Se a família não estiver na lista, adicionar
        if (data.Familias && data.Familias.Familia_ID) {
          const familiaExiste = familias.some(f => f.Familia_ID === data.Familias.Familia_ID);
          if (!familiaExiste && data.Familias.Familia_ID) {
            setFamilias(prev => [...prev, data.Familias]);
          }
        }
      }
    } catch (err: any) {
      console.error("Erro ao carregar aluno:", err);
      if (err.code === 'PGRST116') {
        toast.error("Aluno não encontrado");
        navigate('/alunos');
      } else {
        toast.error("Erro ao carregar aluno");
      }
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

  const handleFamiliaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNovaFamilia(prev => ({
      ...prev,
      [name]: value
    }));
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
    setNovaFamilia(prev => ({
      ...prev,
      Telefone: formatted
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // // Validar se plataformaId está disponível
    // if (!plataformaId) {
    //   toast.error("Plataforma não identificada. Por favor, faça login novamente.");
    //   return;
    // }
    
    // Validações básicas
    if (!formData.Nome.trim()) {
      toast.error("O nome do aluno é obrigatório");
      return;
    }

    if (!formData.Data_nascimento) {
      toast.error("A data de nascimento é obrigatória");
      return;
    }

    // Validar se pelo menos uma família foi selecionada/criada
    if (!showNewFamily && !formData.Familia_ID) {
      toast.error("Por favor, selecione ou crie uma família");
      return;
    }
    
    setLoading(true);

    try {
      let familiaId = formData.Familia_ID;
      
      // Se o usuário escolheu criar nova família
      if (showNewFamily) {
        // Validar campos obrigatórios da nova família
        if (!novaFamilia.Nome_responsavel || !novaFamilia.Telefone) {
          toast.error("Nome do responsável e telefone são obrigatórios");
          setLoading(false);
          return;
        }

        // Validar telefone (mínimo 10 dígitos)
        const phoneDigits = novaFamilia.Telefone.replace(/\D/g, '');
        if (phoneDigits.length < 10) {
          toast.error("Telefone deve ter pelo menos 10 dígitos");
          setLoading(false);
          return;
        }

        const { data, error } = await supabase
          .from("Familias")
          .insert({
            ...novaFamilia
          })
          .select()
          .single();

        if (error) {
          console.error("Erro ao criar família:", error);
          throw error;
        }
        
        familiaId = data.Familia_ID.toString();
        
        // Adicionar a nova família à lista
        setFamilias(prev => [...prev, data]);
        setShowNewFamily(false);
      }

      const payload = {
        ...formData,
        Familia_ID: familiaId ? Number(familiaId) : null,
        Escola_ID: formData.Escola_ID ? Number(formData.Escola_ID) : null,
        // Plataforma_ID: plataformaId
      };

      if (isEditing) {
        const { error } = await supabase
          .from("Alunos")
          .update(payload)
          .eq("Aluno_ID", id);
        
        if (error) throw error;
        toast.success('Aluno atualizado com sucesso!');
      } else {
        const { error } = await supabase
          .from("Alunos")
          .insert(payload);
        
        if (error) throw error;
        toast.success('Aluno criado com sucesso!');
      }

      navigate('/alunos');
    } catch (err: any) {
      console.error("Erro detalhado:", err);
      
      // Mensagens de erro mais específicas
      if (err.code === '23502') {
        if (err.message.includes('Familia_ID')) {
          toast.error("Erro: Família não identificada. Por favor, selecione uma família válida.");
        }
      } else if (err.code === '23503') {
        toast.error("Erro: Escola ou família selecionada não existe.");
      } else {
        toast.error('Erro ao salvar aluno: ' + (err.message || 'Erro desconhecido'));
      }
    } finally {
      setLoading(false);
    }
  }

  const calculateAge = (dateString: string) => {
    if (!dateString) return 0;

    const birthDate = new Date(dateString);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }

    return age;
  };

  const idade = formData.Data_nascimento ? calculateAge(formData.Data_nascimento) : 0;

  // Mostrar loading enquanto busca o usuário
  if (authLoading || loadingData) {
    return (
      <DashboardLayout>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '200px' }}>
          <p>Carregando informações...</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <h1>{isEditing ? "Editar Aluno" : "Novo Aluno"}</h1>

      <p style={{ color: "#666" }}>
        {isEditing ? "Atualize as informações do aluno abaixo." : "Preencha o formulário para adicionar um novo aluno."}
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
        {/* DADOS PESSOAIS */}
        <Section title="Dados Pessoais">
          <Input
            label="Nome Completo *"
            name="Nome"
            value={formData.Nome}
            onChange={handleChange}
            required
            
          />
          <Input
            label="Data de Nascimento *"
            name="Data_nascimento"
            type="date"
            value={formData.Data_nascimento}
            onChange={handleChange}
            required
            max={new Date().toISOString().split('T')[0]}
          />
          <Input
            label="Idade"
            value={`${idade} anos`}
            disabled
          />
        </Section>

        {/* DADOS ESCOLARES */}
        <Section title="Dados Escolares">
          <Select
            label="Escola"
            name="Escola_ID"
            value={formData.Escola_ID}
            onChange={handleChange}
          >
            <option value="">Selecione uma escola</option>
            {escolas.length === 0 ? (
              <option value="" disabled>
                Nenhuma escola cadastrada nesta plataforma
              </option>
            ) : (
              escolas.map(escola => (
                <option key={escola.Escola_ID} value={escola.Escola_ID}>
                  {escola.Nome}
                </option>
              ))
            )}
          </Select>

          <Input
            label="Série / Ano"
            name="Serie"
            value={formData.Serie}
            onChange={handleChange}
            
          />

          <Select
            label="Status"
            name="Status"
            value={formData.Status}
            onChange={handleChange}
          >
            <option value="Ativo">Ativo</option>
            <option value="Inativo">Inativo</option>
            <option value="Transferido">Transferido</option>
            <option value="Formado">Formado</option>
          </Select>
        </Section>

        {/* RESPONSÁVEL */}
        <Section title="Família/Responsável">
          <div style={{ gridColumn: 'span 3' }}>
            <div style={{ display: 'flex', gap: '20px', alignItems: 'center', marginBottom: '16px' }}>
              <label style={{ fontSize: '14px', color: '#555', fontWeight: '500' }}>Família:</label>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  type="button"
                  onClick={() => setShowNewFamily(false)}
                  style={{
                    padding: '8px 16px',
                    background: !showNewFamily ? '#4F46E5' : '#f1f5f9',
                    color: !showNewFamily ? '#fff' : '#333',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    fontWeight: '500'
                  }}
                  onMouseEnter={(e) => {
                    if (showNewFamily) {
                      e.currentTarget.style.background = '#e2e8f0';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (showNewFamily) {
                      e.currentTarget.style.background = '#f1f5f9';
                    }
                  }}
                >
                  Selecionar Existente
                </button>
                <button
                  type="button"
                  onClick={() => setShowNewFamily(true)}
                  style={{
                    padding: '8px 16px',
                    background: showNewFamily ? '#4F46E5' : '#f1f5f9',
                    color: showNewFamily ? '#fff' : '#333',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    fontWeight: '500'
                  }}
                  onMouseEnter={(e) => {
                    if (!showNewFamily) {
                      e.currentTarget.style.background = '#e2e8f0';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!showNewFamily) {
                      e.currentTarget.style.background = '#f1f5f9';
                    }
                  }}
                >
                  Nova Família
                </button>
              </div>
            </div>

            {!showNewFamily ? (
              <Select
                label="Família *"
                name="Familia_ID"
                value={formData.Familia_ID}
                onChange={handleChange}
                required={!showNewFamily}
              >
                <option value="">Selecione uma família</option>
                {familias.length === 0 ? (
                  <option value="" disabled>
                    {familiasLoaded ? 'Nenhuma família cadastrada' : 'Carregando famílias...'}
                  </option>
                ) : (
                  familias.map(familia => (
                    <option key={familia.Familia_ID} value={familia.Familia_ID}>
                      {familia.Nome_responsavel} - {formatTelefone(familia.Telefone)}
                    </option>
                  ))
                )}
              </Select>
            ) : (
              <div style={{
                background: '#f8fafc',
                padding: '20px',
                borderRadius: '8px',
                border: '2px solid #e2e8f0',
                marginBottom: '16px'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <h4 style={{ margin: 0, color: '#475569', fontWeight: '600' }}>Nova Família</h4>
                  <button
                    type="button"
                    onClick={() => setShowNewFamily(false)}
                    style={{
                      background: 'transparent',
                      border: '1px solid #cbd5e1',
                      color: '#64748b',
                      padding: '6px 12px',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: '12px',
                      fontWeight: '500'
                    }}
                  >
                    Voltar para lista
                  </button>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                  <Input
                    label="Nome do Responsável *"
                    name="Nome_responsavel"
                    value={novaFamilia.Nome_responsavel}
                    onChange={handleFamiliaChange}
                    required
                  />
                  <Input
                    label="Telefone *"
                    name="Telefone"
                    value={novaFamilia.Telefone}
                    onChange={handleTelefoneChange}
                    required
                  />
                  <Input
                    label="Email"
                    name="Email"
                    type="email"
                    value={novaFamilia.Email}
                    onChange={handleFamiliaChange}
                  />
                  <Input
                    label="Endereço"
                    name="Endereco"
                    value={novaFamilia.Endereco}
                    onChange={handleFamiliaChange}
                  />
                </div>
              </div>
            )}
          </div>
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
            onClick={() => navigate('/alunos')}
            style={{
              padding: '10px 20px',
              borderRadius: '8px',
              border: '1px solid #d1d5db',
              background: '#fff',
              color: '#374151',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '500',
              transition: 'all 0.2s'
            }}
            disabled={loading}
            onMouseOver={(e) => {
              if (!loading) {
                e.currentTarget.style.background = '#f9fafb';
                e.currentTarget.style.borderColor = '#9ca3af';
              }
            }}
            onMouseOut={(e) => {
              if (!loading) {
                e.currentTarget.style.background = '#fff';
                e.currentTarget.style.borderColor = '#d1d5db';
              }
            }}
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
            onMouseOver={(e) => {
              if (!loading) {
                e.currentTarget.style.background = '#4338CA';
              }
            }}
            onMouseOut={(e) => {
              if (!loading) {
                e.currentTarget.style.background = '#4F46E5';
              }
            }}
          >
            {loading ? 'Salvando...' : isEditing ? 'Atualizar' : 'Salvar Aluno'}
          </button>
        </div>
      </form>
    </DashboardLayout>
  );
}