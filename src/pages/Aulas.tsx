import DashboardLayout from "../layouts/DashboardLayout";
import AulasTable from "../components/Aulas/AulasTable";
import AulasHeader from "../components/Aulas/AulasHeader";

export default function AulasPage() {
    
    return (
        <DashboardLayout>
            <AulasHeader />
            <AulasTable />
        </DashboardLayout>
    );
}