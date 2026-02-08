import DashboardLayout from "../layouts/DashboardLayout";
import AlunosTable from "../components/Alunos/AlunosTable";
import AlunosHeader from "../components/Alunos/AlunosHeader";
import { useState, useCallback } from "react";

export default function Alunos() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState<{ status?: string; escola?: string; cid?: string }>({});
  const [stats, setStats] = useState({
    totalAlunos: 0,
    alunosAtivos: 0,
    alunosPorEscola: {} as { [key: string]: number }
  });

  // Função para atualizar estatísticas (chamada pelo AlunosTable)
  const handleStatsUpdate = useCallback((newStats: {
    totalAlunos: number;
    alunosAtivos: number;
    alunosPorEscola: { [key: string]: number };
  }) => {
    setStats(newStats);
  }, []);

  // Funções de busca e filtro
  const handleSearch = useCallback((term: string) => {
    setSearchTerm(term);
  }, []);

  const handleFilterChange = useCallback((filter: { status?: string; escola?: string; cid?: string }) => {
    setFilters(filter);
  }, []);

  return (
    <DashboardLayout>
      <AlunosHeader 
        totalAlunos={stats.totalAlunos}
        alunosAtivos={stats.alunosAtivos}
        alunosPorEscola={stats.alunosPorEscola}
        onSearch={handleSearch}
        onFilterChange={handleFilterChange}
      />
      <AlunosTable 
        onStatsUpdate={handleStatsUpdate}
        externalSearchTerm={searchTerm}
        externalFilters={filters}
      />
    </DashboardLayout>
  );
}