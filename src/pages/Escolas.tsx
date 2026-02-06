import DashboardLayout from "../layouts/DashboardLayout";
import EscolasTable from "../components/Escolas/EscolasTable";
import EscolasHeader from "../components/Escolas/EscolasHeader";

export default function EscolasPage() {
    return (
        <DashboardLayout>
            <EscolasHeader />
            <EscolasTable />
        </DashboardLayout>
    );
}