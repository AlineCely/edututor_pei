import { NavLink } from "react-router-dom";
import {
  FaTachometerAlt,
  FaCalendarAlt,
  FaUsers,
  FaUserMd,
  FaBook,
  FaFileMedical,
  FaClipboardList,
  FaFileAlt,
  FaChartBar
} from 'react-icons/fa';

export default function Sidebar() {
  const menuItems = [
    { name: "Dashboard", path: "/", icon: <FaTachometerAlt /> },
    { name: "Agenda", path: "/agenda", icon: <FaCalendarAlt /> },
    { name: "Alunos", path: "/alunos", icon: <FaUsers /> },
    { name: "Profissionais", path: "/profissionais", icon: <FaUserMd /> },
    { name: "Disciplina", path: "/disciplina", icon: <FaBook /> },
    { name: "Anamnese", path: "/anamnese", icon: <FaFileMedical /> },
    { name: "PEI", path: "/pei", icon: <FaClipboardList /> },
    { name: "Folhas de registro", path: "/folhas-registro", icon: <FaFileAlt /> },
    { name: "Relatórios", path: "/relatorios", icon: <FaChartBar /> }
  ];

  return (
    <aside
      style={{
        width: "240px",
        background: "#ffffff",
        borderRight: "1px solid #eee",
        padding: "20px 16px",
        color: "#333",
        height: "100vh",
        boxSizing: "border-box"
      }}
    >
      <div style={{ textAlign: "center", marginBottom: "24px" }}>
        <img
          src="/logo.png"
          alt="Logo EduTutor"
          style={{ width: "80px", height: "auto" }}
        />
      </div>

      <nav>
        <ul style={{
          listStyle: "none",
          padding: 0,
          margin: 0
        }}>
          {menuItems.map((item) => (
            <li key={item.name}>
              <NavLink
                to={item.path}
                style={({ isActive }) => ({
                  display: "flex",
                  alignItems: "center",
                  padding: "12px 16px",
                  marginBottom: "4px",
                  borderRadius: "8px",
                  fontSize: "14px",
                  fontWeight: "500",
                  textDecoration: "none",
                  color: isActive ? "#2563eb" : "#333",
                  backgroundColor: isActive ? "#f0f7ff" : "transparent",
                  transition: "background-color 0.2s, color 0.2s"
                })}
              >
                <span
                  style={{
                    marginRight: "12px",
                    fontSize: "16px",
                    color: "inherit"
                  }}
                >
                  {item.icon}
                </span>
                {item.name}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
}
