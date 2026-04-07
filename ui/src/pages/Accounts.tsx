import { useCallback, useEffect, useState } from "react";
import { Modal } from "../components/Modal";
import type { Account, AccountType } from "../types";

export function Accounts() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // form state
  const [name, setName] = useState("");
  const [type, setType] = useState<AccountType>("checking");
  const [closingDay, setClosingDay] = useState("");
  const [dueDay, setDueDay] = useState("");
  const [currentBalance, setCurrentBalance] = useState("");

	const loadAccounts = useCallback(() => {
		fetch("/api/accounts")
			.then((res) => {
				if (!res.ok) {
					throw new Error("failed to load accounts");
				}
				return res.json();
			})
			.then(setAccounts)
			.catch(console.error);
	}, []);

	useEffect(() => {
		loadAccounts();
	}, [loadAccounts]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const accountData: any = {
      name,
      type,
      currentBalance: parseFloat(currentBalance) || 0,
    };

    if (type === "credit_card") {
      accountData.closingDay = parseInt(closingDay, 10);
      accountData.dueDay = parseInt(dueDay, 10);
    }

    try {
      const res = await fetch("/api/accounts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(accountData),
      });

      if (res.ok) {
        setIsModalOpen(false);
        loadAccounts();
        setName("");
        setType("checking");
        setClosingDay("");
        setDueDay("");
        setCurrentBalance("");
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-semibold text-[#1E293B]">Minhas Contas</h2>
		<button
			type="button"
			onClick={() => setIsModalOpen(true)}
			className="bg-[#166534] hover:bg-[#14532d] text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
		>
          Nova Conta
        </button>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Nova Conta">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
					<label htmlFor="account-name" className="block text-sm font-medium text-gray-700 mb-1">
						Nome
					</label>
					<input
						id="account-name"
						type="text"
						required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-[#166534] focus:outline-none focus:ring-1 focus:ring-[#166534]"
            />
          </div>
          <div>
					<label htmlFor="account-type" className="block text-sm font-medium text-gray-700 mb-1">
						Tipo
					</label>
					<select
						id="account-type"
						value={type}
						onChange={(e) => setType(e.target.value as AccountType)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-[#166534] focus:outline-none focus:ring-1 focus:ring-[#166534]"
            >
              <option value="checking">Conta Corrente</option>
              <option value="savings">Poupança</option>
              <option value="credit_card">Cartão de Crédito</option>
            </select>
          </div>
          
          {type === "credit_card" && (
            <div className="grid grid-cols-2 gap-4">
              <div>
							<label htmlFor="account-closing-day" className="block text-sm font-medium text-gray-700 mb-1">
								Dia de Fechamento
							</label>
							<input
								id="account-closing-day"
								type="number"
								min="1"
                  max="31"
                  required
                  value={closingDay}
                  onChange={(e) => setClosingDay(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-[#166534] focus:outline-none focus:ring-1 focus:ring-[#166534]"
                />
              </div>
              <div>
							<label htmlFor="account-due-day" className="block text-sm font-medium text-gray-700 mb-1">
								Dia de Vencimento
							</label>
							<input
								id="account-due-day"
								type="number"
								min="1"
                  max="31"
                  required
                  value={dueDay}
                  onChange={(e) => setDueDay(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-[#166534] focus:outline-none focus:ring-1 focus:ring-[#166534]"
                />
              </div>
            </div>
          )}

          <div>
					<label htmlFor="account-current-balance" className="block text-sm font-medium text-gray-700 mb-1">
						Saldo Atual (R$)
					</label>
					<input
						id="account-current-balance"
						type="number"
						step="0.01"
              required
              value={currentBalance}
              onChange={(e) => setCurrentBalance(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-[#166534] focus:outline-none focus:ring-1 focus:ring-[#166534]"
            />
          </div>

          <div className="pt-4">
            <button
              type="submit"
              className="w-full rounded-lg bg-[#166534] px-4 py-2 text-white font-medium hover:bg-[#14532d] transition-colors"
            >
              Salvar Conta
            </button>
          </div>
        </form>
      </Modal>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="py-3 px-4 font-semibold text-sm text-[#64748B]">Nome</th>
              <th className="py-3 px-4 font-semibold text-sm text-[#64748B]">Tipo</th>
              <th className="py-3 px-4 font-semibold text-sm text-[#64748B]">Saldo Atual</th>
              <th className="py-3 px-4 font-semibold text-sm text-[#64748B]">Fechamento</th>
              <th className="py-3 px-4 font-semibold text-sm text-[#64748B]">Vencimento</th>
            </tr>
          </thead>
          <tbody>
            {accounts.map(acc => (
              <tr key={acc.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                <td className="py-3 px-4 text-sm font-medium text-[#1E293B]">{acc.name}</td>
                <td className="py-3 px-4 text-sm text-gray-600">
                  {acc.type === "credit_card" ? "Cartão de Crédito" : acc.type === "checking" ? "Conta Corrente" : "Poupança"}
                </td>
                <td className={`py-3 px-4 text-sm ${acc.currentBalance < 0 ? "text-[#E11D48]" : "text-[#059669]"}`}>
                  R$ {acc.currentBalance.toFixed(2)}
                </td>
                <td className="py-3 px-4 text-sm text-gray-500">{acc.closingDay ? `Dia ${acc.closingDay}` : "-"}</td>
                <td className="py-3 px-4 text-sm text-gray-500">{acc.dueDay ? `Dia ${acc.dueDay}` : "-"}</td>
              </tr>
            ))}
            {accounts.length === 0 && (
              <tr>
                <td colSpan={5} className="py-6 text-center text-sm text-gray-500">
                  Nenhuma conta cadastrada.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
