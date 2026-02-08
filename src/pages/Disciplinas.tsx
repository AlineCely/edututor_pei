import DashboardLayout from "../layouts/DashboardLayout";
import DisciplinasHeader from "../components/Disciplinas/DisciplinasHeader";
import DisciplinasTable from "../components/Disciplinas/DisciplinasTable";
import { useState, useCallback } from "react";

export default function Disciplinas() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState<{ status?: string; categoria?: string }>({});
  const [stats, setStats] = useState({
    totalDisciplinas: 0,
    disciplinasAtivas: 0,
    disciplinasInativas: 0,
    categoriasCount: 0
  });
  const [categorias, setCategorias] = useState<string[]>([]);

  // Função para atualizar estatísticas (chamada pelo DisciplinasTable)
  const handleStatsUpdate = useCallback((newStats: {
    totalDisciplinas: number;
    disciplinasAtivas: number;
    disciplinasInativas: number;
    categoriasCount: number;
    categoriasDisponiveis: string[];
  }) => {
    setStats({
      totalDisciplinas: newStats.totalDisciplinas,
      disciplinasAtivas: newStats.disciplinasAtivas,
      disciplinasInativas: newStats.disciplinasInativas,
      categoriasCount: newStats.categoriasCount
    });
    setCategorias(newStats.categoriasDisponiveis);
  }, []);

  // Funções de busca e filtro
  const handleSearch = useCallback((term: string) => {
    setSearchTerm(term);
  }, []);

  const handleFilterChange = useCallback((filter: { status?: string; categoria?: string }) => {
    setFilters(filter);
  }, []);

  return (
    <DashboardLayout>
      <DisciplinasHeader
        totalDisciplinas={stats.totalDisciplinas}
        disciplinasAtivas={stats.disciplinasAtivas}
        disciplinasInativas={stats.disciplinasInativas}
        categoriasCount={stats.categoriasCount}
        categoriasDisponiveis={categorias}
        onSearch={handleSearch}
        onFilterChange={handleFilterChange}
      />
      <DisciplinasTable
        onStatsUpdate={handleStatsUpdate}
        externalSearchTerm={searchTerm}
        externalFilters={filters}
      />
    </DashboardLayout>
  );
}