import { useState, useEffect } from 'react';
import { AlunoService, FamiliaService, EscolaService } from '../services/alunoService';
import type { AlunoFormData } from '../lib/supabase';

export function useAlunos() {
    const [alunos, setAlunos] = useState<any[]>([]);
    const [familias, setFamilias] = useState<any[]>([]);
    const [escolas, setEscolas] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const loadData = async () => {
        try {
            setLoading(true);
            setError(null);

            const [alunosData, familiasData, escolasData] = await Promise.all([
                AlunoService.getAll(),
                FamiliaService.getAll(),
                EscolaService.getAll()
            ]);

            setAlunos(alunosData || []);
            setFamilias(familiasData || []);
            setEscolas(escolasData || []);
        } catch (err: any) {
            console.error('Erro ao carregar dados:', err);
            
            // Mensagem de erro mais específica
            if (err.message === 'Failed to fetch') {
                setError('Erro de conexão. Verifique se o servidor está rodando e acessível.');
            } else if (err.message?.includes('JWT')) {
                setError('Erro de autenticação. Verifique se está logado.');
            } else {
                setError(`Erro ao carregar dados: ${err.message || 'Erro desconhecido'}`);
            }
            
            // Limpar dados em caso de erro
            setAlunos([]);
            setFamilias([]);
            setEscolas([]);
        } finally {
            setLoading(false);
        }
    };

    const createAluno = async (alunoData: AlunoFormData) => {
        try {
            const novoAluno = await AlunoService.create(alunoData);
            await loadData(); // Recarrega os dados
            return novoAluno;
        } catch (err: any) {
            const errorMsg = err.message === 'Failed to fetch' 
                ? 'Erro de conexão ao criar aluno'
                : 'Erro ao criar aluno';
            setError(errorMsg);
            throw err;
        }
    };

    const updateAluno = async (id: number, alunoData: Partial<AlunoFormData>) => {
        try {
            const alunoAtualizado = await AlunoService.update(id, alunoData);
            await loadData(); // Recarrega os dados
            return alunoAtualizado;
        } catch (err: any) {
            const errorMsg = err.message === 'Failed to fetch'
                ? 'Erro de conexão ao atualizar aluno'
                : 'Erro ao atualizar aluno';
            setError(errorMsg);
            throw err;
        }
    };

    const deleteAluno = async (id: number) => {
        try {
            await AlunoService.delete(id);
            await loadData(); // Recarrega os dados
        } catch (err: any) {
            const errorMsg = err.message === 'Failed to fetch'
                ? 'Erro de conexão ao excluir aluno'
                : 'Erro ao excluir aluno';
            setError(errorMsg);
            throw err;
        }
    };

    const createFamilia = async (familiaData: any) => {
        try {
            const novaFamilia = await FamiliaService.create(familiaData);
            await loadData(); // Recarrega os dados
            return novaFamilia;
        } catch (err: any) {
            const errorMsg = err.message === 'Failed to fetch'
                ? 'Erro de conexão ao criar família'
                : 'Erro ao criar família';
            setError(errorMsg);
            throw err;
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    return {
        alunos,
        familias,
        escolas,
        loading,
        error,
        loadData,
        createAluno,
        updateAluno,
        deleteAluno,
        createFamilia
    };
}