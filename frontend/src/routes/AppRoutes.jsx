import { BrowserRouter, Routes, Route } from "react-router-dom";

import Login from "../pages/Login";
import Leads from "../pages/Leads";
import Deals from "../pages/Deals";
import ActivityLogs from "../pages/ActivityLogs";
import Users from "../pages/Users";

import ProtectedRoute from "./ProtectedRoute";
import DashboardLayout from "../layouts/DashboardLayout";
import Dashboard from "../pages/Dashboard";

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />

        <Route element={<ProtectedRoute />}>
          <Route element={<DashboardLayout />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/leads" element={<Leads />} />
            <Route path="/deals" element={<Deals />} />
            <Route path="/activity" element={<ActivityLogs />} />
            <Route path="/users" element={<Users />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
