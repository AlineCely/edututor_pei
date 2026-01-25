import { supabase, type Aluno, type AlunoFormData } from '../lib/supabase';

export class AlunoService {
  // LISTAR TODOS OS ALUNOS COM JOINS
  static async getAll() {
    try {
      console.log("Buscando alunos do Supabase...")

      const { data, error, status } = await supabase
        .from('Alunos')
        .select(`
          *
        `)
        .order('Aluno_ID', { ascending: false });

      console.log('Resposta Supabase - Status:', status, 'Erro:', error);

      if (error) {
        console.error('Erro Supabase:', error);
        throw error;
      }
      console.log('Alunos carregados:', data?.length || 0);
      return data as any[] || [];
    } catch (error) {
      console.error('Erro no AlunoService.getAll:', error);
      throw error;
    }
  }

  // BUSCAR ALUNO POR ID COM JOINS
  static async getById(id: number) {
    try {
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
    } catch (error) {
      console.error('Erro no AlunoService.getById:', error);
      throw error;
    }
  }

  // CRIAR NOVO ALUNO
  static async create(alunoData: AlunoFormData) {
    try {
      const { data, error } = await supabase
        .from('Alunos')
        .insert([{
          Nome: alunoData.Nome,
          Data_nascimento: alunoData.Data_nascimento,
          Serie: alunoData.Serie,
          Status: alunoData.Status,
          Familia_ID: alunoData.Familia_ID,
          Escola_ID: alunoData.Escola_ID
        }])
        .select()
        .single();

      if (error) throw error;
      return data as Aluno;
    } catch (error) {
      console.error('Erro no AlunoService.create:', error);
      throw error;
    }
  }

  // ATUALIZAR ALUNO
  static async update(id: number, alunoData: Partial<AlunoFormData>) {
    try {
      const { data, error } = await supabase
        .from('Alunos')
        .update(alunoData)
        .eq('Aluno_ID', id)
        .select()
        .single();

      if (error) throw error;
      return data as Aluno;
    } catch (error) {
      console.error('Erro no AlunoService.update:', error);
      throw error;
    }
  }

  // DELETAR ALUNO
  static async delete(id: number) {
    try {
      const { error } = await supabase
        .from('Alunos')
        .delete()
        .eq('Aluno_ID', id);

      if (error) throw error;
    } catch (error) {
      console.error('Erro no AlunoService.delete:', error);
      throw error;
    }
  }
}

// Serviço para Famílias
export class FamiliaService {
  static async getAll() {
    try {
      console.log('Buscando famílias do Supabase...');
      
      const { data, error, status } = await supabase
        .from('Familias')
        .select('*')
        .order('Familia_ID', { ascending: false });

      console.log('Famílias - Status:', status);
      
      if (error) {
        console.error('Erro Famílias:', error);
        throw error;
      }
      
      console.log('Famílias carregadas:', data?.length || 0);
      return data || [];
    } catch (error) {
      console.error('Erro no FamiliaService.getAll:', error);
      throw error;
    }
  }

  static async create(familiaData: any) {
    try {
      const { data, error } = await supabase
        .from('Familias')
        .insert([familiaData])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Erro no FamiliaService.create:', error);
      throw error;
    }
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