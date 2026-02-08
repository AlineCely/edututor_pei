import DashboardLayout from "../layouts/DashboardLayout";
import AvaliacoesTable from "../components/Avaliacoes/AvaliacoesTable";
import AvaliacoesHeader from "../components/Avaliacoes/AvaliacoesHeader";
import { useState } from "react";

export default function AvaliacoesPage() {
    const [aulas, setAulas] = useState<any[]>([]);
    const [totalAvaliacoes, setTotalAvaliacoes] = useState<number>(0);
    const [mediaGeral, setMediaGeral] = useState<number>(0);
    const [avaliacoesPorStatus, setAvaliacoesPorStatus] = useState({
        positivas: 0,
        neutras: 0,
        negativas: 0
    });
    const [professoresAvaliados, setProfessoresAvaliados] = useState<number>(0);
    const [aulasAvaliadas, setAulasAvaliadas] = useState<number>(0);
    const [professores, setProfessores] = useState<any[]>([]);
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
            <AvaliacoesHeader
                totalAvaliacoes={totalAvaliacoes}
                mediaGeral={mediaGeral}
                avaliacoesPorStatus={avaliacoesPorStatus}
                professoresAvaliados={professoresAvaliados}
                aulasAvaliadas={aulasAvaliadas}
                onSearch={handleSearch}
                onFilterChange={handleFilterChange}
                professores={professores}
                aulas={aulas}
            />
            <AvaliacoesTable 
                searchTerm={searchTerm}
                filters={filters}
                onUpdateStats={(stats) => {
                    setTotalAvaliacoes(stats.totalAvaliacoes);
                    setMediaGeral(stats.mediaGeral);
                    setAvaliacoesPorStatus(stats.avaliacoesPorStatus);
                    setProfessoresAvaliados(stats.professoresAvaliados);
                    setAulasAvaliadas(stats.aulasAvaliadas);
                }}
                onUpdateProfessores={setProfessores}
                onUpdateAulas={setAulas}
            />
        </DashboardLayout>
    );
}