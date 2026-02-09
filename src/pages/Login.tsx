
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);


  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (loading) return;

    // Validação básica
    if (!email || !password) {
      setError("Por favor, preencha todos os campos");
      return;
    }

    if (!email.includes("@")) {
      setError("Por favor, insira um email válido");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await login(email, password);
      navigate("/", { replace: true });
    } catch (err: any) {
      console.error("Erro no login:", err);
      setError("Email ou senha inválidos. Por favor, tente novamente.");
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
    color: "#252525",
    boxSizing: "border-box" as const,
    transition: "border-color 0.2s, box-shadow 0.2s"
  };

  const labelStyle = {
    display: "block",
    width: "100%",
    // padding: "10px 12px",
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
      padding: "20px",
      backgroundColor: "#fff"
    }}>

      <div style={{
        textAlign: "center",
        marginBottom: "32px",
        animation: "fadeIn 0.6s ease-out"
      }}>
        <img src="/logoTEA.png"
          alt="VinculoTEA"
          style={{
            width: "130px",
            marginBottom: "8px",
            filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.1))"
          }} />
        <p style={{ fontSize: "14px", color: "#777", margin: "0", fontWeight: "400" }}>Gestão Multidisciplinar</p>
      </div>

      <form
        onSubmit={handleSubmit}
        style={{
          width: "360px",
          background: "#fff",
          border: "1px solid #cccc",
          borderRadius: "12px",
          padding: "24px",
          boxShadow: " 0 4px 20px rgba(0,0,0,0.05)",
          animation: "slideUp 0.5s ease-out"
        }}
      >
        <h2 style={{ margin: 0, fontSize: "18px", color: "#000" }}>Entrar</h2>
        <span style={{ fontSize: "14px", color: "#777", display: "block", marginBlock: "16px" }}>
          Área para profissionais ou gestão
        </span>

        {error && (
          <div style={{
            padding: "12px 16px",
            marginBottom: "20px",
            backgroundColor: "#fee",
            border: "1px solid #fcc",
            borderRadius: "8px",
            color: "#c00",
            fontSize: "14px",
            display: "flex",
            alignItems: "center",
            gap: "8px"
          }}>
            <span>⚠️</span>
            <span>{error}</span>
          </div>
        )}

        <label
          style={labelStyle}
        >
          Email
        </label>

        <input
          type="email"
          placeholder="seu@email.com"
          value={email}
          onChange={e => {
            setEmail(e.target.value);
            setError(null)
          }}
          onFocus={e => {
            e.currentTarget.style.borderColor = "#2563eb";
            e.currentTarget.style.boxShadow = "0 0 0 3px rgba(37, 99, 235, 0.1)";
          }}
          onBlur={e => {
            e.currentTarget.style.borderColor = "#ddd";
            e.currentTarget.style.boxShadow = "none";
          }}
          style={inputStyle}
          disabled={loading}
          required
        />

        <label style={labelStyle}>
          Senha
        </label>
        <input
          type="password"
          placeholder="••••••••"
          value={password}
          onChange={e => {
            setPassword(e.target.value);
            setError(null);
          }}
          onFocus={e => {
            e.currentTarget.style.borderColor = "#2563eb";
            e.currentTarget.style.boxShadow = "0 0 0 3px rgba(37, 99, 235, 0.1)";
          }}
          onBlur={e => {
            e.currentTarget.style.borderColor = "#ddd";
            e.currentTarget.style.boxShadow = "none";
          }}
          style={inputStyle}
          disabled={loading}
          required
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

        <div style={{ 
          marginTop: "24px", 
          textAlign: "center",
          fontSize: "13px",
          color: "#666"
        }}>
          <span style={{ display: "block", marginBottom: "8px" }}>
            Esqueceu sua senha?
          </span>
          <a 
            href="/recuperar-senha" 
            style={{ 
              fontSize: "14px", 
              fontWeight: "500", 
              color: "#2563eb", 
              textDecoration: "none",
              transition: "color 0.2s"
            }}
            onMouseEnter={(e) => e.currentTarget.style.color = "#1a1a1a"}
            onMouseLeave={(e) => e.currentTarget.style.color = "#2563eb"}
          >
            Recuperar senha
          </a>
        </div>

      </form >
      <div style={{ marginTop: "20px", textAlign: "center", animation: "fadeIn 0.8s ease-out"}}>
        <span style={{ display: "block", fontSize: "13px", color: "#777" }}>
          É família ou escola?
        </span>
        <a href="/familia/pei" 
          style={{ 
            fontSize: "15px", 
            fontWeight: "500", 
            color: "#1a1a1a", 
            textDecoration: "none",
            display: "inline-flex",
            alignItems: "center",
            gap: "4px",
            transition: "color 0.2s"
          }}
          onMouseEnter={(e) => e.currentTarget.style.color = "#2563eb"}
          onMouseLeave={(e) => e.currentTarget.style.color = "#1a1a1a"}
          >
          Acessar Portal da Família/Escola 
          <span style={{ fontSize: "18px" }}>→</span>
        </a>
      </div>
    </div >
  );
}
