import { useEffect, useState } from "react";
import {
	Area,
	AreaChart,
	CartesianGrid,
	ResponsiveContainer,
	Tooltip,
	XAxis,
	YAxis,
} from "recharts";

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
			.then((res) => {
				if (!res.ok) {
					throw new Error("failed to load accounts");
				}
				return res.json();
			})
			.then((data) => {
				const total = data.reduce(
					(acc: number, curr: any) => acc + curr.currentBalance,
					0,
				);
				setBalance(total);
			})
			.catch((err) => console.error(err));
	}, []);

	return (
		<div className="space-y-6">
			<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
				<div className="card p-6">
					<h3 className="text-sm font-bold text-black uppercase tracking-wider">
						Saldo Atual Projetado
					</h3>
					<div className="mt-2 flex items-baseline gap-2">
						<span className="text-4xl font-bold text-black display-font">
							R$ {balance.toFixed(2)}
						</span>
					</div>
				</div>

				<div className="card p-6">
					<h3 className="text-sm font-bold text-black uppercase tracking-wider">
						Faturas Abertas
					</h3>
					<div className="mt-2 flex items-baseline gap-2">
						<span className="text-4xl font-bold text-black display-font">
							R$ 0.00
						</span>
					</div>
				</div>

				<div className="card p-6">
					<h3 className="text-sm font-bold text-black uppercase tracking-wider">
						Receitas Previstas
					</h3>
					<div className="mt-2 flex items-baseline gap-2">
						<span className="text-4xl font-bold text-black display-font">
							R$ 0.00
						</span>
					</div>
				</div>
			</div>

			<div className="card p-6">
				<div className="flex items-center justify-between mb-6">
					<h2 className="text-2xl font-bold text-black display-font uppercase">
						Projeção de Saldo (Próximos 6 meses)
					</h2>
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
									<stop offset="5%" stopColor="#000" stopOpacity={0.8} />
									<stop offset="95%" stopColor="#000" stopOpacity={0.1} />
								</linearGradient>
							</defs>
							<CartesianGrid
								strokeDasharray="3 3"
								vertical={false}
								stroke="#ccc"
							/>
							<XAxis
								dataKey="date"
								axisLine={false}
								tickLine={false}
								tick={{ fill: "#000", fontSize: 12, fontWeight: "bold" }}
								dy={10}
							/>
							<YAxis
								axisLine={false}
								tickLine={false}
								tick={{ fill: "#000", fontSize: 12, fontWeight: "bold" }}
								tickFormatter={(value) => `R$ ${value}`}
								dx={-10}
							/>
							<Tooltip
								contentStyle={{
									backgroundColor: "#FFFFFF",
									borderRadius: "0px",
									border: "2px solid #000",
									boxShadow: "4px 4px 0px #000",
									fontWeight: "bold",
								}}
							/>
							<Area
								type="monotone"
								dataKey="balance"
								stroke="#000"
								strokeWidth={4}
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
