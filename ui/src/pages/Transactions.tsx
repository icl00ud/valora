import { Plus } from "lucide-react";

export function Transactions() {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-semibold text-[#1E293B]">Últimos Lançamentos</h2>
        <button className="flex items-center gap-2 bg-[#166534] hover:bg-[#14532d] text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
          <Plus className="h-4 w-4" />
          Novo Lançamento
        </button>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <input 
          type="month" 
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#166534]/20 focus:border-[#166534]"
          defaultValue="2026-04"
        />
        <select className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#166534]/20 focus:border-[#166534]">
          <option value="">Todas as Contas</option>
          <option value="1">Conta Corrente</option>
          <option value="2">Nubank</option>
        </select>
      </div>

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
            <tr className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
              <td className="py-3 px-4 text-sm text-gray-600">07/04/2026</td>
              <td className="py-3 px-4 text-sm font-medium text-[#1E293B]">Mercado Livre</td>
              <td className="py-3 px-4 text-sm text-gray-500">
                <span className="px-2.5 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">Alimentação</span>
              </td>
              <td className="py-3 px-4 text-sm text-gray-500">Nubank</td>
              <td className="py-3 px-4 text-sm font-medium text-[#E11D48] text-right">- R$ 120,50</td>
            </tr>
            <tr className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
              <td className="py-3 px-4 text-sm text-gray-600">05/04/2026</td>
              <td className="py-3 px-4 text-sm font-medium text-[#1E293B]">Salário</td>
              <td className="py-3 px-4 text-sm text-gray-500">
                <span className="px-2.5 py-1 bg-[#059669]/10 text-[#166534] rounded-full text-xs font-medium">Renda</span>
              </td>
              <td className="py-3 px-4 text-sm text-gray-500">Conta Corrente</td>
              <td className="py-3 px-4 text-sm font-medium text-[#059669] text-right">+ R$ 5.000,00</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
