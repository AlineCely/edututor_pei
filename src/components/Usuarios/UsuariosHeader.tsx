import { useNavigate } from "react-router-dom";

interface Props {
  totalUsuarios: number;
  usuariosAtivos: number;
  usuariosPorTipo: {
    GESTOR: number;
    PROFISSIONAL: number;
    FAMILIA: number;
  };
  onSearch: (term: string) => void;
  onFilterChange: (filter: { status?: string; tipo?: string }) => void;
}

export default function UsuariosHeader({ 
  totalUsuarios, 
  usuariosAtivos,
  usuariosPorTipo,
  onSearch,
  onFilterChange 
}: Props) {
  const navigate = useNavigate();

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
            Usuários
          </h1>
          <p style={{ 
            margin: "4px 0 0", 
            fontSize: "14px", 
            color: "#6b7280" 
          }}>
            Gerencie os usuários do sistema
          </p>
        </div>
        
        <button
          onClick={() => navigate("/usuarios/novo")}
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
          Novo Usuário
        </button>
      </div>

      {/* Cards de Estatísticas */}
      <div style={{ 
        display: "grid", 
        gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", 
        gap: "16px",
        marginBottom: "24px"
      }}>
        {/* Total de Usuários */}
        <div style={{
          background: "linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)",
          padding: "20px",
          borderRadius: "12px",
          border: "1px solid #bae6fd"
        }}>
          <div style={{ fontSize: "14px", color: "#0369a1", fontWeight: "600", marginBottom: "8px" }}>
            Total de Usuários
          </div>
          <div style={{ fontSize: "32px", fontWeight: "700", color: "#0c4a6e" }}>
            {totalUsuarios}
          </div>
          <div style={{ fontSize: "12px", color: "#0ea5e9", marginTop: "4px" }}>
            Todos os usuários
          </div>
        </div>

        {/* Usuários Ativos */}
        <div style={{
          background: "linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)",
          padding: "20px",
          borderRadius: "12px",
          border: "1px solid #bbf7d0"
        }}>
          <div style={{ fontSize: "14px", color: "#16a34a", fontWeight: "600", marginBottom: "8px" }}>
            Usuários Ativos
          </div>
          <div style={{ fontSize: "32px", fontWeight: "700", color: "#166534" }}>
            {usuariosAtivos}
          </div>
          <div style={{ fontSize: "12px", color: "#22c55e", marginTop: "4px" }}>
            Ativos no sistema
          </div>
        </div>

        {/* Taxa de Atividade */}
        <div style={{
          background: "linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)",
          padding: "20px",
          borderRadius: "12px",
          border: "1px solid #fcd34d"
        }}>
          <div style={{ fontSize: "14px", color: "#d97706", fontWeight: "600", marginBottom: "8px" }}>
            Taxa de Atividade
          </div>
          <div style={{ fontSize: "32px", fontWeight: "700", color: "#92400e" }}>
            {totalUsuarios > 0 ? `${Math.round((usuariosAtivos / totalUsuarios) * 100)}%` : "0%"}
          </div>
          <div style={{ fontSize: "12px", color: "#f59e0b", marginTop: "4px" }}>
            Usuários ativos
          </div>
        </div>

        {/* Distribuição por Tipo */}
        <div style={{
          background: "linear-gradient(135deg, #f5f3ff 0%, #ede9fe 100%)",
          padding: "20px",
          borderRadius: "12px",
          border: "1px solid #ddd6fe"
        }}>
          <div style={{ fontSize: "14px", color: "#7c3aed", fontWeight: "600", marginBottom: "8px" }}>
            Tipos de Usuários
          </div>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <div>
              <div style={{ fontSize: "20px", fontWeight: "700", color: "#5b21b6" }}>
                {usuariosPorTipo.GESTOR}
              </div>
              <div style={{ fontSize: "11px", color: "#8b5cf6", marginTop: "2px" }}>
                Gestores
              </div>
            </div>
            <div>
              <div style={{ fontSize: "20px", fontWeight: "700", color: "#5b21b6" }}>
                {usuariosPorTipo.PROFISSIONAL}
              </div>
              <div style={{ fontSize: "11px", color: "#8b5cf6", marginTop: "2px" }}>
                Profissionais
              </div>
            </div>
            <div>
              <div style={{ fontSize: "20px", fontWeight: "700", color: "#5b21b6" }}>
                {usuariosPorTipo.FAMILIA}
              </div>
              <div style={{ fontSize: "11px", color: "#8b5cf6", marginTop: "2px" }}>
                Famílias
              </div>
            </div>
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
            Buscar Usuário
          </div>
          <input
            type="text"
            placeholder="Digite nome ou email..."
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
              cursor: "pointer",
              appearance: "none",
              backgroundImage: "url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%231F2937%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E')",
              backgroundRepeat: "no-repeat",
              backgroundPosition: "right 16px top 50%",
              backgroundSize: "12px auto",
              paddingRight: "40px"
            }}
          >
            <option value="">Todos os status</option>
            <option value="Ativo">Ativo</option>
            <option value="Inativo">Inativo</option>
            <option value="Pendente">Pendente</option>
          </select>
        </div>

        {/* Filtro por Tipo */}
        <div>
          <div style={{ fontSize: "14px", fontWeight: "500", marginBottom: "8px", color: "#374151" }}>
            Tipo de Usuário
          </div>
          <select 
            onChange={(e) => onFilterChange({ tipo: e.target.value || undefined })}
            style={{ 
              width: "100%",
              padding: "12px 16px", 
              borderRadius: "8px", 
              border: "1px solid #d1d5db", 
              backgroundColor: "#fff", 
              color: "#374151",
              fontSize: "14px",
              cursor: "pointer",
              appearance: "none",
              backgroundImage: "url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%231F2937%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E')",
              backgroundRepeat: "no-repeat",
              backgroundPosition: "right 16px top 50%",
              backgroundSize: "12px auto",
              paddingRight: "40px"
            }}
          >
            <option value="">Todos os tipos</option>
            <option value="GESTOR">Gestor</option>
            <option value="PROFISSIONAL">Profissional</option>
            <option value="FAMILIA">Família</option>
          </select>
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