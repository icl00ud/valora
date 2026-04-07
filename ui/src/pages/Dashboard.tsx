import { useEffect, useState } from "react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const data = [
  { date: "Jan", balance: 4000 },
  { date: "Feb", balance: 3000 },
  { date: "Mar", balance: 2000 },
  { date: "Apr", balance: 2780 },
  { date: "May", balance: 1890 },
  { date: "Jun", balance: 2390 },
  { date: "Jul", balance: 3490 },
];

export function Dashboard() {
  const [balance, setBalance] = useState(0);

  useEffect(() => {
    fetch("/api/accounts")
      .then((res) => res.json())
      .then((data) => {
        const total = data.reduce((acc: number, curr: any) => acc + curr.currentBalance, 0);
        setBalance(total);
      })
      .catch((err) => console.error(err));
  }, []);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-sm font-medium text-[#64748B] uppercase tracking-wider">
            Saldo Atual Projetado
          </h3>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-[#1E293B]">
              R$ {balance.toFixed(2)}
            </span>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-sm font-medium text-[#64748B] uppercase tracking-wider">
            Faturas Abertas
          </h3>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-[#E11D48]">
              R$ 0.00
            </span>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-sm font-medium text-[#64748B] uppercase tracking-wider">
            Receitas Previstas
          </h3>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-[#059669]">
              R$ 0.00
            </span>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-[#1E293B]">Projeção de Saldo (Próximos 6 meses)</h2>
        </div>
        <div className="h-[400px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={data}
              margin={{
                top: 10,
                right: 30,
                left: 0,
                bottom: 0,
              }}
            >
              <defs>
                <linearGradient id="colorBalance" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#166534" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#166534" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
              <XAxis 
                dataKey="date" 
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#64748B', fontSize: 12 }}
                dy={10}
              />
              <YAxis 
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#64748B', fontSize: 12 }}
                tickFormatter={(value) => `R$ ${value}`}
                dx={-10}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#FFFFFF',
                  borderRadius: '8px',
                  border: '1px solid #E2E8F0',
                  boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                }}
              />
              <Area
                type="monotone"
                dataKey="balance"
                stroke="#166534"
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#colorBalance)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
