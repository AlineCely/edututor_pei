import DashboardLayout from "../layouts/DashboardLayout";
import DisponibilidadeTable from "../components/Disponibilidade/DisponibilidadeTable";
import DisponibilidadeHeader from "../components/Disponibilidade/DisponibilidadeHeader";
import { useState } from "react";

export default function DisponibilidadePage() {
    const [professores, setProfessores] = useState<any[]>([]);
    const [totalCount, setTotalCount] = useState<number>(0);
    const [disponibilidadesAtivas, setDisponibilidadesAtivas] = useState<number>(0);
    const [professoresComDisponibilidade, setProfessoresComDisponibilidade] = useState<number>(0);
    const [horasTotaisDisponiveis, setHorasTotaisDisponiveis] = useState<number>(0);
    const [searchTerm, setSearchTerm] = useState("");
    const [filters, setFilters] = useState<any>({});

    const handleSearch = (term: string) => {
        setSearchTerm(term);
    };

    const handleFilterChange = (filter: any) => {
        setFilters((prev: any) => ({ ...prev, ...filter }));
    };

    return (
        <DashboardLayout>
            <DisponibilidadeHeader
                totalDisponibilidades={totalCount}
                disponibilidadesAtivas={disponibilidadesAtivas}
                professoresComDisponibilidade={professoresComDisponibilidade}
                horasTotaisDisponiveis={Math.round(horasTotaisDisponiveis)}
                onSearch={handleSearch}
                onFilterChange={handleFilterChange}
                professores={professores}
            />
            <DisponibilidadeTable 
                searchTerm={searchTerm}
                filters={filters}
                onUpdateStats={(stats) => {
                    setTotalCount(stats.totalDisponibilidades);
                    setDisponibilidadesAtivas(stats.disponibilidadesAtivas);
                    setProfessoresComDisponibilidade(stats.professoresComDisponibilidade);
                    setHorasTotaisDisponiveis(stats.horasTotaisDisponiveis);
                }}
                onUpdateProfessores={setProfessores}
            />
        </DashboardLayout>
    );
}