import DashboardLayout from "../layouts/DashboardLayout";
import FamiliasTable from "../components/Familias/FamiliasTable";
import FamiliasHeader from "../components/Familias/FamiliasHeader"

export default function FamiliasPage() {
    return (
        <DashboardLayout>
            <FamiliasHeader />
            <FamiliasTable />
        </DashboardLayout>
    );
}