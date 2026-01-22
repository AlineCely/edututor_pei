import Pagination from "../Table/Pagination";

interface Profissional {
  nome: string;
  disciplina: string;
  telefone: string;
  email: string;
  registro: string;
}

const profissionais: Profissional[] = Array.from({ length: 10 }).map(() => ({
  nome: "Ana Clara",
  disciplina: "Informática",
  telefone: "94 98130-8015",
  email: "gestor@edututorpei.com.br",
  registro: "20000"
}));

export default function ProfissionaisTable() {
  return (
    <div
      style={{
        background: "#fff",
        borderRadius: "12px",
        padding: "16px"
      }}
    >
      {/* Filtros */}
      <div style={{ display: "flex", gap: "12px", marginBottom: "16px" }}>
        <select>
          <option>Selecionar disciplina</option>
          <option>Informática</option>
          <option>Psicologia</option>
          <option>Fonoaudiologia</option>
        </select>
      </div>

      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr style={{ borderBottom: "1px solid #eee", textAlign: "left", color: "#555" }}>
            <th>Profissional</th>
            <th>Disciplina</th>
            <th>Telefone</th>
            <th>Email</th>
            <th>Registro Profissional</th>
            <th>Ação</th>
          </tr>
        </thead>

        <tbody>
          {profissionais.map((p, index) => (
            <tr key={index} style={{ borderBottom: "1px solid #f1f1f1", color: "#777" }}>
              <td style={{ padding: "12px" }}>{p.nome}</td>
              <td>{p.disciplina}</td>
              <td>{p.telefone}</td>
              <td>{p.email}</td>
              <td>{p.registro}</td>
              <td>
                <button>👁️</button>
                <button>✏️</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <Pagination />
    </div>
  );
}
