import {
  LineChart as ReLineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid
} from "recharts";

const data = [
  { month: "Jan", alunos: 30, ativos: 28 },
  { month: "Feb", alunos: 32, ativos: 30 },
  { month: "Mar", alunos: 31, ativos: 29 },
  { month: "Apr", alunos: 35, ativos: 33 },
  { month: "May", alunos: 36, ativos: 34 },
  { month: "Jun", alunos: 38, ativos: 36 },
  { month: "Jul", alunos: 40, ativos: 38 }
];

export default function LineChart() {
  return (
    <div
      style={{
        background: "#fff",
        borderRadius: "12px",
        padding: "30px",
        height: "343px",
        width: "620px",
        border: "1px solid #eee",
        color: "#666"
      }}
    >
      <h3>Relatório Geral</h3>

      <ResponsiveContainer width="100%" height="81%">
        <ReLineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="month" />
          <YAxis />
          <Tooltip />
          <Line type="monotone" dataKey="alunos" stroke="#4F46E5" />
          <Line type="monotone" dataKey="ativos" stroke="#F97316" />
        </ReLineChart>
      </ResponsiveContainer>
    </div>
  );
}
