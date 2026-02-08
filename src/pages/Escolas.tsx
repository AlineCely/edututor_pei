import DashboardLayout from "../layouts/DashboardLayout";
import EscolasTable from "../components/Escolas/EscolasTable";
import EscolasHeader from "../components/Escolas/EscolasHeader";
import { useState, useCallback } from "react";

export default function EscolasPage() {
    const [searchTerm, setSearchTerm] = useState("");
    const [filters, setFilters] = useState<{ status?: string; tipo?: string }>({});
    const [stats, setStats] = useState({
        totalEscolas: 0,
        escolasAtivas: 0,

    });

    // Esta função será chamada pelo UsuariosTable quando os dados forem carregados
    const handleStatsUpdate = useCallback((newStats: {
        totalEscolas: number;
        escolasAtivas: number;
    }) => {
        setStats(newStats);
    }, []);

    // Funções de busca e filtro
    const handleSearch = useCallback((term: string) => {
        setSearchTerm(term);
    }, []);

    const handleFilterChange = useCallback((filter: { status?: string; tipo?: string }) => {
        setFilters(filter);
    }, []);

    return (
        <DashboardLayout>
            <EscolasHeader
                totalEscolas={stats.totalEscolas}
                escolasAtivas={stats.escolasAtivas}
                onSearch={handleSearch}
                onFilterChange={handleFilterChange}
            />
            <EscolasTable
                onStatsUpdate={handleStatsUpdate}
                externalSearchTerm={searchTerm}
                externalFilters={filters}
            />
        </DashboardLayout>
    );
}