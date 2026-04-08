import { LogIn } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

export function Login() {
	const [email, setEmail] = useState("");
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
				body: JSON.stringify({ email, password }),
			});

			if (res.ok) {
				navigate("/");
			} else {
				setError("Email ou senha incorretos");
			}
		} catch {
			setError("Erro ao tentar fazer login");
		}
	};

	return (
		<div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
			<div className="w-full max-w-md bg-white border-4 border-black shadow-[12px_12px_0px_#000] p-10">
				<div className="text-center mb-10">
					<div className="inline-flex items-center justify-center w-16 h-16 bg-black text-white mb-6 sharp-border">
						<LogIn className="w-8 h-8" />
					</div>
					<h1 className="text-4xl font-bold text-black display-font uppercase tracking-tighter">
						Valora
					</h1>
					<p className="text-gray-600 mt-2 font-bold uppercase tracking-wider text-sm">
						Acesso Restrito
					</p>
				</div>

				<form onSubmit={handleLogin} className="space-y-6">
					<div>
						<label
							htmlFor="login-email"
							className="block text-sm font-bold text-black uppercase tracking-wider mb-2"
						>
							Email
						</label>
						<input
							id="login-email"
							type="email"
							value={email}
							onChange={(e) => setEmail(e.target.value)}
							required
							className="w-full border-2 border-black px-4 py-4 focus:outline-none focus:ring-0 focus:shadow-[4px_4px_0px_#000] transition-all text-black"
							placeholder="voce@email.com"
						/>
					</div>

					<div>
						<label
							htmlFor="login-password"
							className="block text-sm font-bold text-black uppercase tracking-wider mb-2"
						>
							Senha
						</label>
						<input
							id="login-password"
							type="password"
							value={password}
							onChange={(e) => setPassword(e.target.value)}
							required
							className="w-full border-2 border-black px-4 py-4 focus:outline-none focus:ring-0 focus:shadow-[4px_4px_0px_#000] transition-all text-black"
							placeholder="••••••••"
						/>
						{error && (
							<p className="mt-2 text-sm font-bold text-red-600 uppercase tracking-wider">
								{error}
							</p>
						)}
					</div>

					<button
						type="submit"
						className="w-full flex items-center justify-center gap-2 bg-black px-4 py-4 text-white font-bold uppercase tracking-widest hover:bg-gray-800 transition-colors sharp-border"
					>
						Entrar
					</button>

					<p className="text-center text-sm text-gray-600 font-bold uppercase tracking-wider">
						Nao tem conta?{" "}
						<Link
							to="/register"
							className="text-black underline hover:no-underline"
						>
							Criar conta
						</Link>
					</p>
				</form>
			</div>
		</div>
	);
}
