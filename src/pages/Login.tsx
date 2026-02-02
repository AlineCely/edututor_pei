
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";


export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);


  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    
    if (loading) return;

    setLoading(true);

    try {
      await login(email, password);
      navigate("/", { replace: true });
    } catch (error) {
      alert("Email ou senha inválidos");
    } finally {
      setLoading(false);
    }
  }

  const inputStyle = {
    width: "90%",
    padding: "10px 12px",
    marginTop: "6px",
    borderRadius: "8px",
    border: "1px solid #ddd",
    fontSize: "14px",
    background: "#fff",
    color: "#252525"
    // backgroundColor: "none"
  };

  const labelStyle = {
    width: "100%",
    padding: "10px 12px",
    marginTop: "6px",
    fontSize: "15px",
    fontWeight: "500",
    color: "#000"
  }

  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      background: "#fff",
    }}>

      <div style={{ textAlign: "center", marginBottom: "24px" }}>
        <img src="/logo.png" alt="EduTutor PEI" style={{ width: "48px", marginBottom: "8px" }} />
        <h1 style={{ fontSize: "20px", fontWeight: "600", margin: 0 }}>EduTutor PEI</h1>
        <p style={{ fontSize: "14px", color: "#777" }}>Gestão Multidisciplinar</p>
      </div>

      <form
        onSubmit={handleSubmit}
        style={{
          width: "360px",
          background: "#fff",
          border: "1px solid #cccc",
          borderRadius: "12px",
          padding: "24px",
          boxShadow: " 0 4px 20px rgba(0,0,0,0.05)"
        }}
      >
        <h2 style={{ margin: 0, fontSize: "18px", color: "#000" }}>Entrar</h2>
        <span style={{ fontSize: "14px", color: "#777", display: "block", marginBlock: "16px" }}>
          Área para profissionais ou gestão
        </span>

        <label
          style={labelStyle}
        >
          Email
        </label>

        <input
          type="email"
          placeholder="seu@email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          style={inputStyle}
        />

        <label
          style={labelStyle}
        >
          Senha
        </label>
        <input
          type="password"
          placeholder="••••••••"
          value={password}
          onChange={e => setPassword(e.target.value)}
          style={inputStyle}
        />

        <button
          type="submit"
          disabled={loading}
          style={{
            width: "100%",
            marginTop: "20px",
            padding: "12px",
            background: "#222",
            color: "#fff",
            border: "none",
            borderRadius: "8px",
            fontSize: "14px",
            cursor: "pointer",
            transition: "opacity 0.2s"
          }}
        >
          {loading ? "Entrando..." : "Entrar →"}
        </button>
      </form >
      <div style={{ marginTop: "20px", textAlign: "center" }}>
        <span style={{ display: "block", fontSize: "13px", color: "#777" }}>
          É família ou escola?
        </span>
        <a style={{ fontSize: "14px", fontWeight: "500", color: "#000", textDecoration: "none" }} href="/familia/pei">
          Acessar Portal da Família/Escola →
        </a>
      </div>
    </div >
  );
}
