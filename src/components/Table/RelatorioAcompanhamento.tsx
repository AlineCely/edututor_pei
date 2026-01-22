import TableBase from "./TableBase";

export default function AcompanhamentoTable() {

  return (
    <TableBase
      title="Relatório de Acompanhamento"
      headers={["Indicador", "Valor", "Tendência"]}
      actions={<span style={{ color: "#22C55E", fontWeight: "bold" }}>Diário / Semanal (Interno)</span>}
    >

      {/* Linha em branco para espaçamento */}
      <tr>
        <td colSpan={3} style={{ padding: "8px", backgroundColor: "#035bb4" }}></td>
      </tr>

      {/* Percentual principal */}
      <tr>
        <td style={{ padding: "16px", fontWeight: "bold", fontSize: "18px" }}>
          Percentual Geral
        </td>
        <td style={{ padding: "16px", fontSize: "24px", fontWeight: "bold" }}>
          75.55%
        </td>
        <td style={{ padding: "16px", color: "#10B981", fontWeight: "bold" }}>
          +10%
        </td>
      </tr>

      {/* Gráficos de habilidades */}
      <tr>
        <td colSpan={3} style={{ padding: "16px", paddingTop: "8px", paddingBottom: "24px" }}>
          <div style={{ fontWeight: "bold", marginBottom: "8px" }}>
            Gráficos de habilidades, comportamento-ABC, assiduidade e desempenho por disciplina
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", maxWidth: "400px" }}>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: "20px", fontWeight: "bold", color: "#EF4444" }}>9% ↓</div>
              <div style={{ fontSize: "12px", color: "#6B7280" }}>semanal</div>
            </div>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: "20px", fontWeight: "bold", color: "#10B981" }}>30 ↑</div>
              <div style={{ fontSize: "12px", color: "#6B7280" }}>anual</div>
            </div>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: "20px", fontWeight: "bold", color: "#10B981" }}>70 ↑</div>
              <div style={{ fontSize: "12px", color: "#6B7280" }}>diario</div>
            </div>
          </div>
        </td>
      </tr>

    </TableBase>
  );
}