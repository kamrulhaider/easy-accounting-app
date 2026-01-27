import { useEffect } from "react";
import { Toaster } from "sonner";
import { BrowserRouter, Routes, Route, Navigate, Outlet } from "react-router-dom";
import { useAuthStore } from "@/store/useAuthStore";
import LoginPage from "@/pages/Login";
import Dashboard from "@/pages/Dashboard";
import Profile from "@/pages/Profile";
import Companies from "@/pages/Companies";
import UsersAndAdmins from "@/pages/UsersAndAdmins";
import CompanyUsers from "@/pages/CompanyUsers";
import Accounts from "@/pages/Accounts";
import Categories from "@/pages/Categories";
import Journal from "@/pages/Journal";
import Ledger from "@/pages/Ledger";
import TrialBalance from "@/pages/TrialBalance";
import BalanceSheet from "@/pages/BalanceSheet";
import AuditLogs from "@/pages/AuditLogs";
import "./App.css";

function ProtectedRoute() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isLoading = useAuthStore((state) => state.isLoading);

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return <Outlet />;
}

export default function App() {
  const initialize = useAuthStore((state) => state.initialize);

  useEffect(() => {
    initialize();
  }, [initialize]);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route element={<ProtectedRoute />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/companies" element={<Companies />} />
          <Route path="/users-admins" element={<UsersAndAdmins />} />
          <Route path="/users" element={<CompanyUsers />} />
          <Route path="/accounts" element={<Accounts />} />
          <Route path="/account-categories" element={<Categories />} />
          <Route path="/journal" element={<Journal />} />
          <Route path="/ledger" element={<Ledger />} />
          <Route path="/trial-balance" element={<TrialBalance />} />
          <Route path="/balance-sheet" element={<BalanceSheet />} />
          <Route path="/audit-logs" element={<AuditLogs />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <Toaster />
    </BrowserRouter>
  );
}
