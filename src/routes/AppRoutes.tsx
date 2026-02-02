import { BrowserRouter, Routes, Route } from "react-router-dom";
import { RequireAuth } from "../auth/RequireAuth";

import Login from "../pages/Login";
import Dashboard from "../pages/Dashboard";
import Alunos from "../pages/Alunos";
import AlunoForm from "../pages/AlunoForm";
import Profissionais from "../pages/Profissionais";
import ProfissionalForm from "../pages/ProfissionalForm";
import Disciplinas from "../pages/Disciplinas";
import PEI from "../pages/PEI";
import FolhasDeRegistro from "../pages/FolhasDeRegistro";
import Relatorios from "../pages/Relatorios";
import Agenda from "../pages/Agenda";

export default function AppRoutes() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/login" element={<Login />} />
                <Route
                    path="/"
                    element={
                        <RequireAuth allowedRoles={["GESTOR", "PROFISSIONAL"]}>
                            <Dashboard />
                        </RequireAuth>
                    }
                />
                <Route
                    path="/alunos"
                    element={
                        <RequireAuth allowedRoles={["GESTOR", "PROFISSIONAL"]}>
                            <Alunos />
                        </RequireAuth>
                    }
                />
                <Route
                    path="/alunos/novo"
                    element={
                        <RequireAuth allowedRoles={["GESTOR"]}>
                            <AlunoForm />
                        </RequireAuth>
                    }
                />
                <Route
                    path="/alunos/:id/editar"
                    element={
                        <RequireAuth allowedRoles={["GESTOR"]}>
                            <AlunoForm />
                        </RequireAuth>
                    }
                />
                <Route
                    path="/agenda"
                    element={
                        <RequireAuth allowedRoles={["GESTOR", "PROFISSIONAL"]}>
                            <Agenda />
                        </RequireAuth>
                    }
                />
                <Route
                    path="/profissionais"
                    element={
                        <RequireAuth allowedRoles={["GESTOR"]}>
                            <Profissionais />
                        </RequireAuth>
                    }
                />
                <Route
                    path="/profissionais/novo"
                    element={
                        <RequireAuth allowedRoles={["GESTOR"]}>
                            <ProfissionalForm />
                        </RequireAuth>
                    }
                />
                <Route
                    path="/profissionais/:id/editar"
                    element={
                        <RequireAuth allowedRoles={["GESTOR"]}>
                            <ProfissionalForm />
                        </RequireAuth>
                    }
                />
                <Route
                    path="/disciplina"
                    element={
                        <RequireAuth allowedRoles={["GESTOR"]}>
                            <Disciplinas />
                        </RequireAuth>
                    }
                />
                <Route
                    path="/pei"
                    element={
                        <RequireAuth allowedRoles={["GESTOR", "PROFISSIONAL", "FAMILIA"]}>
                            <PEI />
                        </RequireAuth>
                    }
                />
                <Route
                    path="/folhas-registro"
                    element={
                        <RequireAuth allowedRoles={["GESTOR", "PROFISSIONAL"]}>
                            <FolhasDeRegistro />
                        </RequireAuth>
                    }
                />
                <Route
                    path="/relatorios"
                    element={
                        <RequireAuth allowedRoles={["GESTOR"]}>
                            <Relatorios />
                        </RequireAuth>
                    }
                />
                {/* 🚫 404 */}
                <Route path="*" element={<h1>Página não encontrada</h1>} />

            </Routes>
        </BrowserRouter>
    );
}
