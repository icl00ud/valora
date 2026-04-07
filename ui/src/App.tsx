import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Layout } from "./components/Layout";
import { Dashboard } from "./pages/Dashboard";
import { Accounts } from "./pages/Accounts";
import { Transactions } from "./pages/Transactions";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="accounts" element={<Accounts />} />
          <Route path="transactions" element={<Transactions />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
