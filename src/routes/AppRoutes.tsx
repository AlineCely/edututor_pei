import { BrowserRouter, Routes, Route } from "react-router-dom";
import { RequireAuth } from "../auth/RequireAuth";

import Login from "../pages/Login";
import Dashboard from "../pages/Dashboard";
import Alunos from "../pages/Alunos";
import AlunoForm from "../pages/AlunoForm";
import Profissionais from "../pages/Profissionais";
import ProfissionalForm from "../pages/ProfissionalForm";
import Disciplinas from "../pages/Disciplinas";
import DisciplinasForm from "../pages/DisciplinasForm";
import PEI from "../pages/PEI";
import FolhasDeRegistro from "../pages/FolhasDeRegistro";
import Relatorios from "../pages/Relatorios";
import Agenda from "../pages/Agenda";
import Escolas from "../pages/Escolas";
import EscolasForm from "../pages/EscolasForm";
import Usuarios from "../pages/Usuarios";
import UsuariosForm from "../pages/UsuariosForm";
import FamiliasForm from "../pages/FamiliasForm";
import Familias from "../pages/Familias";
import Trumas from "../pages/Turmas";
import TurmasForm from "../pages/TurmasForm";
import Plataformas from "../pages/Plataformas";

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
                    path="/plataformas"
                    element={
                        <RequireAuth allowedRoles={["GESTOR"]}>
                            <Plataformas />
                        </RequireAuth>
                    }
                />
                {/* <Route
                    path="/plataformas/novo"
                    element={
                        <RequireAuth allowedRoles={["GESTOR"]}>
                            <PlataformasForm />
                        </RequireAuth>
                    }
                /> */}
                <Route
                    path="/usuarios"
                    element={
                        <RequireAuth allowedRoles={["GESTOR"]}>
                            <Usuarios />
                        </RequireAuth>
                    }
                />
                <Route
                    path="/usuarios/novo"
                    element={
                        <RequireAuth allowedRoles={["GESTOR"]}>
                            <UsuariosForm />
                        </RequireAuth>
                    }
                />
                <Route
                    path="/usuarios/:id/editar"
                    element={
                        <RequireAuth allowedRoles={["GESTOR"]}>
                            <UsuariosForm />
                        </RequireAuth>
                    }
                />
                <Route
                    path="/escolas"
                    element={
                        <RequireAuth allowedRoles={["GESTOR"]}>
                            <Escolas />
                        </RequireAuth>
                    }
                />
                <Route
                    path="/escolas/novo"
                    element={
                        <RequireAuth allowedRoles={["GESTOR"]}>
                            <EscolasForm />
                        </RequireAuth>
                    }
                />
                <Route
                    path="/escolas/:id/editar"
                    element={
                        <RequireAuth allowedRoles={["GESTOR"]}>
                            <EscolasForm />
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
                    path="/familias"
                    element={
                        <RequireAuth allowedRoles={["GESTOR"]}>
                            <Familias />
                        </RequireAuth>
                    }
                />
                <Route
                    path="/familias/novo"
                    element={
                        <RequireAuth allowedRoles={["GESTOR"]}>
                            <FamiliasForm />
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
                    path="/turmas"
                    element={
                        <RequireAuth allowedRoles={["GESTOR"]}>
                            <Trumas />
                        </RequireAuth>
                    }
                />
                <Route
                    path="/turmas/novo"
                    element={
                        <RequireAuth allowedRoles={["GESTOR"]}>
                            <TurmasForm />
                        </RequireAuth>
                    }
                />
                <Route
                    path="/turmas/:id/editar"
                    element={
                        <RequireAuth allowedRoles={["GESTOR"]}>
                            <TurmasForm />
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
                    path="/disciplinas/novo"
                    element={
                        <RequireAuth allowedRoles={["GESTOR"]}>
                            <DisciplinasForm />
                        </RequireAuth>
                    }
                />
                <Route
                    path="/disciplinas/:id/editar"
                    element={
                        <RequireAuth allowedRoles={["GESTOR"]}>
                            <DisciplinasForm />
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
