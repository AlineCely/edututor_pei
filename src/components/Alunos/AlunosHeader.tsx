import { useNavigate } from "react-router-dom";
import { FaUsers, FaGraduationCap, FaUserCheck } from "react-icons/fa";

interface Props {
  totalAlunos: number;
  alunosAtivos: number;
  alunosPorEscola: { [key: string]: number };
  onSearch: (term: string) => void;
  onFilterChange: (filter: { status?: string; escola?: string; cid?: string }) => void;
}

export default function AlunosHeader({ 
  totalAlunos, 
  alunosAtivos,
  alunosPorEscola,
  onSearch,
  onFilterChange 
}: Props) {
  const navigate = useNavigate();

  const stats = [
    {
      label: "Total de Alunos",
      value: totalAlunos,
      icon: <FaUsers style={{ color: "#4F46E5", fontSize: "20px" }} />,
      bgColor: "linear-gradient(135deg, #f5f3ff 0%, #ede9fe 100%)",
      borderColor: "#ddd6fe"
    },
    {
      label: "Alunos Ativos",
      value: alunosAtivos,
      percent: totalAlunos > 0 ? Math.round((alunosAtivos / totalAlunos) * 100) : 0,
      icon: <FaUserCheck style={{ color: "#059669", fontSize: "20px" }} />,
      bgColor: "linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)",
      borderColor: "#bbf7d0"
    },
    {
      label: "Taxa de Atividade",
      value: totalAlunos > 0 ? `${Math.round((alunosAtivos / totalAlunos) * 100)}%` : "0%",
      icon: <FaGraduationCap style={{ color: "#0ea5e9", fontSize: "20px" }} />,
      bgColor: "linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)",
      borderColor: "#bae6fd"
    }
  ];

  return (
    <div style={{
      background: "#fff",
      borderRadius: "12px",
      padding: "24px",
      marginBottom: "24px",
      boxShadow: "0 2px 8px rgba(0,0,0,0.05)"
    }}>
      {/* Título e Botão */}
      <div style={{ 
        display: "flex", 
        justifyContent: "space-between", 
        alignItems: "center", 
        marginBottom: "24px" 
      }}>
        <div>
          <h1 style={{ 
            margin: 0, 
            fontSize: "24px", 
            fontWeight: "600",
            color: "#1f2937"
          }}>
            Gestão de Alunos
          </h1>
          <p style={{ 
            margin: "4px 0 0", 
            fontSize: "14px", 
            color: "#6b7280" 
          }}>
            Gerencie os alunos e suas informações
          </p>
        </div>
        
        <button
          onClick={() => navigate("/alunos/novo")}
          style={{
            padding: "12px 24px",
            borderRadius: "8px",
            border: "none",
            backgroundColor: "#4F46E5",
            color: "#fff",
            cursor: "pointer",
            fontSize: "14px",
            fontWeight: "600",
            display: "flex",
            alignItems: "center",
            gap: "8px",
            transition: "all 0.2s"
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = "#4338CA";
            e.currentTarget.style.transform = "translateY(-1px)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = "#4F46E5";
            e.currentTarget.style.transform = "translateY(0)";
          }}
        >
          <span style={{ fontSize: "18px" }}>+</span>
          Novo Aluno
        </button>
      </div>

      {/* Cards de Estatísticas */}
      <div style={{ 
        display: "grid", 
        gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", 
        gap: "16px",
        marginBottom: "24px"
      }}>
        {stats.map((stat, index) => (
          <div 
            key={index}
            style={{
              background: stat.bgColor,
              padding: "20px",
              borderRadius: "12px",
              border: `1px solid ${stat.borderColor}`,
              position: "relative",
              overflow: "hidden"
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div>
                <div style={{ fontSize: "14px", color: "#374151", fontWeight: "600", marginBottom: "8px" }}>
                  {stat.label}
                </div>
                <div style={{ fontSize: "32px", fontWeight: "700", color: "#1f2937" }}>
                  {stat.value}
                </div>
                {stat.percent !== undefined && (
                  <div style={{ fontSize: "12px", color: "#059669", marginTop: "4px" }}>
                    {stat.percent}% do total
                  </div>
                )}
              </div>
              <div style={{
                width: "40px",
                height: "40px",
                borderRadius: "10px",
                background: "rgba(255, 255, 255, 0.5)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center"
              }}>
                {stat.icon}
              </div>
            </div>
          </div>
        ))}

        {/* Distribuição por Escola */}
        <div style={{
          background: "linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)",
          padding: "20px",
          borderRadius: "12px",
          border: "1px solid #fcd34d",
          gridColumn: "span 3 / span 3"
        }}>
          <div style={{ fontSize: "14px", color: "#d97706", fontWeight: "600", marginBottom: "12px" }}>
            Distribuição por Escola
          </div>
          <div style={{ display: "flex", gap: "16px", flexWrap: "wrap" }}>
            {Object.entries(alunosPorEscola).map(([escola, quantidade], index) => (
              <div key={index} style={{
                flex: "1",
                minWidth: "120px",
                background: "rgba(255, 255, 255, 0.6)",
                padding: "12px",
                borderRadius: "8px",
                border: "1px solid rgba(251, 191, 36, 0.3)"
              }}>
                <div style={{ fontSize: "12px", color: "#92400e", marginBottom: "4px" }}>
                  {escola || "Sem escola"}
                </div>
                <div style={{ fontSize: "20px", fontWeight: "700", color: "#92400e" }}>
                  {quantidade}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Filtros e Busca */}
      <div style={{ 
        display: "grid", 
        gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", 
        gap: "16px" 
      }}>
        {/* Busca */}
        <div>
          <div style={{ fontSize: "14px", fontWeight: "500", marginBottom: "8px", color: "#374151" }}>
            Buscar Aluno
          </div>
          <input
            type="text"
            placeholder="Digite nome, responsável ou escola..."
            onChange={(e) => onSearch(e.target.value)}
            style={{ 
              width: "100%",
              padding: "12px 16px", 
              borderRadius: "8px", 
              border: "1px solid #d1d5db", 
              backgroundColor: "#fff", 
              color: "#374151",
              fontSize: "14px",
              transition: "all 0.2s"
            }}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = "#4F46E5";
              e.currentTarget.style.boxShadow = "0 0 0 3px rgba(79, 70, 229, 0.1)";
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = "#d1d5db";
              e.currentTarget.style.boxShadow = "none";
            }}
          />
        </div>

        {/* Filtro por Status */}
        <div>
          <div style={{ fontSize: "14px", fontWeight: "500", marginBottom: "8px", color: "#374151" }}>
            Status
          </div>
          <select 
            onChange={(e) => onFilterChange({ status: e.target.value || undefined })}
            style={{ 
              width: "100%",
              padding: "12px 16px", 
              borderRadius: "8px", 
              border: "1px solid #d1d5db", 
              backgroundColor: "#fff", 
              color: "#374151",
              fontSize: "14px",
              cursor: "pointer"
            }}
          >
            <option value="">Todos os status</option>
            <option value="Ativo">Ativo</option>
            <option value="Inativo">Inativo</option>
            <option value="Transferido">Transferido</option>
            <option value="Formado">Formado</option>
          </select>
        </div>

        {/* Filtro por Escola */}
        <div>
          <div style={{ fontSize: "14px", fontWeight: "500", marginBottom: "8px", color: "#374151" }}>
            Escola
          </div>
          <select 
            onChange={(e) => onFilterChange({ escola: e.target.value || undefined })}
            style={{ 
              width: "100%",
              padding: "12px 16px", 
              borderRadius: "8px", 
              border: "1px solid #d1d5db", 
              backgroundColor: "#fff", 
              color: "#374151",
              fontSize: "14px",
              cursor: "pointer"
            }}
          >
            <option value="">Todas as escolas</option>
            <option value="São Bento">São Bento</option>
            <option value="Centro Educacional">Centro Educacional</option>
            <option value="Vila Nova">Vila Nova</option>
            <option value="Santa Maria">Santa Maria</option>
          </select>
        </div>

        {/* Filtro por CID */}
        <div>
          <div style={{ fontSize: "14px", fontWeight: "500", marginBottom: "8px", color: "#374151" }}>
            CID
          </div>
          <select 
            onChange={(e) => onFilterChange({ cid: e.target.value || undefined })}
            style={{ 
              width: "100%",
              padding: "12px 16px", 
              borderRadius: "8px", 
              border: "1px solid #d1d5db", 
              backgroundColor: "#fff", 
              color: "#374151",
              fontSize: "14px",
              cursor: "pointer"
            }}
          >
            <option value="">Selecionar CID</option>
            <option value="F80">F80 - Transtornos específicos da fala e linguagem</option>
            <option value="F90">F90 - Transtornos hipercinéticos</option>
            <option value="F84">F84 - Transtornos globais do desenvolvimento</option>
            <option value="F70">F70 - Retardo mental leve</option>
            <option value="F71">F71 - Retardo mental moderado</option>
            <option value="F72">F72 - Retardo mental grave</option>
          </select>
        </div>

        {/* Botão Exportar */}
        <div style={{ display: "flex", alignItems: "flex-end", gap: "12px" }}>
          <button
            onClick={() => {
              // Função para exportar dados
              console.log("Exportar dados");
            }}
            style={{
              width: "100%",
              padding: "12px 16px",
              borderRadius: "8px",
              border: "1px solid #d1d5db",
              backgroundColor: "#fff",
              color: "#374151",
              cursor: "pointer",
              fontSize: "14px",
              fontWeight: "500",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "6px",
              transition: "all 0.2s"
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "#f9fafb";
              e.currentTarget.style.borderColor = "#9ca3af";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "#fff";
              e.currentTarget.style.borderColor = "#d1d5db";
            }}
          >
            <span>📊</span>
            Exportar
          </button>

          <button
            onClick={() => {
              onSearch("");
              onFilterChange({});
              const inputs = document.querySelectorAll('input[type="text"], select');
              inputs.forEach(input => {
                if (input instanceof HTMLInputElement) input.value = "";
                if (input instanceof HTMLSelectElement) input.value = "";
              });
            }}
            style={{
              width: "100%",
              padding: "12px 16px",
              borderRadius: "8px",
              border: "1px solid #d1d5db",
              backgroundColor: "#fff",
              color: "#374151",
              cursor: "pointer",
              fontSize: "14px",
              fontWeight: "500",
              transition: "all 0.2s"
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "#f9fafb";
              e.currentTarget.style.borderColor = "#9ca3af";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "#fff";
              e.currentTarget.style.borderColor = "#d1d5db";
            }}
          >
            Limpar Filtros
          </button>
        </div>
      </div>
    </div>
  );
}