import DashboardLayout from "../layouts/DashboardLayout";
import ProfissionaisHeader from "../components/Profissionais/ProfissionaisHeader";
import ProfissionaisTable from "../components/Profissionais/ProfissionaisTable";
import { useState, useCallback } from "react";

export default function Profissionais() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState<{ disciplina?: string; tipo?: string }>({});
  const [stats, setStats] = useState({
    totalProfissionais: 0,
    profissionaisPorTipo: {} as { [key: string]: number },
    valorMedioHora: 0
  });

  // Função para atualizar estatísticas (chamada pelo ProfissionaisTable)
  const handleStatsUpdate = useCallback((newStats: {
    totalProfissionais: number;
    profissionaisPorTipo: { [key: string]: number };
    valorMedioHora: number;
  }) => {
    setStats(newStats);
  }, []);

  // Funções de busca e filtro
  const handleSearch = useCallback((term: string) => {
    setSearchTerm(term);
  }, []);

  const handleFilterChange = useCallback((filter: { disciplina?: string; tipo?: string }) => {
    setFilters(filter);
  }, []);

  return (
    <DashboardLayout>
      <ProfissionaisHeader
        totalProfissionais={stats.totalProfissionais}
        profissionaisPorTipo={stats.profissionaisPorTipo}
        valorMedioHora={stats.valorMedioHora}
        onSearch={handleSearch}
        onFilterChange={handleFilterChange}
      />
      <ProfissionaisTable
        onStatsUpdate={handleStatsUpdate}
        externalSearchTerm={searchTerm}
        externalFilters={filters}
      />
    </DashboardLayout>
  );
}