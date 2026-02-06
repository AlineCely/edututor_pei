import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-hot-toast";
import DashboardLayout from "../layouts/DashboardLayout";
import Input from "../components/Form/Input";
import Section from "../components/Form/Section";
import Select from "../components/Form/Select";
import { supabase } from "../lib/supabase";

interface EscolaFormData {
  Nome: string;
  CNPJ: string;
  Email: string;
  Telefone: string;
  Endereco: string;
  Status: string;
}

export default function EscolasForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = !!id;

  // const [plataformas, setPlataformas] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingPlataformas, setLoadingPlataformas] = useState(true);

  const [formData, setFormData] = useState<EscolaFormData>({
    Nome: '',
    CNPJ: '',
    Email: '',
    Telefone: '',
    Endereco: '',
    Status: 'Ativo'
  });

  // const [selectedPlataformaId, setSelectedPlataformaId] = useState<string>('');

  const statusOptions = [
    { value: 'Ativo', label: 'Ativo' },
    { value: 'Inativo', label: 'Inativo' },
    { value: 'Pendente', label: 'Pendente' }
  ];

  useEffect(() => {
    fetchPlataformas();
    if (isEditing) fetchEscola();
  }, [id]);

  async function fetchPlataformas() {
    try {
      const { data, error } = await supabase
        .from("Plataformas")
        .select("Plataforma_ID, Nome")
        .order("Nome");

      if (error) throw error;
      // setPlataformas(data || []);
    } catch (err: any) {
      console.error("Erro ao buscar plataformas:", err);
      toast.error("Erro ao carregar plataformas");
    } finally {
      setLoadingPlataformas(false);
    }
  }

  async function fetchEscola() {
    if (!id) return;

    try {
      const { data, error } = await supabase
        .from("Escolas")
        .select("*")
        .eq("Escola_ID", id)
        .single();

      if (error) throw error;

      if (data) {
        setFormData({
          Nome: data.Nome || "",
          CNPJ: data.CNPJ || "",
          Email: data.Email || "",
          Telefone: data.Telefone || "",
          Endereco: data.Endereco || "",
          Status: data.Status || "Ativo"
        });
        // setSelectedPlataformaId(data.Plataforma_ID?.toString() || '');
      }
    } catch (err: any) {
      console.error("Erro ao carregar escola:", err);
      toast.error("Erro ao carregar escola");
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // const handlePlataformaChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
  //   setSelectedPlataformaId(e.target.value);
  // };

  // Máscara para CNPJ
  const formatCNPJ = (cnpj: string) => {
    return cnpj
      .replace(/\D/g, '')
      .replace(/^(\d{2})(\d)/, '$1.$2')
      .replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
      .replace(/\.(\d{3})(\d)/, '.$1/$2')
      .replace(/(\d{4})(\d)/, '$1-$2')
      .slice(0, 18);
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

  const handleCNPJChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCNPJ(e.target.value);
    setFormData(prev => ({
      ...prev,
      CNPJ: formatted
    }));
  };

  const handleTelefoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatTelefone(e.target.value);
    setFormData(prev => ({
      ...prev,
      Telefone: formatted
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validações
    // if (!selectedPlataformaId) {
    //   toast.error("Selecione uma plataforma");
    //   return;
    // }

    if (!formData.Nome.trim()) {
      toast.error("O nome da escola é obrigatório");
      return;
    }

    if (formData.CNPJ && formData.CNPJ.replace(/\D/g, '').length < 14) {
      toast.error("CNPJ deve ter 14 dígitos");
      return;
    }

    setLoading(true);

    try {

      const { data: { user } } = await supabase.auth.getUser();
      console.log(user);

      const payload = {
        ...formData,
        // Usuario_ID: user?.id
      };

      await supabase.from("Escolas").insert(payload);

      if (isEditing) {
        const { error } = await supabase
          .from("Escolas")
          .update(payload)
          .eq("Escola_ID", id);

        if (error) throw error;
        toast.success('Escola atualizada com sucesso!');
      } else {
        const { error } = await supabase
          .from("Escolas")
          .insert(payload);

        if (error) throw error;
        toast.success('Escola criada com sucesso!');
      }

      navigate('/escolas');
    } catch (err: any) {
      console.error("Erro detalhado:", err);

      if (err.code === '23502') {
        if (err.message.includes('Plataforma_ID')) {
          toast.error("Erro: Plataforma não selecionada.");
        }
      } else if (err.code === '23505') {
        toast.error("Já existe uma escola com este CNPJ ou nome.");
      } else if (err.code === '23503') {
        toast.error("Plataforma selecionada não existe.");
      } else {
        toast.error('Erro ao salvar escola: ' + (err.message || 'Erro desconhecido'));
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

  // // Validar se há plataformas disponíveis
  // if (plataformas.length === 0) {
  //   return (
  //     <DashboardLayout>
  //       <div style={{ textAlign: 'center', padding: '40px' }}>
  //         <h2>Nenhuma plataforma disponível</h2>
  //         <p>É necessário criar uma plataforma antes de cadastrar escolas.</p>
  //         <button
  //           onClick={() => navigate('/plataformas')}
  //           style={{
  //             marginTop: '20px',
  //             padding: '10px 20px',
  //             background: '#4F46E5',
  //             color: '#fff',
  //             border: 'none',
  //             borderRadius: '8px',
  //             cursor: 'pointer'
  //           }}
  //         >
  //           Ir para Plataformas
  //         </button>
  //       </div>
  //     </DashboardLayout>
  //   );
  // }

  return (
    <DashboardLayout>
      <h1>{isEditing ? "Editar Escola" : "Nova Escola"}</h1>

      <p style={{ color: "#666" }}>
        {isEditing ? "Atualize as informações da escola abaixo." : "Preencha o formulário para adicionar uma nova escola."}
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

        {/* DADOS DA ESCOLA */}
        <Section title="Dados da Escola">
          <Input
            label="Nome da Escola *"
            name="Nome"
            value={formData.Nome}
            onChange={handleChange}
            required

          />

          <Input
            label="CNPJ"
            name="CNPJ"
            value={formData.CNPJ}
            onChange={handleCNPJChange}

          />

          <Input
            label="Email"
            name="Email"
            type="email"
            value={formData.Email}
            onChange={handleChange}

          />

          <Input
            label="Telefone"
            name="Telefone"
            value={formData.Telefone}
            onChange={handleTelefoneChange}

          />

          <div style={{ gridColumn: 'span 2' }}>
            <label style={{
              display: 'block',
              marginBottom: '8px',
              fontSize: '14px',
              color: '#374151',
              fontWeight: '500'
            }}>
              Endereço
            </label>
            <textarea
              name="Endereco"
              value={formData.Endereco}
              onChange={handleChange}
              placeholder="Rua, número, bairro, cidade - Estado, CEP"
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
            onClick={() => navigate('/escolas')}
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
            {loading ? 'Salvando...' : isEditing ? 'Atualizar' : 'Salvar Escola'}
          </button>
        </div>
      </form>
    </DashboardLayout>
  );
}