import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { Layout } from "./components/Layout";
import { Accounts } from "./pages/Accounts";
import { Dashboard } from "./pages/Dashboard";
import { Login } from "./pages/Login";
import { Register } from "./pages/Register";
import { Transactions } from "./pages/Transactions";

function App() {
	return (
		<BrowserRouter>
			<Routes>
				<Route path="/register" element={<Register />} />
				<Route path="/login" element={<Login />} />
				<Route path="/" element={<Layout />}>
					<Route index element={<Dashboard />} />
					<Route path="accounts" element={<Accounts />} />
					<Route path="transactions" element={<Transactions />} />
				</Route>
				<Route path="*" element={<Navigate to="/" replace />} />
			</Routes>
		</BrowserRouter>
	);
}

export default App;
