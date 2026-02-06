import DashboardLayout from "../layouts/DashboardLayout";
import UsuariosTable from "../components/Usuarios/UsuariosTable";
import UsuariosHeader from "../components/Usuarios/UsuariosHeader";

export default function UsuariosPage() {
  return (
    <DashboardLayout>
    <UsuariosHeader />
      <UsuariosTable />
    </DashboardLayout>
  );
}