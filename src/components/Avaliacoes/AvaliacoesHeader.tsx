import { useNavigate } from "react-router-dom";
import { 
  FaStar, 
  FaChartBar, 
  FaUserGraduate, 
  FaCalendarAlt, 
  FaSearch,
  FaFilter,
  FaFileExport,
  FaPlus
} from "react-icons/fa";

interface Props {
  totalAvaliacoes: number;
  mediaGeral: number;
  avaliacoesPorStatus: {
    positivas: number;
    neutras: number;
    negativas: number;
  };
  professoresAvaliados: number;
  aulasAvaliadas: number;
  onSearch: (term: string) => void;
  onFilterChange: (filter: { 
    professor?: string; 
    aula?: string;
    notaMin?: number;
    notaMax?: number;
    dataInicio?: string;
    dataFim?: string;
  }) => void;
  professores: any[];
  aulas: any[];
}

export default function AvaliacoesHeader({ 
  totalAvaliacoes, 
  mediaGeral,
  avaliacoesPorStatus,
  professoresAvaliados,
  aulasAvaliadas,
  onSearch,
  onFilterChange,
  professores,
  aulas
}: Props) {
  const navigate = useNavigate();

  const stats = [
    {
      label: "Total Avaliações",
      value: totalAvaliacoes,
      icon: <FaStar style={{ color: "#4F46E5", fontSize: "20px" }} />,
      bgColor: "linear-gradient(135deg, #f5f3ff 0%, #ede9fe 100%)",
      borderColor: "#ddd6fe"
    },
    {
      label: "Média Geral",
      value: mediaGeral.toFixed(1),
      subtitle: "/ 10",
      icon: <FaChartBar style={{ color: "#059669", fontSize: "20px" }} />,
      bgColor: "linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)",
      borderColor: "#bbf7d0"
    },
    {
      label: "Positivas",
      value: avaliacoesPorStatus.positivas,
      percent: totalAvaliacoes > 0 ? Math.round((avaliacoesPorStatus.positivas / totalAvaliacoes) * 100) : 0,
      icon: <FaStar style={{ color: "#f59e0b", fontSize: "20px" }} />,
      bgColor: "linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)",
      borderColor: "#fcd34d"
    },
    {
      label: "Professores",
      value: professoresAvaliados,
      icon: <FaUserGraduate style={{ color: "#0ea5e9", fontSize: "20px" }} />,
      bgColor: "linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)",
      borderColor: "#bae6fd"
    },
    {
      label: "Aulas Avaliadas",
      value: aulasAvaliadas,
      icon: <FaCalendarAlt style={{ color: "#8b5cf6", fontSize: "20px" }} />,
      bgColor: "linear-gradient(135deg, #faf5ff 0%, #f3e8ff 100%)",
      borderColor: "#e9d5ff"
    }
  ];

  // Gerar opções de notas
  const notaOptions = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

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
            Avaliações de Professores
          </h1>
          <p style={{ 
            margin: "4px 0 0", 
            fontSize: "14px", 
            color: "#6b7280" 
          }}>
            Gerencie as avaliações dos professores por aula
          </p>
        </div>
        
        <button
          onClick={() => navigate("/avaliacoes/novo")}
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
          <FaPlus size={16} />
          Nova Avaliação
        </button>
      </div>

      {/* Cards de Estatísticas */}
      <div style={{ 
        display: "grid", 
        gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", 
        gap: "12px",
        marginBottom: "24px"
      }}>
        {stats.map((stat, index) => (
          <div 
            key={index}
            style={{
              background: stat.bgColor,
              padding: "16px",
              borderRadius: "10px",
              border: `1px solid ${stat.borderColor}`,
              position: "relative",
              overflow: "hidden"
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div>
                <div style={{ fontSize: "13px", color: "#374151", fontWeight: "600", marginBottom: "6px" }}>
                  {stat.label}
                </div>
                <div style={{ display: "flex", alignItems: "baseline", gap: "4px" }}>
                  <span style={{ fontSize: "24px", fontWeight: "700", color: "#1f2937" }}>
                    {stat.value}
                  </span>
                  {stat.subtitle && (
                    <span style={{ fontSize: "12px", color: "#6b7280" }}>
                      {stat.subtitle}
                    </span>
                  )}
                </div>
                {stat.percent !== undefined && (
                  <div style={{ 
                    fontSize: "11px", 
                    color: stat.label.includes("Positivas") ? "#d97706" : "#6b7280", 
                    marginTop: "4px" 
                  }}>
                    {stat.percent}% do total
                  </div>
                )}
              </div>
              <div style={{
                width: "36px",
                height: "36px",
                borderRadius: "8px",
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
            <FaSearch style={{ marginRight: "8px" }} />
            Buscar Avaliação
          </div>
          <input
            type="text"
            placeholder="Buscar por comentário..."
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

        {/* Filtro por Professor */}
        <div>
          <div style={{ fontSize: "14px", fontWeight: "500", marginBottom: "8px", color: "#374151" }}>
            <FaFilter style={{ marginRight: "8px" }} />
            Professor
          </div>
          <select 
            onChange={(e) => onFilterChange({ professor: e.target.value || undefined })}
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
            <option value="">Todos os professores</option>
            {professores.map((prof) => (
              <option key={prof.Professor_ID} value={prof.Professor_ID}>
                {prof.Usuarios?.Nome || `Professor ${prof.Professor_ID}`}
              </option>
            ))}
          </select>
        </div>

        {/* Filtro por Aula */}
        <div>
          <div style={{ fontSize: "14px", fontWeight: "500", marginBottom: "8px", color: "#374151" }}>
            Aula
          </div>
          <select 
            onChange={(e) => onFilterChange({ aula: e.target.value || undefined })}
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
            <option value="">Todas as aulas</option>
            {aulas.map((aula) => (
              <option key={aula.Aula_ID} value={aula.Aula_ID}>
                Aula #{aula.Aula_ID} - {formatDateShort(aula.Data_hora_inicio)}
              </option>
            ))}
          </select>
        </div>

        {/* Filtro por Nota Mínima */}
        <div>
          <div style={{ fontSize: "14px", fontWeight: "500", marginBottom: "8px", color: "#374151" }}>
            Nota Mínima
          </div>
          <select 
            onChange={(e) => onFilterChange({ notaMin: parseInt(e.target.value) || undefined })}
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
            <option value="">Qualquer nota</option>
            {notaOptions.map((nota) => (
              <option key={`min-${nota}`} value={nota}>
                {nota} estrela{nota !== 1 ? 's' : ''}
              </option>
            ))}
          </select>
        </div>

        {/* Filtro por Nota Máxima */}
        <div>
          <div style={{ fontSize: "14px", fontWeight: "500", marginBottom: "8px", color: "#374151" }}>
            Nota Máxima
          </div>
          <select 
            onChange={(e) => onFilterChange({ notaMax: parseInt(e.target.value) || undefined })}
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
            <option value="">Qualquer nota</option>
            {notaOptions.map((nota) => (
              <option key={`max-${nota}`} value={nota}>
                {nota} estrela{nota !== 1 ? 's' : ''}
              </option>
            ))}
          </select>
        </div>

        {/* Filtro por Data Início */}
        <div>
          <div style={{ fontSize: "14px", fontWeight: "500", marginBottom: "8px", color: "#374151" }}>
            Data Início
          </div>
          <input
            type="date"
            onChange={(e) => onFilterChange({ dataInicio: e.target.value || undefined })}
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
          />
        </div>

        {/* Botão Exportar */}
        <div style={{ display: "flex", alignItems: "flex-end" }}>
          <button
            onClick={() => {
              console.log("Exportar relatório de avaliações");
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
            <FaFileExport />
            Exportar
          </button>
        </div>

        {/* Botão Limpar */}
        <div style={{ display: "flex", alignItems: "flex-end" }}>
          <button
            onClick={() => {
              onSearch("");
              onFilterChange({});
              const inputs = document.querySelectorAll('input[type="text"], input[type="date"], select');
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

// Função auxiliar para formatar data
function formatDateShort(dateString: string | null) {
  if (!dateString) return "";
  const date = new Date(dateString);
  return date.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short"
  });
}