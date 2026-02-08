import DashboardLayout from "../layouts/DashboardLayout";
import TurmasTable from "../components/Turma/TurmasTable";
import TurmasHeader from "../components/Turma/TurmasHeader";
import { useState, useCallback } from "react";

export default function TurmasPage() {
    const [searchTerm, setSearchTerm] = useState("");
    const [filters, setFilters] = useState<{ status?: string; professor?: string }>({});
    const [stats, setStats] = useState({
        totalTurmas: 0,
        turmasAtivas: 0,
        turmasFinalizadas: 0,
        professoresCount: 0
    });

    // Função para atualizar estatísticas (chamada pelo TurmasTable)
    const handleStatsUpdate = useCallback((newStats: {
        totalTurmas: number;
        turmasAtivas: number;
        turmasFinalizadas: number;
        professoresCount: number;
    }) => {
        setStats(newStats);
    }, []);

    // Funções de busca e filtro
    const handleSearch = useCallback((term: string) => {
        setSearchTerm(term);
    }, []);

    const handleFilterChange = useCallback((filter: { status?: string; professor?: string }) => {
        setFilters(filter);
    }, []);

    return (
        <DashboardLayout>
            <TurmasHeader
                totalTurmas={stats.totalTurmas}
                turmasAtivas={stats.turmasAtivas}
                turmasFinalizadas={stats.turmasFinalizadas}
                professoresCount={stats.professoresCount}
                onSearch={handleSearch}
                onFilterChange={handleFilterChange}
            />
            <TurmasTable
                onStatsUpdate={handleStatsUpdate}
                externalSearchTerm={searchTerm}
                externalFilters={filters}
            />
        </DashboardLayout>
    );
}