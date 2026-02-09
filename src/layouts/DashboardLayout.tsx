import type { ReactNode } from "react";
import { useState } from "react";
import Sidebar from "../components/Sidebar/Sidebar";
import Header from "../components/Header/Header";

interface Props {
  children: ReactNode;
}

export default function DashboardLayout({ children }: Props) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };
  
  return (
    <div style={{ display: "flex", height: "100vh", overflow: "hidden" }}>
      <Sidebar collapsed={sidebarCollapsed} />
      <div style={{ 
        flex: 1, 
        display: "flex", 
        flexDirection: "column", 
        minWidth: 0, 
        marginLeft: sidebarCollapsed ? "80px" : "260px", // Ajuste conforme largura do seu sidebar
        transition: "margin-left 0.3s ease"
        }}>
        <Header onMenuClick={toggleSidebar}/>
        <main style={{ 
          flex: 1, 
          padding: "24px", 
          overflowY: "auto", 
          transition: "padding 0.3s ease" 
        }}>
          {children}
        </main>
      </div>
    </div>
  );
}
