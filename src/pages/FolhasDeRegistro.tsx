import DashboardLayout from "../layouts/DashboardLayout";
import FolhasRegistroHeader from "../components/FolhasRegistro/FolhasRegistroHeader";
import FolhasRegistroTable from "../components/FolhasRegistro/FolhasRegistroTable";

export default function FolhasDeRegistro() {
  return (
    <DashboardLayout>
      <FolhasRegistroHeader />
      <FolhasRegistroTable />
    </DashboardLayout>
  );
}
