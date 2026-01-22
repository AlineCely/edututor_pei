import DashboardLayout from "../layouts/DashboardLayout";
import AlunosTable from "../components/Alunos/AlunosTable";
import AlunosHeader from "../components/Alunos/AlunosHeader";

export default function Alunos() {
  return (
    <DashboardLayout>
      <AlunosHeader />
      <AlunosTable />
    </DashboardLayout>
  );
}
