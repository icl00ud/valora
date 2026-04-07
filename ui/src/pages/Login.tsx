import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { LogIn } from "lucide-react";

export function Login() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      if (res.ok) {
        navigate("/");
      } else {
        setError("Senha incorreta");
      }
    } catch (err) {
      setError("Erro ao tentar fazer login");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F9FAFB] px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-[#166534]/10 text-[#166534] mb-4">
            <LogIn className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-bold text-[#1E293B]">My Finances</h1>
          <p className="text-gray-500 mt-2">Digite sua senha para acessar</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Senha de Acesso
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full rounded-xl border border-gray-300 px-4 py-3 focus:border-[#166534] focus:outline-none focus:ring-2 focus:ring-[#166534]/20 transition-all"
              placeholder="••••••••"
            />
            {error && (
              <p className="mt-2 text-sm text-[#E11D48]">{error}</p>
            )}
          </div>

          <button
            type="submit"
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-[#166534] px-4 py-3 text-white font-medium hover:bg-[#14532d] transition-colors focus:ring-4 focus:ring-[#166534]/30"
          >
            Entrar
          </button>
        </form>
      </div>
    </div>
  );
}
