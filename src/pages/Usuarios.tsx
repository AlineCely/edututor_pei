import DashboardLayout from "../layouts/DashboardLayout";
import UsuariosTable from "../components/Usuarios/UsuariosTable";
import UsuariosHeader from "../components/Usuarios/UsuariosHeader";
import { useState, useCallback } from "react";

export default function UsuariosPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState<{ status?: string; tipo?: string }>({});
  const [stats, setStats] = useState({
    totalUsuarios: 0,
    usuariosAtivos: 0,
    usuariosPorTipo: {
      GESTOR: 0,
      PROFISSIONAL: 0,
      FAMILIA: 0
    }
  });

  // Esta função será chamada pelo UsuariosTable quando os dados forem carregados
  const handleStatsUpdate = useCallback((newStats: {
    totalUsuarios: number;
    usuariosAtivos: number;
    usuariosPorTipo: {
      GESTOR: number;
      PROFISSIONAL: number;
      FAMILIA: number;
    };
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
      <UsuariosHeader
        totalUsuarios={stats.totalUsuarios}
        usuariosAtivos={stats.usuariosAtivos}
        usuariosPorTipo={stats.usuariosPorTipo}
        onSearch={handleSearch}
        onFilterChange={handleFilterChange}
      />
      <UsuariosTable
        onStatsUpdate={handleStatsUpdate}
        externalSearchTerm={searchTerm}
        externalFilters={filters}
      />
    </DashboardLayout>
  );
}