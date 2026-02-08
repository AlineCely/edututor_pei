import DashboardLayout from "../layouts/DashboardLayout";
import AvaliacoesTable from "../components/Avaliacoes/AvaliacoesTable";
import AvaliacoesHeader from "../components/Avaliacoes/AvaliacoesHeader"
import { useState } from "react";

export default function AvaliacoesPage() {
    const [aulas, setAulas] = useState<any[]>([]);
    const [totalAvaliacoes, setTotalAvaliacoes] = useState<number>(0);
    const [mediaGeral, setMediaGeral] = useState<number>(0);
    const [avaliacoesPorStatus, setAvaliacoesPorStatus] = useState<Record<string, number>>({});
    const [professoresAvaliados, setProfessoresAvaliados] = useState<number>(0);
    const [aulasAvaliadas, setAulasAvaliadas] = useState<number>(0);
    const [professores, setProfessores] = useState<any[]>([]);

    return (
        <DashboardLayout>
            <AvaliacoesHeader
                totalAvaliacoes={totalAvaliacoes}
                mediaGeral={mediaGeral}
                avaliacoesPorStatus={avaliacoesPorStatus}
                professoresAvaliados={professoresAvaliados}
                aulasAvaliadas={aulasAvaliadas}
                // onSearch={handleSearch}
                // onFilterChange={handleFilterChange}
                professores={professores}
                aulas={aulas}
            />
            <AvaliacoesTable />
        </DashboardLayout>
    );
}