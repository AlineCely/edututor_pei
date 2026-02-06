import DashboardLayout from "../layouts/DashboardLayout";
import TurmasTable from "../components/Turma/TurmasTable";
import TurmasHeader from "../components/Turma/TurmasHeader";

export default function TurmasPage() {
    return (
        <DashboardLayout>
            <TurmasHeader />
            <TurmasTable />
        </DashboardLayout>
    );
}