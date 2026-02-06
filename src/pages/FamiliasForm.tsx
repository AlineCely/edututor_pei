import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-hot-toast";
import DashboardLayout from "../layouts/DashboardLayout";
import Input from "../components/Form/Input";
import Section from "../components/Form/Section";
import { supabase } from "../lib/supabase";

interface FamiliaFormData {
  Nome_responsavel: string;
  Telefone: string;
  Email: string;
  Endereco: string;
  Plataforma_ID?: number;
}

export default function FamiliasForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = !!id;

  const [loading, setLoading] = useState(false);
  const [alunosVinculados, setAlunosVinculados] = useState<any[]>([]);

  const [plataformas, setPlataformas] = useState<any[]>([]);
  const [loadingPlataformas, setLoadingPlataformas] = useState(true);

  const [formData, setFormData] = useState<FamiliaFormData>({
    Nome_responsavel: '',
    Telefone: '',
    Email: '',
    Endereco: '',
    // Plataforma_ID: null
  });

  const [selectedPlataformaId, setSelectedPlataformaId] = useState<string>('');

  useEffect(() => {
    fetchPlataformas();
    if (isEditing) {
      fetchFamilia();
      fetchAlunosVinculados();
    }
  }, [id]);

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
    } finally {
      setLoadingPlataformas(false);
    }
  }

  async function fetchFamilia() {
    try {
      const { data, error } = await supabase
        .from("Familias")
        .select("*")
        .eq("Familia_ID", id)
        .single();

      if (error) throw error;


      setFormData({
        Nome_responsavel: data.Nome_responsavel || "",
        Telefone: data.Telefone,
        Email: data.Email || "",
        Endereco: data.Endereco || "",
        // Plataforma_ID: data.Plataforma_ID ?? null

      });
      setSelectedPlataformaId(data.Plataforma_ID?.toString() || '');

    } catch (err: any) {
      toast.error("Erro ao carregar família");
    }
  }

  async function fetchAlunosVinculados() {
    try {
      const { data, error } = await supabase
        .from("Alunos")
        .select("Aluno_ID, Nome, Status")
        .eq("Familia_ID", id);

      if (error) throw error;
      setAlunosVinculados(data || []);

    } catch (err: any) {
      console.error("Erro ao buscar alunos:", err);
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePlataformaChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedPlataformaId(e.target.value);
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
    setFormData(prev => ({
      ...prev,
      Telefone: formatted
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // // Validações
    // if (!selectedPlataformaId) {
    //   toast.error("Selecione uma plataforma");
    //   return;
    // }

    if (!formData.Nome_responsavel.trim()) {
      toast.error("O nome do responsável é obrigatório");
      return;
    }

    if (!formData.Telefone.trim()) {
      toast.error("O telefone é obrigatório");
      return;
    }

    // Validar telefone (mínimo 10 dígitos)
    const phoneDigits = formData.Telefone.replace(/\D/g, '');
    if (phoneDigits.length < 10) {
      toast.error("Telefone deve ter pelo menos 10 dígitos");
      return;
    }

    // Validar email se preenchido
    if (formData.Email && !formData.Email.includes('@')) {
      toast.error("Email inválido");
      return;
    }

    setLoading(true);

    try {

      // Preparar payload - Plataforma_ID pode ser null
      const plataformaId = selectedPlataformaId && selectedPlataformaId !== ''
        ? Number(selectedPlataformaId)
        : null;

      const payload = {
        Nome_responsavel: formData.Nome_responsavel.trim(),
        Telefone: formData.Telefone,
        Email: formData.Email.trim() || null,
        Endereco: formData.Endereco.trim() || null,
        Plataforma_ID: plataformaId
      };

      console.log('Enviando payload:', JSON.stringify(payload, null, 2));

      if (isEditing) {
        const { error } = await supabase
          .from("Familias")
          .update(payload)
          .eq("Familia_ID", id)
          // .select();

        if (error) throw error;
        toast.success('Família atualizada com sucesso!');
      } else {
        const { error } = await supabase
          .from("Familias")
          .insert(payload)
          // .select();

        if (error) throw error;
        toast.success('Família criada com sucesso!');
      }
      navigate('/familias');
    } catch (err: any) {
      if (err.code === "23505") {
        toast.error("Já existe uma família com este telefone ou email.");
      } else {
        toast.error("Erro ao salvar família");
      }
    } finally {
      setLoading(false);
    }
  };

  // // Mostrar loading enquanto busca as plataformas
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
      <h1>{isEditing ? "Editar Família" : "Nova Família"}</h1>

      <p style={{ color: "#666" }}>
        {isEditing ? "Atualize as informações da família abaixo." : "Preencha o formulário para adicionar uma nova família."}
      </p>

      {/* Alert para famílias com alunos */}
      {isEditing && alunosVinculados.length > 0 && (
        <div style={{
          background: "#fef3c7",
          border: "1px solid #fcd34d",
          borderRadius: "8px",
          padding: "16px",
          marginBottom: "20px"
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px" }}>
            <span style={{ fontSize: "18px" }}>👨‍👩‍👧‍👦</span>
            <strong style={{ color: "#92400e" }}>Alunos Vinculados</strong>
          </div>
          <p style={{ margin: "0 0 10px 0", fontSize: "14px", color: "#92400e" }}>
            Esta família possui {alunosVinculados.length} aluno(s) vinculado(s):
          </p>
          <ul style={{ margin: 0, paddingLeft: "20px", fontSize: "13px", color: "#78350f" }}>
            {alunosVinculados.map(aluno => (
              <li key={aluno.Aluno_ID}>
                {aluno.Nome} - <span style={{
                  color: aluno.Status === "Ativo" ? "#059669" : "#dc2626",
                  fontWeight: "500"
                }}>{aluno.Status}</span>
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
        {/* SELEÇÃO DE PLATAFORMA */}
        {/* <Section title="Plataforma">
          <div style={{ position: "relative" }}>
            <label style={{ 
              display: 'block', 
              marginBottom: '8px', 
              fontSize: '14px', 
              color: '#374151',
              fontWeight: '500' 
            }}>
              Plataforma *
            </label>
            <select
              value={selectedPlataformaId}
              onChange={handlePlataformaChange}
              required
              style={{ 
                width: "100%",
                padding: "12px 16px", 
                borderRadius: "8px", 
                border: "1px solid #D1D5DB", 
                background: "#fff",
                color: "#333",
                fontSize: "14px",
                fontFamily: "inherit",
                cursor: "pointer",
                appearance: "none"
              }}
            >
              <option value="">Selecione uma plataforma</option>
              {plataformas.map(plataforma => (
                <option key={plataforma.Plataforma_ID} value={plataforma.Plataforma_ID}>
                  {plataforma.Nome}
                </option>
              ))}
            </select>
          </div>
        </Section> */}

        {/* DADOS DA FAMÍLIA */}
        <Section title="Dados da Família">
          <Input
            label="Nome do Responsável *"
            name="Nome_responsavel"
            value={formData.Nome_responsavel}
            onChange={handleChange}
            required
          />

          <Input
            label="Telefone *"
            name="Telefone"
            value={formData.Telefone}
            onChange={handleTelefoneChange}
            required
          />

          <Input
            label="Email"
            name="Email"
            type="email"
            value={formData.Email}
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
            onClick={() => navigate('/familias')}
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
            {loading ? 'Salvando...' : isEditing ? 'Atualizar' : 'Salvar Família'}
          </button>
        </div>
      </form>
    </DashboardLayout>
  );
}