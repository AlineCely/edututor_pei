import DashboardLayout from "../layouts/DashboardLayout";
import FamiliasTable from "../components/Familias/FamiliasTable";
import FamiliasHeader from "../components/Familias/FamiliasHeader";
import { useState, useCallback } from "react";

export default function FamiliasPage() {
    const [searchTerm, setSearchTerm] = useState("");
    const [filters, setFilters] = useState<{ telefone?: boolean; email?: boolean }>({});
    const [stats, setStats] = useState({
        totalFamilias: 0,
        familiasComTelefone: 0,
        familiasComEmail: 0
    });

    // Função para atualizar estatísticas (chamada pelo FamiliasTable)
    const handleStatsUpdate = useCallback((newStats: {
        totalFamilias: number;
        familiasComTelefone: number;
        familiasComEmail: number;
    }) => {
        setStats(newStats);
    }, []);

    // Funções de busca e filtro
    const handleSearch = useCallback((term: string) => {
        setSearchTerm(term);
    }, []);

    const handleFilterChange = useCallback((filter: { telefone?: boolean; email?: boolean }) => {
        setFilters(filter);
    }, []);

    return (
        <DashboardLayout>
            <FamiliasHeader
                totalFamilias={stats.totalFamilias}
                familiasComTelefone={stats.familiasComTelefone}
                familiasComEmail={stats.familiasComEmail}
                onSearch={handleSearch}
                onFilterChange={handleFilterChange}
            />
            <FamiliasTable
                onStatsUpdate={handleStatsUpdate}
                externalSearchTerm={searchTerm}
                externalFilters={filters}
            />
        </DashboardLayout>
    );
}