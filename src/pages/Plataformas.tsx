import PlataformasHeader from "../components/Plataformas/PlataformasHeader";
import PlataformasTable from "../components/Plataformas/PlataformasTable";
import DashboardLayout from "../layouts/DashboardLayout";

export default function Plataformas() {

  return (
    <DashboardLayout>
        <PlataformasHeader />
        <PlataformasTable />
    </DashboardLayout>
  );
}
