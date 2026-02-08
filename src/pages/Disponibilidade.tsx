import DashboardLayout from "../layouts/DashboardLayout";
import DisponibilidadeTable from "../components/Disponibilidade/DisponibilidadeTable";
import DisponibilidadeHeader from "../components/Disponibilidade/DisponibilidadeHeader";
import { useState } from "react";

export default function DisponibilidadePage() {

    const [professores, setProfessores] = useState<any[]>([]);
    const [disponibilidadesAtivas, setDisponibilidadesAtivas] = useState<Disponibilidade[]>([]);
    const [professoresComDisponibilidade, setProfessoresComDisponibilidade] = useState<number>(0);
    const [horasTotaisDisponiveis, setHorasTotaisDisponiveis] = useState<number>(0);
    const [totalCount, setTotalCount] = useState<number>(0);

    return (
        <DashboardLayout>
            <DisponibilidadeHeader
                totalDisponibilidades={totalCount}
                disponibilidadesAtivas={disponibilidadesAtivas}
                professoresComDisponibilidade={professoresComDisponibilidade}
                horasTotaisDisponiveis={Math.round(horasTotaisDisponiveis)}
                // onSearch={handleSearch}
                // onFilterChange={handleFilterChange}
                professores={professores}
            />
            <DisponibilidadeTable />
        </DashboardLayout>
    );
}