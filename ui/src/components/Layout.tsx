import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { LayoutDashboard, Wallet, Receipt, LogOut } from "lucide-react";
import { useEffect } from "react";

export function Layout() {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    fetch("/api/accounts").then(res => {
      if (res.status === 401) {
        navigate("/login");
      }
    }).catch(() => {
    });
  }, [navigate]);

  const handleLogout = async () => {
    await fetch("/api/logout", { method: "POST" });
    navigate("/login");
  };

  const navigation = [
    { name: "Dashboard", href: "/", icon: LayoutDashboard },
    { name: "Contas", href: "/accounts", icon: Wallet },
    { name: "Lançamentos", href: "/transactions", icon: Receipt },
  ];

  return (
    <div className="flex h-screen bg-[#F9FAFB]">
      <aside className="w-64 bg-white border-r border-gray-200">
        <div className="h-16 flex items-center px-6 border-b border-gray-200">
          <span className="text-xl font-bold text-[#1E293B]">Valora</span>
        </div>
        <nav className="p-4 space-y-1">
          {navigation.map((item) => {
            const isActive = location.pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                to={item.href}
                className={`flex items-center px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-[#059669]/10 text-[#166534]"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                }`}
              >
                <Icon
                  className={`mr-3 h-5 w-5 ${
                    isActive ? "text-[#166534]" : "text-gray-400"
                  }`}
                />
                {item.name}
              </Link>
            );
          })}
        </nav>
        <div className="absolute bottom-0 w-64 p-4">
          <button 
            type="button"
            onClick={handleLogout}
            className="flex items-center px-3 py-2.5 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 w-full transition-colors"
          >
            <LogOut className="mr-3 h-5 w-5 text-gray-400" />
            Sair
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto">
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-8">
          <h1 className="text-xl font-semibold text-[#1E293B]">
            {navigation.find((n) => n.href === location.pathname)?.name ||
              "Dashboard"}
          </h1>
          <div className="flex items-center gap-4">
            <div className="h-8 w-8 rounded-full bg-[#166534] flex items-center justify-center text-white font-medium">
              U
            </div>
          </div>
        </header>
        <div className="p-8 max-w-7xl mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
