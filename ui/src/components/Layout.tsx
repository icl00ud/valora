import { LayoutDashboard, LogOut, Receipt, Wallet } from "lucide-react";
import { useEffect } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";

export function Layout() {
	const location = useLocation();
	const navigate = useNavigate();

	useEffect(() => {
		fetch("/api/accounts")
			.then((res) => {
				if (res.status === 401) {
					navigate("/login");
				}
			})
			.catch(() => {
				navigate("/login");
			});
	}, [navigate]);

	const handleLogout = async () => {
		await fetch("/api/logout", { method: "POST" });
		navigate("/login");
	};

	const navigation = [
		{ name: "DASHBOARD", href: "/", icon: LayoutDashboard },
		{ name: "CONTAS", href: "/accounts", icon: Wallet },
		{ name: "LANÇAMENTOS", href: "/transactions", icon: Receipt },
	];

	return (
		<div className="flex h-screen bg-[#F4F4F0] text-black">
			<aside className="w-72 bg-white border-r-2 border-black flex flex-col shadow-[4px_0_0_#000] z-10 relative">
				<div className="h-20 flex items-center px-8 border-b-2 border-black bg-[#E2FF3D]">
					<span className="text-3xl font-black tracking-tighter uppercase display-font">
						Valora
					</span>
				</div>
				<nav className="p-6 space-y-3 flex-1">
					{navigation.map((item) => {
						const isActive = location.pathname === item.href;
						const Icon = item.icon;
						return (
							<Link
								key={item.name}
								to={item.href}
								className={`flex items-center px-4 py-3 text-sm font-bold tracking-tight uppercase transition-all border-2 ${
									isActive
										? "bg-[#E2FF3D] border-black shadow-[4px_4px_0_#000] translate-x-[-2px] translate-y-[-2px]"
										: "bg-transparent border-transparent hover:border-black hover:bg-gray-50"
								}`}
							>
								<Icon
									className={`mr-4 h-5 w-5 ${
										isActive ? "text-black" : "text-gray-500"
									}`}
									strokeWidth={2.5}
								/>
								{item.name}
							</Link>
						);
					})}
				</nav>
				<div className="p-6 border-t-2 border-black bg-gray-50">
					<button
						type="button"
						onClick={handleLogout}
						className="flex items-center justify-center px-4 py-3 font-bold tracking-tight uppercase border-2 border-black bg-white hover:bg-[#FF3366] hover:text-white w-full transition-all sharp-border"
					>
						<LogOut className="mr-3 h-5 w-5" strokeWidth={2.5} />
						SAIR
					</button>
				</div>
			</aside>

			<main className="flex-1 flex flex-col overflow-hidden bg-[#F4F4F0]">
				<header className="h-20 bg-white border-b-2 border-black flex items-center justify-between px-10 shadow-[0_4px_0_#000] z-0 relative">
					<h1 className="text-2xl font-black uppercase tracking-tight display-font">
						{navigation.find((n) => n.href === location.pathname)?.name ||
							"DASHBOARD"}
					</h1>
					<div className="flex items-center gap-4">
						<div className="h-10 w-10 border-2 border-black bg-[#166534] flex items-center justify-center text-white font-bold shadow-[2px_2px_0_#000]">
							U
						</div>
					</div>
				</header>
				<div className="p-10 flex-1 overflow-y-auto relative z-0">
					<div className="max-w-7xl mx-auto">
						<Outlet />
					</div>
				</div>
			</main>
		</div>
	);
}
