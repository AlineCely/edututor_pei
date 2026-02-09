import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../auth/AuthContext";
import {
  FaTachometerAlt,
  FaUsers,
  FaUserMd,
  FaBook,
  FaSchool,
  FaHome,
  FaClipboardList,
  FaCalendarAlt,
  FaFileAlt,
  FaChartBar,
  FaChalkboardTeacher,
  FaSignOutAlt,
  FaUserFriends
} from 'react-icons/fa';
import type { UserRole } from "../../auth/roles";
import type { JSX } from "react";

export interface MenuItem {
  name: string;
  path: string;
  icon: JSX.Element;
  roles: UserRole[];
}

interface SidebarProps {
  collapsed?: boolean;
  // onToggle?: () => void;
}

export default function Sidebar({ collapsed = false }: SidebarProps) {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  async function handleLogout() {
    await logout();
    navigate("/login", { replace: true });
  }

  if (!user) return null;
  if (user?.role === "FAMILIA") return null;

  const menuCategories = [
    {
      title: "Dashboard",
      items: [
        { name: "Dashboard", path: "/", roles: ["GESTOR", "PROFISSIONAL"], icon: <FaTachometerAlt /> }
      ]
    },
    {
      title: "Dados Master",
      items: [
        { name: "Plataformas", path: "/plataformas", roles: ["GESTOR"], icon: <FaHome /> },
        { name: "Usuários", path: "/usuarios", roles: ["GESTOR"], icon: <FaUserFriends /> },
        { name: "Escolas", path: "/escolas", roles: ["GESTOR"], icon: <FaSchool /> }
      ]
    },
    {
      title: "Gestão de Pessoas",
      items: [
        { name: "Alunos", path: "/alunos", roles: ["GESTOR", "PROFISSIONAL"], icon: <FaUsers /> },
        { name: "Famílias", path: "/familias", roles: ["GESTOR"], icon: <FaUserFriends /> },
        { name: "Professores", path: "/profissionais", roles: ["GESTOR"], icon: <FaUserMd /> },
        { name: "Turmas", path: "/turmas", roles: ["GESTOR"], icon: <FaChalkboardTeacher /> }
      ]
    },
    {
      title: "Gestão Acadêmica",
      items: [
        { name: "Disciplinas", path: "/disciplina", roles: ["GESTOR"], icon: <FaBook /> },
        { name: "Aulas", path: "/aulas", roles: ["GESTOR", "PROFISSIONAL"], icon: <FaCalendarAlt /> },
        { name: "Avaliações", path: "/avaliacoes", roles: ["GESTOR", "PROFISSIONAL"], icon: <FaClipboardList /> },
        { name: "Disponibilidade", path: "/disponibilidade", roles: ["GESTOR", "PROFISSIONAL"], icon: <FaCalendarAlt /> }
      ]
    },
    {
      title: "Gestão Pedagógica",
      items: [
        { name: "Relatórios PEI", path: "/pei", roles: ["GESTOR", "PROFISSIONAL"], icon: <FaFileAlt /> },
        { name: "Relatórios", path: "/relatorios", roles: ["GESTOR"], icon: <FaChartBar /> }
      ]
    }
  ];

  const sidebarWidth = collapsed ? "80px" : "260px";

  return (
    <aside
      style={{
        width: sidebarWidth,
        background: "#ffffff",
        borderRight: "1px solid #eee",
        color: "#333",
        height: "100vh",
        boxSizing: "border-box",
        display: "flex",
        flexDirection: "column",
        position: "fixed",
        left: 0,
        top: 0,
        zIndex: 1000,
        transition: "width 0.3s ease",
        overflow: "hidden"
      }}
    >
      {/* Logo */}
      <div style={{ 
        textAlign: "center", 
        marginBottom: "8px",
        padding: "20px 16px 16px",
        borderBottom: collapsed ? "none" : "1px solid #eee"
      }}>
        {collapsed ? (
          <img
            src="/logoTEA.png"
            alt="VinculoTEA"
            style={{ width: "50px", height: "auto", borderRadius: "8px" }}
          />
        ) : (
          <>
            <img
              src="/logoTEA.png"
              alt="VinculoTEA"
              style={{ width: "80px", height: "auto" }}
            />
            <div style={{
              fontSize: "11px",
              color: "#666",
              fontWeight: "500",
              marginTop: "5px"
            }}>
              Plataforma Gestão
            </div>
          </>
        )}
      </div>

      

      {/* Menu Categories */}
      <div style={{
        flex: 1,
        overflowY: "auto",
        padding: "16px 8px"
      }}>
        {menuCategories.map((category, index) => {
          // Filtrar itens baseados na role do usuário
          const filteredItems = category.items.filter(item =>
            item.roles.includes(user!.role)
          );

          // Não mostrar categoria se não houver itens visíveis para o usuário
          if (filteredItems.length === 0) return null;

          return (
            <div key={index} style={{ marginBottom: collapsed ? "16px" : "24px" }}>
              {/* Título da Categoria (só mostra se não estiver collapsed) */}
              {!collapsed && category.title !== "Dashboard" && (
                <div style={{
                  fontSize: "11px",
                  fontWeight: "600",
                  color: "#888",
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                  marginBottom: "8px",
                  paddingLeft: collapsed ? "0" : "8px",
                  textAlign: collapsed ? "center" : "left"
                }}>
                  {category.title}
                </div>
              )}

              {/* Itens do Menu */}
              <ul style={{
                listStyle: "none",
                padding: 0,
                margin: 0
              }}>
                {filteredItems.map((item) => (
                  <li key={item.name}>
                    <NavLink
                      to={item.path}
                      style={({ isActive }) => ({
                        display: "flex",
                        alignItems: "center",
                        padding: collapsed ? "12px" : "12px 16px",
                        marginBottom: "4px",
                        borderRadius: "8px",
                        fontSize: collapsed ? "12px" : "14px",
                        fontWeight: "500",
                        textDecoration: "none",
                        color: isActive ? "#2563eb" : "#333",
                        backgroundColor: isActive ? "#f0f7ff" : "transparent",
                        transition: "background-color 0.2s, color 0.2s",
                        justifyContent: collapsed ? "center" : "flex-start",
                        flexDirection: collapsed ? "column" : "row",
                        gap: collapsed ? "4px" : "12px",
                        textAlign: collapsed ? "center" : "left"
                      })}
                      onMouseEnter={(e) => {
                        if (!e.currentTarget.className.includes("active")) {
                          e.currentTarget.style.backgroundColor = "#f8fafc";
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!e.currentTarget.className.includes("active")) {
                          e.currentTarget.style.backgroundColor = "transparent";
                        }
                      }}
                    >
                      <span
                        style={{
                          fontSize: collapsed ? "18px" : "16px",
                          color: "inherit",
                          display: "flex",
                          alignItems: "center"
                        }}
                      >
                        {item.icon}
                      </span>
                      {!collapsed && item.name}
                      {collapsed && (
                        <span style={{
                          fontSize: "10px",
                          fontWeight: "500",
                          marginTop: "2px"
                        }}>
                          {item.name.split(' ')[0]}
                        </span>
                      )}
                    </NavLink>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>

      {/* Footer - Logout e Perfil */}
      {!collapsed && (
        <div
          style={{
            padding: "16px",
            borderTop: "1px solid #eee",
            marginTop: "auto"
          }}
        >
          {/* Informações do Usuário */}
          <div style={{
            padding: "12px 16px",
            marginBottom: "12px",
            backgroundColor: "#f8fafc",
            borderRadius: "8px",
            fontSize: "13px"
          }}>
            <div style={{ fontWeight: "600", color: "#333", marginBottom: "4px" }}>
              {user.name}
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", color: "#666" }}>
              <span>{user.role === "GESTOR" ? "Gestor" : "Profissional"}</span>
              <span style={{
                backgroundColor: "#f0f7ff",
                color: "#2563eb",
                padding: "2px 8px",
                borderRadius: "12px",
                fontSize: "11px",
                fontWeight: "600"
              }}>
                {user.role === "GESTOR" ? "Admin" : "Prof"}
              </span>
            </div>
          </div>

          {/* Botão Logout */}
          <button
            onClick={handleLogout}
            style={{
              width: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "12px 16px",
              borderRadius: "8px",
              border: "1px solid #eee",
              background: "transparent",
              color: "#666",
              fontSize: "14px",
              fontWeight: "500",
              cursor: "pointer",
              transition: "all 0.2s"
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = "#fee2e2";
              e.currentTarget.style.color = "#dc2626";
              e.currentTarget.style.borderColor = "#fecaca";
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = "transparent";
              e.currentTarget.style.color = "#666";
              e.currentTarget.style.borderColor = "#eee";
            }}
          >
            <FaSignOutAlt style={{ marginRight: "10px" }} />
            Sair
          </button>
        </div>
      )}

      {/* Versão collapsed do footer */}
      {collapsed && (
        <div
          style={{
            padding: "16px 8px",
            borderTop: "1px solid #eee",
            marginTop: "auto"
          }}
        >
          <button
            onClick={handleLogout}
            style={{
              width: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "12px",
              borderRadius: "8px",
              border: "1px solid #eee",
              background: "transparent",
              color: "#666",
              fontSize: "20px",
              cursor: "pointer",
              transition: "all 0.2s"
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = "#fee2e2";
              e.currentTarget.style.color = "#dc2626";
              e.currentTarget.style.borderColor = "#fecaca";
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = "transparent";
              e.currentTarget.style.color = "#666";
              e.currentTarget.style.borderColor = "#eee";
            }}
          >
            <FaSignOutAlt />
          </button>
        </div>
      )}
    </aside>
  );
}