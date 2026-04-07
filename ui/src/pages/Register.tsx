import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { UserPlus } from "lucide-react";

export function Register() {
	const [name, setName] = useState("");
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [error, setError] = useState("");
	const [isSubmitting, setIsSubmitting] = useState(false);
	const navigate = useNavigate();

	const handleRegister = async (e: React.FormEvent) => {
		e.preventDefault();
		setError("");
		setIsSubmitting(true);

		try {
			const res = await fetch("/api/register", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ name, email, password }),
			});

			if (res.ok) {
				navigate("/");
				return;
			}

			if (res.status === 409) {
				setError("Email ja esta em uso");
				return;
			}

			const message = await res.text();
			setError(message || "Erro ao cadastrar");
		} catch {
			setError("Erro ao tentar cadastrar");
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<div className="min-h-screen flex items-center justify-center bg-[#F9FAFB] px-4">
			<div className="w-full max-w-md bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
				<div className="text-center mb-8">
					<div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-[#166534]/10 text-[#166534] mb-4">
						<UserPlus className="w-6 h-6" />
					</div>
					<h1 className="text-2xl font-bold text-[#1E293B]">Criar conta</h1>
					<p className="text-gray-500 mt-2">Cadastre-se para acessar o Valora</p>
				</div>

				<form onSubmit={handleRegister} className="space-y-6">
					<div>
						<label htmlFor="register-name" className="block text-sm font-medium text-gray-700 mb-1">
							Nome
						</label>
						<input
							id="register-name"
							type="text"
							value={name}
							onChange={(e) => setName(e.target.value)}
							required
							className="w-full rounded-xl border border-gray-300 px-4 py-3 focus:border-[#166534] focus:outline-none focus:ring-2 focus:ring-[#166534]/20 transition-all"
							placeholder="Seu nome"
						/>
					</div>

					<div>
						<label htmlFor="register-email" className="block text-sm font-medium text-gray-700 mb-1">
							Email
						</label>
						<input
							id="register-email"
							type="email"
							value={email}
							onChange={(e) => setEmail(e.target.value)}
							required
							className="w-full rounded-xl border border-gray-300 px-4 py-3 focus:border-[#166534] focus:outline-none focus:ring-2 focus:ring-[#166534]/20 transition-all"
							placeholder="voce@email.com"
						/>
					</div>

					<div>
						<label htmlFor="register-password" className="block text-sm font-medium text-gray-700 mb-1">
							Senha
						</label>
						<input
							id="register-password"
							type="password"
							value={password}
							onChange={(e) => setPassword(e.target.value)}
							required
							minLength={8}
							className="w-full rounded-xl border border-gray-300 px-4 py-3 focus:border-[#166534] focus:outline-none focus:ring-2 focus:ring-[#166534]/20 transition-all"
							placeholder="No minimo 8 caracteres"
						/>
					</div>

					{error && <p className="text-sm text-[#E11D48]">{error}</p>}

					<button
						type="submit"
						disabled={isSubmitting}
						className="w-full flex items-center justify-center gap-2 rounded-xl bg-[#166534] px-4 py-3 text-white font-medium hover:bg-[#14532d] transition-colors focus:ring-4 focus:ring-[#166534]/30 disabled:opacity-70"
					>
						{isSubmitting ? "Criando..." : "Criar conta"}
					</button>

					<p className="text-center text-sm text-gray-600">
						Ja tem conta?{" "}
						<Link to="/login" className="font-medium text-[#166534] hover:underline">
							Fazer login
						</Link>
					</p>
				</form>
			</div>
		</div>
	);
}
