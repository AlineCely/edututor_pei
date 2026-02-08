import DashboardLayout from "../layouts/DashboardLayout";
import AulasTable from "../components/Aulas/AulasTable";
import AulasHeader from "../components/Aulas/AulasHeader";
import { useState, useCallback } from "react";

export default function AulasPage() {
    const [searchTerm, setSearchTerm] = useState("");
    const [filters, setFilters] = useState<{
        status?: string;
        professor?: string;
        disciplina?: string;
        dataInicio?: string;
        dataFim?: string;
    }>({});
    const [stats, setStats] = useState({
        totalAulas: 0,
        aulasAgendadas: 0,
        aulasRealizadas: 0,
        aulasCanceladas: 0,
        professoresCount: 0,
        disciplinasCount: 0
    });
    const [professores, setProfessores] = useState<any[]>([]);
    const [disciplinas, setDisciplinas] = useState<any[]>([]);

    // Função para atualizar estatísticas (chamada pelo AulasTable)
    const handleStatsUpdate = useCallback((newStats: {
        totalAulas: number;
        aulasAgendadas: number;
        aulasRealizadas: number;
        aulasCanceladas: number;
        professoresCount: number;
        disciplinasCount: number;
        professores: any[];
        disciplinas: any[];
    }) => {
        setStats({
            totalAulas: newStats.totalAulas,
            aulasAgendadas: newStats.aulasAgendadas,
            aulasRealizadas: newStats.aulasRealizadas,
            aulasCanceladas: newStats.aulasCanceladas,
            professoresCount: newStats.professoresCount,
            disciplinasCount: newStats.disciplinasCount
        });
        setProfessores(newStats.professores);
        setDisciplinas(newStats.disciplinas);
    }, []);

    // Funções de busca e filtro
    const handleSearch = useCallback((term: string) => {
        setSearchTerm(term);
    }, []);

    const handleFilterChange = useCallback((filter: {
        status?: string;
        professor?: string;
        disciplina?: string;
        dataInicio?: string;
        dataFim?: string;
    }) => {
        setFilters(filter);
    }, []);

    return (
        <DashboardLayout>
            <AulasHeader
                totalAulas={stats.totalAulas}
                aulasAgendadas={stats.aulasAgendadas}
                aulasRealizadas={stats.aulasRealizadas}
                aulasCanceladas={stats.aulasCanceladas}
                professoresCount={stats.professoresCount}
                disciplinasCount={stats.disciplinasCount}
                professores={professores}
                disciplinas={disciplinas}
                onSearch={handleSearch}
                onFilterChange={handleFilterChange}
            />
            <AulasTable
                onStatsUpdate={handleStatsUpdate}
                externalSearchTerm={searchTerm}
                externalFilters={filters}
            />
        </DashboardLayout>
    );
}