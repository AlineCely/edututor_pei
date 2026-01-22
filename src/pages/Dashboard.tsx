import DashboardLayout from "../layouts/DashboardLayout";
import StatCard from "../components/Card/StatCard";
import LineChart from "../components/Charts/LineChart";
import DataTable from "../components/Table/DataTable";
import RelatorioAcompanhamento from "../components/Table/RelatorioAcompanhamento";
import OrientacoesEscola from "../components/Table/OrientacoesEscola";

export default function Dashboard() {
  return (
    <DashboardLayout>
      <h1>Dashboard</h1>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: "16px",
          marginTop: "24px"
        }}>  
        <StatCard title="Total de Alunos" value="9" subtitle="Cadastrados no sistema" icon="🎓" color="#4F46E5"/>
        <StatCard title="Alunos Ativos" value="9" subtitle="Em acompanhamento" icon="✅" color="#16A34A"/>
        <StatCard title="Atendimentos Hoje" value="0" subtitle="Sessões registradas" icon="🗓️" color="#F97316"/>
        <StatCard title="Próximos Atendimentos" value="0" subtitle="Agendados" icon="⏳" color="#0EA5E9"/>
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", marginTop: "24px" }}>
        <RelatorioAcompanhamento />
        <LineChart />
      </div>
      <DataTable />

      <OrientacoesEscola />

    </DashboardLayout>
  );
}
