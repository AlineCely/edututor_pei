import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
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
  Telefone: number;
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

  const [form, setForm] = useState({
    Nome: "",
    Email: "",
    Telefone: "",
    Tipo: "",
    Especialidades: "",
    Biografia: "",
    Formacao: "",
    Experiencia: "",
    Valor_hora: ""
  });

  const perfilOptions = [
    { value: "gestor", label: "Gestor" },
    { value: "professor", label: "Professor" },
    { value: "especialista", label: "Especialista" }
  ];

  /* =======================
     CARREGAR (EDIÇÃO)
  ======================= */
  useEffect(() => {
    if (!isEditing) return;

    async function carregarProfessor() {
      setLoading(true);

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
            Tipo
          )
        `)
        .eq("Professor_ID", id)
        .single<ProfessorData>(); // ✅ single resolve 90% dos bugs

      console.log("DADOS EDIÇÃO:", data);

      if (!error && data) {
        setForm({
          Nome: data.Usuarios?.Nome ?? "",
          Email: data.Usuarios?.Email ?? "",
          Telefone: data.Usuarios?.Telefone?.toString() ?? "",
          Tipo: data.Usuarios?.Tipo ?? "",
          Especialidades: data.Especialidades ?? "",
          Biografia: data.Biografia ?? "",
          Formacao: data.Formacao ?? "",
          Experiencia: data.Experiencia ?? "",
          Valor_hora: data.Valor_hora?.toString() ?? ""
        });
      }

      setLoading(false);
    }

    carregarProfessor();
  }, [id, isEditing]);

  /* =======================
     HANDLERS
  ======================= */

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      if (isEditing) {
        /* 🔹 BUSCA USUARIO */
        const { data: prof, error } = await supabase
          .from("Professores")
          .select("Usuario_ID")
          .eq("Professor_ID", id)
          .single();

        if (error || !prof) throw error;

        /* 🔹 UPDATE PROFESSOR */
        await supabase
          .from("Professores")
          .update({
            Especialidades: form.Especialidades,
            Biografia: form.Biografia,
            Formacao: form.Formacao,
            Experiencia: form.Experiencia,
            Valor_hora: Number(form.Valor_hora)
          })
          .eq("Professor_ID", id);

        /* 🔹 UPDATE USUARIO */
        await supabase
          .from("Usuarios")
          .update({
            Nome: form.Nome,
            Email: form.Email,
            Telefone: Number(form.Telefone),
            Tipo: form.Tipo
          })
          .eq("Usuario_ID", prof.Usuario_ID);
      } else {
        /* 🔹 INSERT USUARIO */
        const { data: usuario, error } = await supabase
          .from("Usuarios")
          .insert([
            {
              Nome: form.Nome,
              Email: form.Email,
              Telefone: Number(form.Telefone),
              Tipo: form.Tipo
            }
          ])
          .select()
          .single();

        if (error || !usuario) throw error;

        /* 🔹 INSERT PROFESSOR */
        await supabase.from("Professores").insert([
          {
            Usuario_ID: usuario.Usuario_ID,
            Especialidades: form.Especialidades,
            Biografia: form.Biografia,
            Formacao: form.Formacao,
            Experiencia: form.Experiencia,
            Valor_hora: Number(form.Valor_hora)
          }
        ]);
      }

      navigate("/profissionais");
    } catch (err) {
      console.error(err);
      alert("Erro ao salvar profissional.");
    } finally {
      setLoading(false);
    }
  }

  /* =======================
     RENDER
  ======================= */

  return (
    <DashboardLayout>
      <h1>{isEditing ? "Editar Profissional" : "Cadastrar Profissional"}</h1>

      <form
        onSubmit={handleSubmit}
        style={{
          background: "#fff",
          borderRadius: "12px",
          padding: "24px",
          marginTop: "24px"
        }}
      >
        <Section title="Dados Pessoais">
          <Input label="Nome" name="Nome" value={form.Nome} onChange={handleChange} />
          <Input label="Email" name="Email" value={form.Email} onChange={handleChange} />
          <Input label="Telefone" name="Telefone" value={form.Telefone} onChange={handleChange} />
        </Section>

        <Section title="Perfil">
          <Select label="Perfil" name="Tipo" value={form.Tipo} onChange={handleChange}>
            <option value="">Selecione</option>
            {perfilOptions.map((p) => (
              <option key={p.value} value={p.value}>
                {p.label}
              </option>
            ))}
          </Select>
        </Section>

        <Section title="Informações Profissionais">
          <Input label="Especialidades" name="Especialidades" value={form.Especialidades} onChange={handleChange} />
          <Input label="Formação" name="Formacao" value={form.Formacao} onChange={handleChange} />
          <Input label="Experiência" name="Experiencia" value={form.Experiencia} onChange={handleChange} />
          <Input label="Valor Hora" type="number" name="Valor_hora" value={form.Valor_hora} onChange={handleChange} />

          <textarea
            name="Biografia"
            placeholder="Biografia"
            value={form.Biografia}
            onChange={handleChange}
            style={{
              width: "100%",
              minHeight: "100px",
              marginTop: "8px",
              padding: "10px",
              background: "#fff",
              color: "#333"
            }}
          />
        </Section>

        <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px", marginTop: "24px" }}>
          <button type="button" onClick={() => navigate("/profissionais")}>
            Cancelar
          </button>
          <button type="submit" disabled={loading}>
            {loading ? "Salvando..." : "Salvar"}
          </button>
        </div>
      </form>
    </DashboardLayout>
  );
}
