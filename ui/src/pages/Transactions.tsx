import { Plus } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { Modal } from "../components/Modal";
import type { Account, Transaction } from "../types";

export function Transactions() {
	const [transactions, setTransactions] = useState<Transaction[]>([]);
	const [accounts, setAccounts] = useState<Account[]>([]);
	const [isModalOpen, setIsModalOpen] = useState(false);

	const [selectedMonth, setSelectedMonth] = useState(() => {
		const today = new Date();
		return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}`;
	});
	const [selectedAccount, setSelectedAccount] = useState<string>("");

	const [amount, setAmount] = useState("");
	const [category, setCategory] = useState("");
	const [description, setDescription] = useState("");
	const [date, setDate] = useState(() => {
		const today = new Date();
		return today.toISOString().split("T")[0];
	});
	const [accountId, setAccountId] = useState("");

	const loadData = useCallback(async () => {
		try {
			const [txRes, accRes] = await Promise.all([
				fetch("/api/transactions"),
				fetch("/api/accounts"),
			]);
			if (!txRes.ok || !accRes.ok) {
				throw new Error("failed to load transactions data");
			}

			const txData = await txRes.json();
			const accData = await accRes.json();

			setTransactions(txData);
			setAccounts(accData);

			if (accData.length > 0 && !accountId) {
				setAccountId(accData[0].id);
			}
		} catch (err) {
			console.error(err);
		}
	}, [accountId]);

	useEffect(() => {
		loadData();
	}, [loadData]);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		const txData = {
			accountId,
			amount: parseFloat(amount),
			category,
			description,
			date: new Date(date).toISOString(),
			isPaid: false,
		};

		try {
			const res = await fetch("/api/transactions", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(txData),
			});

			if (res.ok) {
				setIsModalOpen(false);
				setAmount("");
				setCategory("");
				setDescription("");
				loadData();
			}
		} catch (err) {
			console.error(err);
		}
	};

	const filteredTransactions = transactions.filter((tx) => {
		const txDate = new Date(tx.date);
		const [year, month] = selectedMonth.split("-");
		const matchesMonth =
			txDate.getFullYear() === parseInt(year) &&
			txDate.getMonth() + 1 === parseInt(month);
		const matchesAccount = selectedAccount
			? tx.accountId === selectedAccount
			: true;
		return matchesMonth && matchesAccount;
	});

	return (
		<div className="card p-6">
			<div className="flex justify-between items-center mb-6">
				<h2 className="text-2xl font-bold text-black display-font uppercase tracking-wider">
					Ultimos Lancamentos
				</h2>
				<button
					type="button"
					onClick={() => setIsModalOpen(true)}
					className="flex items-center gap-2 bg-black hover:bg-gray-800 text-white px-6 py-2 text-sm font-bold uppercase tracking-widest sharp-border"
				>
					<Plus className="h-5 w-5" />
					Novo Lancamento
				</button>
			</div>

			<div className="flex flex-col md:flex-row gap-4 mb-6">
				<input
					type="month"
					value={selectedMonth}
					onChange={(e) => setSelectedMonth(e.target.value)}
					className="border-2 border-black px-4 py-3 text-sm focus:outline-none focus:ring-0 focus:shadow-[4px_4px_0px_#000] transition-shadow text-black"
				/>
				<select
					value={selectedAccount}
					onChange={(e) => setSelectedAccount(e.target.value)}
					className="border-2 border-black px-4 py-3 text-sm focus:outline-none focus:ring-0 focus:shadow-[4px_4px_0px_#000] transition-shadow text-black appearance-none bg-white rounded-none min-w-[200px]"
				>
					<option value="">Todas as Contas</option>
					{accounts.map((acc) => (
						<option key={acc.id} value={acc.id}>
							{acc.name}
						</option>
					))}
				</select>
			</div>

			<Modal
				isOpen={isModalOpen}
				onClose={() => setIsModalOpen(false)}
				title="NOVO LANCAMENTO"
			>
				<form onSubmit={handleSubmit} className="space-y-6">
					<div>
						<label
							htmlFor="tx-desc"
							className="block text-sm font-bold text-black uppercase tracking-wider mb-2"
						>
							Descricao
						</label>
						<input
							id="tx-desc"
							type="text"
							required
							value={description}
							onChange={(e) => setDescription(e.target.value)}
							className="w-full border-2 border-black px-4 py-3 focus:outline-none focus:ring-0 focus:shadow-[4px_4px_0px_#000] transition-shadow text-black"
							placeholder="Ex: Mercado Livre"
						/>
					</div>

					<div className="grid grid-cols-2 gap-6">
						<div>
							<label
								htmlFor="tx-amount"
								className="block text-sm font-bold text-black uppercase tracking-wider mb-2"
							>
								Valor (R$)
							</label>
							<input
								id="tx-amount"
								type="number"
								step="0.01"
								required
								value={amount}
								onChange={(e) => setAmount(e.target.value)}
								className="w-full border-2 border-black px-4 py-3 focus:outline-none focus:ring-0 focus:shadow-[4px_4px_0px_#000] transition-shadow text-black display-font text-lg"
								placeholder="-120.50 ou 5000.00"
							/>
						</div>
						<div>
							<label
								htmlFor="tx-date"
								className="block text-sm font-bold text-black uppercase tracking-wider mb-2"
							>
								Data
							</label>
							<input
								id="tx-date"
								type="date"
								required
								value={date}
								onChange={(e) => setDate(e.target.value)}
								className="w-full border-2 border-black px-4 py-3 focus:outline-none focus:ring-0 focus:shadow-[4px_4px_0px_#000] transition-shadow text-black"
							/>
						</div>
					</div>

					<div className="grid grid-cols-2 gap-6">
						<div>
							<label
								htmlFor="tx-account"
								className="block text-sm font-bold text-black uppercase tracking-wider mb-2"
							>
								Conta/Cartao
							</label>
							<select
								id="tx-account"
								required
								value={accountId}
								onChange={(e) => setAccountId(e.target.value)}
								className="w-full border-2 border-black px-4 py-3 focus:outline-none focus:ring-0 focus:shadow-[4px_4px_0px_#000] transition-shadow text-black appearance-none bg-white rounded-none"
							>
								{accounts.map((acc) => (
									<option key={acc.id} value={acc.id}>
										{acc.name}
									</option>
								))}
							</select>
						</div>
						<div>
							<label
								htmlFor="tx-category"
								className="block text-sm font-bold text-black uppercase tracking-wider mb-2"
							>
								Categoria
							</label>
							<input
								id="tx-category"
								type="text"
								required
								value={category}
								onChange={(e) => setCategory(e.target.value)}
								className="w-full border-2 border-black px-4 py-3 focus:outline-none focus:ring-0 focus:shadow-[4px_4px_0px_#000] transition-shadow text-black"
								placeholder="Ex: Alimentacao"
							/>
						</div>
					</div>

					<div className="pt-4">
						<button
							type="submit"
							className="w-full bg-black px-6 py-4 text-white font-bold uppercase tracking-widest hover:bg-gray-800 transition-colors sharp-border"
						>
							Salvar Lancamento
						</button>
					</div>
				</form>
			</Modal>

			<div className="overflow-x-auto">
				<table className="w-full text-left border-collapse">
					<thead>
						<tr className="border-b border-gray-200">
							<th className="py-3 px-4 font-semibold text-sm text-[#64748B]">
								Data
							</th>
							<th className="py-3 px-4 font-semibold text-sm text-[#64748B]">
								Descricao
							</th>
							<th className="py-3 px-4 font-semibold text-sm text-[#64748B]">
								Categoria
							</th>
							<th className="py-3 px-4 font-semibold text-sm text-[#64748B]">
								Conta
							</th>
							<th className="py-3 px-4 font-semibold text-sm text-[#64748B] text-right">
								Valor
							</th>
						</tr>
					</thead>
					<tbody>
						{filteredTransactions.map((tx) => {
							const accountName =
								accounts.find((a) => a.id === tx.accountId)?.name ||
								"Desconhecida";
							const isNegative = tx.amount < 0;

							return (
								<tr
									key={tx.id}
									className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
								>
									<td className="py-3 px-4 text-sm text-gray-600">
										{new Date(tx.date).toLocaleDateString("pt-BR")}
									</td>
									<td className="py-3 px-4 text-sm font-medium text-[#1E293B]">
										{tx.description}
									</td>
									<td className="py-3 px-4 text-sm text-gray-500">
										<span className="px-2.5 py-1 bg-gray-100 text-gray-700 text-xs font-medium">
											{tx.category}
										</span>
									</td>
									<td className="py-3 px-4 text-sm text-gray-500">
										{accountName}
									</td>
									<td
										className={`py-3 px-4 text-sm font-medium text-right ${isNegative ? "text-[#E11D48]" : "text-[#059669]"}`}
									>
										{isNegative ? "" : "+ "}
										R$ {Math.abs(tx.amount).toFixed(2)}
									</td>
								</tr>
							);
						})}
						{filteredTransactions.length === 0 && (
							<tr>
								<td
									colSpan={5}
									className="py-6 text-center text-sm text-gray-500"
								>
									Nenhum lancamento encontrado para o periodo.
								</td>
							</tr>
						)}
					</tbody>
				</table>
			</div>
		</div>
	);
}
