import { useNavigate } from "react-router-dom";
import { FaUsers, FaChalkboardTeacher, FaMoneyBillWave } from "react-icons/fa";

interface ProfissionaisHeaderProps {
  totalProfissionais: number;
  total: number;
  profissionaisPorTipo: { [key: string]: number };
  valorMedioHora: number;
  onSearch: (term: string) => void;
  onFilterChange: (filter: { disciplina?: string; tipo?: string }) => void;
}

export default function ProfissionaisHeader({ 
  totalProfissionais,
  total, 
  profissionaisPorTipo,
  valorMedioHora,
  onSearch,
  onFilterChange 
}: ProfissionaisHeaderProps) {
  const navigate = useNavigate();

  const stats = [
    {
      label: "Total de Profissionais",
      value: totalProfissionais,
      icon: <FaUsers style={{ color: "#4F46E5", fontSize: "20px" }} />,
      bgColor: "linear-gradient(135deg, #f5f3ff 0%, #ede9fe 100%)",
      borderColor: "#ddd6fe"
    },
    {
      label: "Valor Médio/Hora",
      // value: `R$ ${valorMedioHora.toFixed(2)}`,
      icon: <FaMoneyBillWave style={{ color: "#059669", fontSize: "20px" }} />,
      bgColor: "linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)",
      borderColor: "#bbf7d0"
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
            Gestão de Profissionais
          </h1>
          <p style={{ 
            margin: "4px 0 0", 
            fontSize: "14px", 
            color: "#6b7280" 
          }}>
            Gerencie os profissionais da plataforma
          </p>
        </div>
        
        <button
          onClick={() => navigate("/profissionais/novo")}
          style={{
            padding: "12px 24px",
            borderRadius: "8px",
            border: "none",
            backgroundColor: "#2563eb",
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
            e.currentTarget.style.backgroundColor = "#1d4ed8";
            e.currentTarget.style.transform = "translateY(-1px)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = "#2563eb";
            e.currentTarget.style.transform = "translateY(0)";
          }}
        >
          <span style={{ fontSize: "18px" }}>+</span>
          Novo Profissional
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

        {/* Distribuição por Tipo */}
        <div style={{
          background: "linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)",
          padding: "20px",
          borderRadius: "12px",
          border: "1px solid #bae6fd",
          gridColumn: "span 2 / span 2"
        }}>
          <div style={{ fontSize: "14px", color: "#0369a1", fontWeight: "600", marginBottom: "12px" }}>
            Tipos de Profissionais
          </div>
          <div style={{ display: "flex", gap: "16px", flexWrap: "wrap" }}>
            {/* {Object.entries(profissionaisPorTipo).map(([tipo, quantidade], index) => (
              <div key={index} style={{
                flex: "1",
                minWidth: "120px",
                background: "rgba(255, 255, 255, 0.6)",
                padding: "12px",
                borderRadius: "8px",
                border: "1px solid rgba(14, 165, 233, 0.3)"
              }}>
                <div style={{ fontSize: "12px", color: "#0c4a6e", marginBottom: "4px" }}>
                  {tipo || "Sem tipo"}
                </div>
                <div style={{ fontSize: "20px", fontWeight: "700", color: "#0c4a6e" }}>
                  {quantidade}
                </div>
              </div>
            ))} */}
          </div>
        </div>
      </div>

      {/* Filtros e Busca */}
      <div style={{ 
        display: "flex",
        gap: "16px",
        alignItems: "flex-end"
      }}>
        {/* Busca */}
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: "14px", fontWeight: "500", marginBottom: "8px", color: "#374151" }}>
            Buscar Profissional
          </div>
          <input
            type="text"
            placeholder="Buscar por nome, disciplina ou especialidade..."
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
              e.currentTarget.style.borderColor = "#2563eb";
              e.currentTarget.style.boxShadow = "0 0 0 3px rgba(37, 99, 235, 0.1)";
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = "#d1d5db";
              e.currentTarget.style.boxShadow = "none";
            }}
          />
        </div>

        {/* Filtro por Disciplina */}
        <div style={{ minWidth: "200px" }}>
          <div style={{ fontSize: "14px", fontWeight: "500", marginBottom: "8px", color: "#374151" }}>
            Disciplina
          </div>
          <select 
            onChange={(e) => onFilterChange({ disciplina: e.target.value || undefined })}
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
            <option value="">Todas as disciplinas</option>
            <option value="Informática">Informática</option>
            <option value="Psicologia">Psicologia</option>
            <option value="Fonoaudiologia">Fonoaudiologia</option>
            <option value="Pedagogia">Pedagogia</option>
            <option value="Terapia Ocupacional">Terapia Ocupacional</option>
          </select>
        </div>

        {/* Botão Exportar */}
        <div>
          <button
            onClick={() => {
              // Função para exportar dados
              console.log("Exportar dados");
            }}
            style={{
              padding: "12px 20px",
              borderRadius: "8px",
              border: "1px solid #d1d5db",
              backgroundColor: "#fff",
              color: "#374151",
              cursor: "pointer",
              fontSize: "14px",
              fontWeight: "500",
              display: "flex",
              alignItems: "center",
              gap: "6px",
              transition: "all 0.2s",
              height: "44px"
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
        </div>

        {/* Botão Limpar */}
        <div>
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
              padding: "12px 20px",
              borderRadius: "8px",
              border: "1px solid #d1d5db",
              backgroundColor: "#fff",
              color: "#374151",
              cursor: "pointer",
              fontSize: "14px",
              fontWeight: "500",
              transition: "all 0.2s",
              height: "44px"
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