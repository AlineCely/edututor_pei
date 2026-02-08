import { useNavigate } from "react-router-dom";
import { FaBook, FaLayerGroup, FaCheckCircle, FaSearch, FaFilter, FaFileExport } from "react-icons/fa";

interface Props {
  totalDisciplinas: number;
  disciplinasAtivas: number;
  disciplinasInativas: number;
  categoriasCount: number;
  onSearch: (term: string) => void;
  onFilterChange: (filter: { status?: string; categoria?: string; plataforma?: string }) => void;
  categoriasDisponiveis: string[];
  plataformas: any[];
}

export default function DisciplinasHeader({ 
  totalDisciplinas, 
  disciplinasAtivas,
  disciplinasInativas,
  categoriasCount,
  onSearch,
  onFilterChange,
  categoriasDisponiveis,
  // plataformas
}: Props) {

  const navigate = useNavigate();

  const stats = [
    {
      label: "Total de Disciplinas",
      value: totalDisciplinas,
      icon: <FaBook style={{ color: "#4F46E5", fontSize: "20px" }} />,
      bgColor: "linear-gradient(135deg, #f5f3ff 0%, #ede9fe 100%)",
      borderColor: "#ddd6fe"
    },
    {
      label: "Disciplinas Ativas",
      value: disciplinasAtivas,
      percent: totalDisciplinas > 0 ? Math.round((disciplinasAtivas / totalDisciplinas) * 100) : 0,
      icon: <FaCheckCircle style={{ color: "#059669", fontSize: "20px" }} />,
      bgColor: "linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)",
      borderColor: "#bbf7d0"
    },
    {
      label: "Disciplinas Inativas",
      value: disciplinasInativas,
      percent: totalDisciplinas > 0 ? Math.round((disciplinasInativas / totalDisciplinas) * 100) : 0,
      icon: <FaBook style={{ color: "#6b7280", fontSize: "20px" }} />,
      bgColor: "linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%)",
      borderColor: "#d1d5db"
    },
    {
      label: "Categorias",
      value: categoriasCount,
      icon: <FaLayerGroup style={{ color: "#d97706", fontSize: "20px" }} />,
      bgColor: "linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)",
      borderColor: "#fcd34d"
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
            Gestão de Disciplinas
          </h1>
          <p style={{ 
            margin: "4px 0 0", 
            fontSize: "14px", 
            color: "#6b7280" 
          }}>
            Gerencie as disciplinas e suas categorias
          </p>
        </div>
        
        <button
          onClick={() => navigate("/disciplinas/novo")}
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
          <FaBook size={16} />
          Nova Disciplina
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
                  <div style={{ fontSize: "12px", color: stat.label.includes("Ativas") ? "#059669" : "#6b7280", marginTop: "4px" }}>
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
            Buscar Disciplina
          </div>
          <input
            type="text"
            placeholder="Digite nome ou descrição..."
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
            <FaFilter style={{ marginRight: "8px" }} />
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
            <option value="ativa">Ativas</option>
            <option value="inativa">Inativas</option>
            <option value="em_desenvolvimento">Em Desenvolvimento</option>
          </select>
        </div>

        {/* Filtro por Categoria */}
        <div>
          <div style={{ fontSize: "14px", fontWeight: "500", marginBottom: "8px", color: "#374151" }}>
            Categoria
          </div>
          <select 
            onChange={(e) => onFilterChange({ categoria: e.target.value || undefined })}
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
            <option value="">Todas as categorias</option>
            {(categoriasDisponiveis || []).map((cat, idx) => (
              <option key={idx} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        {/* Filtro por Plataforma */}
        {/* <div>
          <div style={{ fontSize: "14px", fontWeight: "500", marginBottom: "8px", color: "#374151" }}>
            Plataforma
          </div>
          <select 
            onChange={(e) => onFilterChange({ plataforma: e.target.value || undefined })}
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
            <option value="">Todas as plataformas</option>
            {plataformas.map((plat) => (
              <option key={plat.Plataforma_ID} value={plat.Plataforma_ID}>
                {plat.Nome || `Plataforma ${plat.Plataforma_ID}`}
              </option>
            ))}
          </select>
        </div> */}

        {/* Botão Exportar */}
        <div style={{ display: "flex", alignItems: "flex-end" }}>
          <button
            onClick={() => {
              console.log("Exportar dados das disciplinas");
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
            Exportar CSV
          </button>
        </div>

        {/* Botão Limpar */}
        <div style={{ display: "flex", alignItems: "flex-end" }}>
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
