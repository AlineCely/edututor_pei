import { supabase, type Aluno, type AlunoFormData } from '../lib/supabase';

export class AlunoService {
  // LISTAR TODOS OS ALUNOS COM JOINS
  static async getAll() {
    console.log("Buscando alunos do Supabase...")

    const { data, error, status } = await supabase
      .from('Alunos')
      .select(`*`)
      .order('Aluno_ID', { ascending: false });

    console.log('Resposta Supabase - Status:', status, 'Erro:', error);
    console.log('Alunos carregados:', data?.length || 0);

    if (error) throw error;
    return data || [];
  }

  // BUSCAR ALUNO POR ID COM JOINS
  static async getById(id: number) {
    const { data, error } = await supabase
      .from('Alunos')
      .select(`
          *,
          Familias (*),
          Escolas (*)
        `)
      .eq('Aluno_ID', id)
      .single();

    if (error) throw error;
    return data;
  }

  // CRIAR NOVO ALUNO
  static async create(alunoData: AlunoFormData) {
    const { data, error } = await supabase
      .from('Alunos')
      .insert([
        alunoData
        // Nome: alunoData.Nome,
        // Data_nascimento: alunoData.Data_nascimento,
        // Serie: alunoData.Serie,
        // Status: alunoData.Status,
        // Familia_ID: alunoData.Familia_ID,
        // Escola_ID: alunoData.Escola_ID
      ])
      .select()
      .single();

    if (error) throw error;
    return data as Aluno;
  }

  // ATUALIZAR ALUNO
  static async update(id: number, alunoData: Partial<AlunoFormData>) {
    const { data, error } = await supabase
      .from('Alunos')
      .update(alunoData)
      .eq('Aluno_ID', id)
      .select()
      .single();

    if (error) throw error;
    return data as Aluno;
  }

  // DELETAR ALUNO
  static async delete(id: number) {
    const { error } = await supabase
      .from('Alunos')
      .delete()
      .eq('Aluno_ID', id);

    if (error) throw error;
  }
}


const PLATAFORMA_ID = 1;

// Serviço para Famílias
export class FamiliaService {
  static async getAll() {

    console.log('Buscando famílias do Supabase...');

    const { data, error, status } = await supabase
      .from('Familias')
      .select('*')
      .order('Familia_ID', { ascending: false });

    console.log('Famílias - Status:', status);

    if (error) throw error;
    return data || [];

    console.log('Famílias carregadas:', data?.length || 0);
    return data || [];
  }

  static async create(
    familiaData: {
      Nome_responsavel: String;
      Telefone?: string;
      Email?: string;
      Endereco?: string;
    }) {
      console.log("Criando família com Plataforma_ID:", PLATAFORMA_ID);
      
      const { data, error } = await supabase
        .from('Familias')
        .insert([
          {
            ...familiaData,
            Plataforma_ID: PLATAFORMA_ID
          }
        ])
        .select()
        .single();

      if (error) throw error;
      return data;
  }
}

// Serviço para Escolas
export class EscolaService {
  static async getAll() {
    try {
      console.log('Buscando escolas do Supabase...');

      const { data, error, status } = await supabase
        .from('Escolas')
        .select('*')
        .order('Escola_ID', { ascending: false });

      console.log('Escolas - Status:', status);

      if (error) {
        console.error('Erro Escolas:', error);
        throw error;
      }

      console.log('Escolas carregadas:', data?.length || 0);
      return data || [];
    } catch (error) {
      console.error('Erro no EscolaService.getAll:', error);
      throw error;
    }
  }
}