import { Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { Modal } from "../components/Modal";
import type { Account, Transaction } from "../types";

export function Transactions() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Filter state
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const today = new Date();
    return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
  });
  const [selectedAccount, setSelectedAccount] = useState<string>("");

  // Form state
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  });
  const [accountId, setAccountId] = useState("");

  const loadData = async () => {
    try {
      const [txRes, accRes] = await Promise.all([
        fetch("/api/transactions"),
        fetch("/api/accounts")
      ]);
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
  };

  useEffect(() => {
    loadData();
  }, []);

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

  const filteredTransactions = transactions.filter(tx => {
    const txDate = new Date(tx.date);
    const [year, month] = selectedMonth.split('-');
    const matchesMonth = txDate.getFullYear() === parseInt(year) && txDate.getMonth() + 1 === parseInt(month);
    const matchesAccount = selectedAccount ? tx.accountId === selectedAccount : true;
    return matchesMonth && matchesAccount;
  });

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-semibold text-[#1E293B]">Últimos Lançamentos</h2>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-[#166534] hover:bg-[#14532d] text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
        >
          <Plus className="h-4 w-4" />
          Novo Lançamento
        </button>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <input 
          type="month" 
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#166534]/20 focus:border-[#166534]"
        />
        <select 
          value={selectedAccount}
          onChange={(e) => setSelectedAccount(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#166534]/20 focus:border-[#166534]"
        >
          <option value="">Todas as Contas</option>
          {accounts.map(acc => (
            <option key={acc.id} value={acc.id}>{acc.name}</option>
          ))}
        </select>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Novo Lançamento">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
            <input
              type="text"
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-[#166534] focus:outline-none focus:ring-1 focus:ring-[#166534]"
              placeholder="Ex: Mercado Livre"
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Valor (R$)</label>
              <input
                type="number"
                step="0.01"
                required
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-[#166534] focus:outline-none focus:ring-1 focus:ring-[#166534]"
                placeholder="-120.50 ou 5000.00"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Data</label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-[#166534] focus:outline-none focus:ring-1 focus:ring-[#166534]"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Conta/Cartão</label>
              <select
                required
                value={accountId}
                onChange={(e) => setAccountId(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-[#166534] focus:outline-none focus:ring-1 focus:ring-[#166534]"
              >
                {accounts.map(acc => (
                  <option key={acc.id} value={acc.id}>{acc.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Categoria</label>
              <input
                type="text"
                required
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-[#166534] focus:outline-none focus:ring-1 focus:ring-[#166534]"
                placeholder="Ex: Alimentação"
              />
            </div>
          </div>

          <div className="pt-4">
            <button
              type="submit"
              className="w-full rounded-lg bg-[#166534] px-4 py-2 text-white font-medium hover:bg-[#14532d] transition-colors"
            >
              Salvar Lançamento
            </button>
          </div>
        </form>
      </Modal>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="py-3 px-4 font-semibold text-sm text-[#64748B]">Data</th>
              <th className="py-3 px-4 font-semibold text-sm text-[#64748B]">Descrição</th>
              <th className="py-3 px-4 font-semibold text-sm text-[#64748B]">Categoria</th>
              <th className="py-3 px-4 font-semibold text-sm text-[#64748B]">Conta</th>
              <th className="py-3 px-4 font-semibold text-sm text-[#64748B] text-right">Valor</th>
            </tr>
          </thead>
          <tbody>
            {filteredTransactions.map(tx => {
              const accountName = accounts.find(a => a.id === tx.accountId)?.name || "Desconhecida";
              const isNegative = tx.amount < 0;

              return (
                <tr key={tx.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                  <td className="py-3 px-4 text-sm text-gray-600">
                    {new Date(tx.date).toLocaleDateString('pt-BR')}
                  </td>
                  <td className="py-3 px-4 text-sm font-medium text-[#1E293B]">{tx.description}</td>
                  <td className="py-3 px-4 text-sm text-gray-500">
                    <span className="px-2.5 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium">
                      {tx.category}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-500">{accountName}</td>
                  <td className={`py-3 px-4 text-sm font-medium text-right ${isNegative ? "text-[#E11D48]" : "text-[#059669]"}`}>
                    {isNegative ? "" : "+ "}
                    R$ {Math.abs(tx.amount).toFixed(2)}
                  </td>
                </tr>
              )
            })}
            {filteredTransactions.length === 0 && (
              <tr>
                <td colSpan={5} className="py-6 text-center text-sm text-gray-500">
                  Nenhum lançamento encontrado para o período.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
