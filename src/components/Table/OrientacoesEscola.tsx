interface Orientacao {
  nome: string;
  periodo: string;
  resultado: string;
  meta: string;
}

const orientacoes: Orientacao[] = [
  {
    nome: "Nome Completo",
    periodo: "01/07/2025 a 01/01/2026",
    resultado: "Boa adaptação ao ambiente escolar",
    meta: "Manter rotina visual estruturada"
  },
  {
    nome: "Nome Completo",
    periodo: "01/07/2025 a 01/01/2026",
    resultado: "Dificuldades em atividades coletivas",
    meta: "Apoio mediado em grupo"
  }
];

export default function OrientacoesEscolaTable() {
  return (
    <div
      style={{
        background: "#FFFFFF",
        borderRadius: "14px",
        padding: "20px",
        marginTop: "32px",
        boxShadow: "0 4px 20px rgba(0,0,0,0.04)"
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "16px"
        }}
      >
        <div>
          <h3
            style={{
              fontSize: "16px",
              fontWeight: 600,
              color: "#111827"
            }}
          >
            Orientações para Escola
          </h3>

          <span
            style={{
              fontSize: "12px",
              color: "#16A34A",
              background: "#DCFCE7",
              padding: "4px 10px",
              borderRadius: "999px",
              fontWeight: 500
            }}
          >
            Relatório de Inclusão
          </span>
        </div>

        <button
          style={{
            border: "1px solid #E5E7EB",
            background: "#FFFFFF",
            padding: "8px 14px",
            borderRadius: "10px",
            fontSize: "13px",
            cursor: "pointer",
            color: "#374151",
          }}
        >
          Filtros
        </button>
      </div>

      {/* Table */}
      <table
        style={{
          width: "100%",
          borderCollapse: "collapse"
        }}
      >
        <thead>
          <tr
            style={{
              textAlign: "left",
              borderBottom: "1px solid #E5E7EB"
            }}
          >
            <th style={thStyle}>Paciente</th>
            <th style={thStyle}>Período</th>
            <th style={thStyle}>Resultados Quantitativos</th>
            <th style={thStyle}>Metas para o Próximo Semestre</th>
          </tr>
        </thead>

        <tbody>
          {orientacoes.map((item, index) => (
            <tr
              key={index}
              style={{
                borderBottom: "1px solid #F1F5F9"
              }}
            >
              <td style={tdStyle}>
                <div style={{ fontWeight: 500 }}>{item.nome}</div>
                <span style={{ fontSize: "12px", color: "#6B7280" }}>
                  Data de Nascimento
                </span>
              </td>

              <td style={tdStyle}>{item.periodo}</td>
              <td style={tdStyle}>{item.resultado}</td>
              <td style={tdStyle}>{item.meta}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Pagination */}
      <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
          gap: "6px",
          marginTop: "16px"
        }}
      >
        {[1, 2, 3, 4, 5].map((page) => (
          <button
            key={page}
            style={{
              width: "32px",
              height: "32px",
              borderRadius: "8px",
              border: "1px solid #E5E7EB",
              background: page === 1 ? "#4F46E5" : "#FFFFFF",
              color: page === 1 ? "#FFFFFF" : "#111827",
              fontSize: "13px",
              cursor: "pointer"
            }}
          >
            {page}
          </button>
        ))}
      </div>
    </div>
  );
}

/* Reutilização de estilos */
const thStyle: React.CSSProperties = {
  padding: "12px 8px",
  fontSize: "13px",
  fontWeight: 600,
  color: "#6B7280"
};

const tdStyle: React.CSSProperties = {
  padding: "14px 8px",
  fontSize: "14px",
  color: "#111827",
  verticalAlign: "top"
};
