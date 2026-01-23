import {
  FaHome,
  FaComments,
  FaSchool,
  FaChartPie,
  FaClipboardCheck,
  FaCalendarAlt
} from "react-icons/fa";

const relatorios = [
  {
    titulo: "Atividades para Casa",
    descricao: "Plano de atividades para continuidade do desenvolvimento",
    icon: <FaHome />
  },
  {
    titulo: "Orientações e Feedback",
    descricao: "Feedback clínico e pedagógico detalhado",
    icon: <FaComments />
  },
  {
    titulo: "Orientações para Escola",
    descricao: "Relatório de Inclusão",
    icon: <FaSchool />
  },
  {
    titulo: "Relatório Geral",
    descricao: "Visão geral de todos os pacientes",
    icon: <FaChartPie />
  },
  {
    titulo: "Relatório de Acompanhamento",
    descricao: "Diário / Semanal",
    icon: <FaClipboardCheck />
  },
  {
    titulo: "Relatório Semestral de Evolução",
    descricao: "Para Família e Convênio",
    icon: <FaCalendarAlt />
  }
];

export default function RelatoriosGrid() {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
        gap: "16px"
      }}
    >
      {relatorios.map((r, index) => (
        <div
          key={index}
          style={{
            background: "#fff",
            borderRadius: "12px",
            padding: "20px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            boxShadow: "0 4px 12px rgba(0,0,0,0.05)"
          }}
        >

          {/* Ícone */}
          <div
            style={{
              fontSize: "28px",
              color: "#2563eb",
              marginBottom: "12px"
            }}
          >
            {r.icon}
          </div>

          <div>
            <h3 style={{ marginBottom: "8px", color: "#333" }}>{r.titulo}</h3>
            <p style={{ fontSize: "14px", color: "#666" }}>
              {r.descricao}
            </p>
          </div>

          <button
            style={{
              marginTop: "16px",
              background: "#2563eb",
              color: "#fff",
              borderRadius: "8px",
              padding: "8px",
              border: "none"
            }}
          >
            Gerar relatório
          </button>
        </div>
      ))}
    </div>
  );
}
