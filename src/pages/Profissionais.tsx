import DashboardLayout from "../layouts/DashboardLayout";
import ProfissionaisHeader from "../components/Profissionais/ProfissionaisHeader";
import ProfissionaisTable from "../components/Profissionais/ProfissionaisTable";

export default function Profissionais() {
  return (
    <DashboardLayout>
      <ProfissionaisHeader />
      <ProfissionaisTable />
    </DashboardLayout>
  );
}
