import { BrowserRouter, Routes, Route } from "react-router-dom";
import Dashboard from "../pages/Dashboard";
import Alunos from "../pages/Alunos";
import AlunoForm from "../pages/AlunoForm";
import Profissionais from "../pages/Profissionais";
import Disciplinas from "../pages/Disciplinas";
import Anamnese from "../pages/Anamnese";
import PEI from "../pages/PEI";
import FolhasDeRegistro from "../pages/FolhasDeRegistro";
import Relatorios from "../pages/Relatorios";
import Agenda from "../pages/Agenda";
import ProfissionalForm from "../pages/ProfissionalForm";

export default function AppRoutes() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/alunos" element={<Alunos />} />
                <Route path="/alunos/novo" element={<AlunoForm />} />
                <Route path="/alunos/:id" element={<AlunoForm />} />
                <Route path="/alunos/:id/editar" element={<AlunoForm />} />
                <Route path="/agenda" element={<Agenda />} />
                <Route path="/profissionais" element={<Profissionais />} />
                <Route path="/profissionais/novo" element={<ProfissionalForm />} />
                <Route path="/profissionais/:id/editar" element={<ProfissionalForm />} />
                <Route path="/disciplina" element={<Disciplinas />} />
                <Route path="/anamnese" element={<Anamnese />} />
                <Route path="/pei" element={<PEI />} />
                <Route path="/folhas-registro" element={<FolhasDeRegistro />} />
                <Route path="/relatorios" element={<Relatorios />} />

                {/* rota 404 */}
                <Route path="*" element={<h1>Página não encontrada</h1>} />
            </Routes>
        </BrowserRouter>
    );
}
