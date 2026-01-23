import DashboardLayout from "../layouts/DashboardLayout";
import RelatoriosHeader from "../components/Relatorios/RelatoriosHeader.tsx";
import RelatoriosGrid from "../components/Relatorios/RelatoriosGrid";

export default function Relatorios() {
  return (
    <DashboardLayout>
      <RelatoriosHeader />
      <RelatoriosGrid />
    </DashboardLayout>
  );
}
