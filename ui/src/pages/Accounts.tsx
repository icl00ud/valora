export function Accounts() {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-semibold text-[#1E293B]">Minhas Contas</h2>
        <button className="bg-[#166534] hover:bg-[#14532d] text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
          Nova Conta
        </button>
      </div>
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
            <tr className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
              <td className="py-3 px-4 text-sm font-medium text-[#1E293B]">Conta Corrente</td>
              <td className="py-3 px-4 text-sm text-gray-600">Corrente</td>
              <td className="py-3 px-4 text-sm text-[#059669]">R$ 1.500,00</td>
              <td className="py-3 px-4 text-sm text-gray-500">-</td>
              <td className="py-3 px-4 text-sm text-gray-500">-</td>
            </tr>
            <tr className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
              <td className="py-3 px-4 text-sm font-medium text-[#1E293B]">Nubank</td>
              <td className="py-3 px-4 text-sm text-gray-600">Cartão de Crédito</td>
              <td className="py-3 px-4 text-sm text-[#E11D48]">- R$ 450,00</td>
              <td className="py-3 px-4 text-sm text-gray-500">Dia 25</td>
              <td className="py-3 px-4 text-sm text-gray-500">Dia 01</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
