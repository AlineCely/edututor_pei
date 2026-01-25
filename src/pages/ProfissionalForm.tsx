import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import DashboardLayout from "../layouts/DashboardLayout";
import Input from "../components/Form/Input";
import Section from "../components/Form/Section";
import Select from "../components/Form/Select";
import { supabase } from "../lib/supabase";

interface ProfessorData {
    Professor_ID: string;
    Registro_profissional: string;
    Especialidades: string;
    Biografia: string;
    Formacao: string;
    Experiencia: string;
    Valor_hora: number;
    Usuarios: {
        Nome: string;
        Email: string;
        Telefone: number;
        Tipo: string;
    } | null;
}

export default function ProfissionalForm() {
    const { id } = useParams();
    const navigate = useNavigate();
    const isEditing = !!id;

    const [loading, setLoading] = useState(false);

    const [form, setForm] = useState({
        Nome: "",
        Email: "",
        Telefone: "",
        Registro: "",
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

    /* 🔹 Carregar dados (edição) */
    useEffect(() => {
        if (!isEditing) return;

        async function carregarProfessor() {
            setLoading(true);

            const { data, error } = await supabase
                .from("Professores")
                .select(`
          Professor_ID,
          Especialidades,
          Biografia,
          Formacao,
          Experiencia,
          Valor_hora,
          Registro_profissional,
          Usuarios (
            Nome,
            Email,
            Telefone,
            Tipo      
        )
        `)
                .eq("Professor_ID", id)
                .single<ProfessorData>();

            if (!error && data) {
                setForm({
                    Nome: data.Usuarios?.Nome ?? "",
                    Email: data.Usuarios?.Email ?? "",
                    Telefone: data.Usuarios?.Telefone.toString() ?? "",
                    Registro: data.Registro_profissional ?? "",
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
                /* UPDATE */
                const { data: professorData, error: professorError } = await supabase
                    .from("Professores")
                    .select("Usuario_ID")
                    .eq("Professor_ID", id)
                    .single();

                if (professorError) throw professorError;

                await supabase
                    .from("Professores")
                    .update({
                        Especialidades: form.Especialidades,
                        Biografia: form.Biografia,
                        Formacao: form.Formacao,
                        Experiencia: form.Experiencia,
                        Valor_hora: Number(form.Valor_hora),
                        Registro_profissional: form.Registro
                    })
                    .eq("Professor_ID", id);

                if (professorData?.Usuario_ID) {
                    await supabase
                        .from("Usuarios")
                        .update({
                            Nome: form.Nome,
                            Email: form.Email,
                            Telefone: form.Telefone,
                            Tipo: form.Tipo
                        })
                        .eq("id", professorData.Usuario_ID); // ajuste se usar outro PK
                }
            } else {
                /* INSERT */
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

                await supabase.from("Professores").insert([
                    {
                        Usuario_ID: usuario.id,
                        Registro_profissional: form.Registro,
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
            alert("Erro ao salvar profissional. Verifique o console.");
        } finally {
            setLoading(false);
        }
    }

    return (
        <DashboardLayout>
            <h1>{isEditing ? "Editar Profissional" : "Cadastrar Profissional"}</h1>

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
                <Section title="Dados Profissionais">
                    <Input label="Nome Completo" name="Nome" value={form.Nome} onChange={handleChange} />
                    <Input label="Email" type="email" name="Email" value={form.Email} onChange={handleChange} />
                    <Input label="Telefone" type="tel" name="Telefone" value={form.Telefone} onChange={handleChange} />
                </Section>

                <Section title="Registro">
                    <Input label="Registro Profissional" name="Registro" value={form.Registro} onChange={handleChange} />
                </Section>

                <Section title="Perfil">
                    <Select label="Selecione o Perfil" name="Tipo" value={form.Tipo} onChange={handleChange}>
                        <option value="">Selecione</option>
                        {perfilOptions.map((o) => (
                            <option key={o.value} value={o.value}>{o.label}</option>
                        ))}
                    </Select>
                </Section>

                <Section title="Informações Complementares">
                    <Input label="Especialidades" name="Especialidades" value={form.Especialidades} onChange={handleChange} />
                    <Input label="Formação" name="Formacao" value={form.Formacao} onChange={handleChange} />
                    <Input label="Experiência" name="Experiencia" value={form.Experiencia} onChange={handleChange} />
                    <Input label="Valor por Hora" type="number" name="Valor_hora" value={form.Valor_hora} onChange={handleChange} />
                    <textarea
                        name="Biografia"
                        placeholder="Biografia"
                        value={form.Biografia}
                        onChange={handleChange}
                        style={{ width: "100%", minHeight: "100px", marginTop: "8px", background: "#f9f9f9", border: "1px solid #ddd", borderRadius: "8px", padding: "10px", color: "#333" }}
                    />
                </Section>

                {/* AÇÕES */}
                <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px", marginTop: "24px" }}>
                    <button type="button" onClick={() => navigate("/profissionais")}>Cancelar</button>
                    <button style={{
                        background: '#4F46E5',
                    }}
                        type="submit" disabled={loading}>
                        {loading ? "Salvando..." : "Salvar"}
                    </button>
                </div>
            </form>
        </DashboardLayout>
    );
}
