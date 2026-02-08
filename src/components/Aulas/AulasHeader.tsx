import { useNavigate } from "react-router-dom";
import {
    FaCalendarAlt,
    FaChalkboardTeacher,
    FaBook,
    FaCheckCircle,
    FaClock,
    FaCalendarPlus,
    FaSearch,
    FaFilter
} from "react-icons/fa";

interface AulasHeaderProps {
    totalAulas: number;
    aulasAgendadas: number;
    aulasRealizadas: number;
    aulasCanceladas: number;
    professoresCount: number;
    disciplinasCount: number;
    onSearch: (term: string) => void;
    onFilterChange: (filter: {
        status?: string;
        professor?: string;
        disciplina?: string;
        dataInicio?: string;
        dataFim?: string;
    }) => void;
    professores: any[];
    disciplinas: any[];
}

export default function AulasHeader({
    totalAulas,
    aulasAgendadas,
    aulasRealizadas,
    aulasCanceladas,
    professoresCount,
    disciplinasCount,
    onSearch,
    onFilterChange,
    professores,
    disciplinas
}: AulasHeaderProps) {
    const navigate = useNavigate();

    const stats = [
        {
            label: "Total de Aulas",
            value: totalAulas,
            icon: <FaCalendarAlt style={{ color: "#4F46E5", fontSize: "20px" }} />,
            bgColor: "linear-gradient(135deg, #f5f3ff 0%, #ede9fe 100%)",
            borderColor: "#ddd6fe"
        },
        {
            label: "Agendadas",
            value: aulasAgendadas,
            percent: totalAulas > 0 ? Math.round((aulasAgendadas / totalAulas) * 100) : 0,
            icon: <FaClock style={{ color: "#d97706", fontSize: "20px" }} />,
            bgColor: "linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)",
            borderColor: "#fcd34d"
        },
        {
            label: "Realizadas",
            value: aulasRealizadas,
            percent: totalAulas > 0 ? Math.round((aulasRealizadas / totalAulas) * 100) : 0,
            icon: <FaCheckCircle style={{ color: "#059669", fontSize: "20px" }} />,
            bgColor: "linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)",
            borderColor: "#bbf7d0"
        },
        {
            label: "Canceladas",
            value: aulasCanceladas,
            percent: totalAulas > 0 ? Math.round((aulasCanceladas / totalAulas) * 100) : 0,
            icon: <FaCalendarAlt style={{ color: "#dc2626", fontSize: "20px" }} />,
            bgColor: "linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%)",
            borderColor: "#fecaca"
        },
        {
            label: "Professores",
            value: professoresCount,
            icon: <FaChalkboardTeacher style={{ color: "#0ea5e9", fontSize: "20px" }} />,
            bgColor: "linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)",
            borderColor: "#bae6fd"
        },
        {
            label: "Disciplinas",
            value: disciplinasCount,
            icon: <FaBook style={{ color: "#8b5cf6", fontSize: "20px" }} />,
            bgColor: "linear-gradient(135deg, #faf5ff 0%, #f3e8ff 100%)",
            borderColor: "#e9d5ff"
        }
    ];

    const statusOptions = [
        { value: "", label: "Todos os status" },
        { value: "agendada", label: "Agendada" },
        { value: "em_andamento", label: "Em Andamento" },
        { value: "realizada", label: "Realizada" },
        { value: "cancelada", label: "Cancelada" },
        { value: "adiada", label: "Adiada" }
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
                        Gestão de Aulas
                    </h1>
                    <p style={{
                        margin: "4px 0 0",
                        fontSize: "14px",
                        color: "#6b7280"
                    }}>
                        Agende e gerencie aulas com professores e disciplinas
                    </p>
                </div>

                <div style={{ display: "flex", gap: "12px" }}>
                    <button
                        onClick={() => navigate("/aulas/calendario")}
                        style={{
                            padding: "10px 20px",
                            borderRadius: "8px",
                            border: "1px solid #d1d5db",
                            backgroundColor: "#fff",
                            color: "#374151",
                            cursor: "pointer",
                            fontSize: "14px",
                            fontWeight: "500",
                            display: "flex",
                            alignItems: "center",
                            gap: "8px",
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
                        <FaCalendarAlt size={14} />
                        Calendário
                    </button>

                    <button
                        onClick={() => navigate("/aulas/novo")}
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
                        <FaCalendarPlus size={16} />
                        Nova Aula
                    </button>
                </div>
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
                                <div style={{ fontSize: "24px", fontWeight: "700", color: "#1f2937" }}>
                                    {stat.value}
                                </div>
                                {stat.percent !== undefined && (
                                    <div style={{
                                        fontSize: "11px",
                                        color: stat.label.includes("Canceladas") ? "#dc2626" :
                                            stat.label.includes("Realizadas") ? "#059669" :
                                                stat.label.includes("Agendadas") ? "#d97706" : "#6b7280",
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
                        Buscar Aula
                    </div>
                    <input
                        type="text"
                        placeholder="Buscar por descrição, link ou ID..."
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
                        Status da Aula
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
                        {statusOptions.map((option, idx) => (
                            <option key={idx} value={option.value}>{option.label}</option>
                        ))}
                    </select>
                </div>

                {/* Filtro por Professor */}
                <div>
                    <div style={{ fontSize: "14px", fontWeight: "500", marginBottom: "8px", color: "#374151" }}>
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
                        {Array.isArray(professores) && professores.map((prof) => (
                            <option key={prof.Professor_ID} value={prof.Professor_ID}>
                                {prof.Usuarios?.Nome || `Professor ${prof.Professor_ID}`}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Filtro por Disciplina */}
                <div>
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
                        {Array.isArray(disciplinas) && disciplinas.map((disc) => (
                            <option key={disc.Disciplina_ID} value={disc.Disciplina_ID}>
                                {disc.Nome}
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

                {/* Filtro por Data Fim */}
                <div>
                    <div style={{ fontSize: "14px", fontWeight: "500", marginBottom: "8px", color: "#374151" }}>
                        Data Fim
                    </div>
                    <input
                        type="date"
                        onChange={(e) => onFilterChange({ dataFim: e.target.value || undefined })}
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

                {/* Botão Relatório */}
                <div style={{ display: "flex", alignItems: "flex-end" }}>
                    <button
                        onClick={() => {
                            console.log("Gerar relatório de aulas");
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
                        Relatório
                    </button>
                </div>
            </div>
        </div>
    );
}