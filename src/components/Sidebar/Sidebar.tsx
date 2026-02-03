import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../auth/AuthContext";
import {
  FaTachometerAlt,
  FaCalendarAlt,
  FaUsers,
  FaUserMd,
  FaBook,
  FaFileMedical,
  FaClipboardList,
  FaFileAlt,
  FaChartBar,
  FaSignOutAlt
} from 'react-icons/fa';
import type { UserRole } from "../../auth/roles";
import type { JSX } from "react";

export interface MenuItem {
  name: string;
  path: string;
  icon: JSX.Element;
  roles: UserRole[];
}

export default function Sidebar() {
  const navigate = useNavigate();

  const { user, logout } = useAuth();

  async function handleLogout() {
    await logout();
    navigate("/login", { replace: true });
  }


  if (!user) return null;

  if (user?.role === "FAMILIA") return null;

  const menuItems: MenuItem[] = [
    { name: "Dashboard", path: "/", roles: ["GESTOR", "PROFISSIONAL"], icon: <FaTachometerAlt /> },
    { name: "Agenda", path: "/agenda", roles: ["GESTOR", "PROFISSIONAL"], icon: <FaCalendarAlt /> },
    { name: "Alunos", path: "/alunos", roles: ["GESTOR", "PROFISSIONAL"], icon: <FaUsers /> },
    { name: "Profissionais", path: "/profissionais", roles: ["GESTOR"], icon: <FaUserMd /> },
    { name: "Disciplina", path: "/disciplina", roles: ["GESTOR"], icon: <FaBook /> },
    { name: "Anamnese", path: "/anamnese", roles: ["GESTOR", "PROFISSIONAL"], icon: <FaFileMedical /> },
    { name: "PEI", path: "/pei", roles: ["GESTOR", "PROFISSIONAL"], icon: <FaClipboardList /> },
    { name: "Folhas de registro", roles: ["GESTOR", "PROFISSIONAL"], path: "/folhas-registro", icon: <FaFileAlt /> },
    { name: "Relatórios", path: "/relatorios", roles: ["GESTOR"], icon: <FaChartBar /> }
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
      <div style={{ textAlign: "center", marginBottom: "2px" }}>
        <img
          src="../../../src/image/logo.jpeg"
          alt="Logo EduTutor"
          style={{ width: "150px", height: "auto" }}
        />
      </div>

      <div style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        gap: "50px"
      }}>
        <nav>
          <ul style={{
            listStyle: "none",
            padding: 0,
            margin: 0
          }}>
            {menuItems
              .filter(item => item.roles.includes(user!.role))
              .map((item) => (
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

        <div
          style={{
            marginTop: "auto",
            paddingTop: "20px",
          }}
        >
          <button
            onClick={handleLogout}
            style={{
              width: "100%",
              display: "flex",
              alignItems: "center",
              padding: "12px 16px",
              borderRadius: "8px",
              border: "none",
              background: "#f5f5f5",
              color: "#333",
              fontSize: "14px",
              fontWeight: "500",
              cursor: "pointer",
              transition: "background 0.2s"
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = "#fee2e2";
              e.currentTarget.style.color = "#dc2626";
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = "#f5f5f5";
              e.currentTarget.style.color = "#333";
            }}
          >
            <FaSignOutAlt style={{ marginRight: "12px" }} />
            Sair
          </button>
        </div>
      </div>
    </aside>
  );
}
