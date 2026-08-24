import { Navigate, Route, Routes } from "react-router-dom";
import { AppShell } from "@/components/AppShell";
import { ProtectedRoute } from "@/auth/ProtectedRoute";
import { LoginPage } from "@/pages/LoginPage";
import { DashboardPage } from "@/pages/DashboardPage";
import { RolesPage } from "@/pages/RolesPage";
import { ReportingPage } from "@/pages/ReportingPage";
import { ReportBuilderPage } from "@/pages/ReportBuilderPage";
import { SheFilesPage } from "@/pages/SheFilesPage";
import { CompliancePage } from "@/pages/CompliancePage";
import { SettingsPage } from "@/pages/SettingsPage";

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route
        element={
          <ProtectedRoute>
            <AppShell />
          </ProtectedRoute>
        }
      >
        <Route index element={<DashboardPage />} />
        <Route path="roles" element={<RolesPage />} />
        <Route path="reports" element={<ReportingPage />} />
        <Route path="reports/new" element={<ReportBuilderPage />} />
        <Route path="reports/:id/edit" element={<ReportBuilderPage />} />
        <Route path="she-files" element={<SheFilesPage />} />
        <Route path="compliance" element={<CompliancePage />} />
        <Route path="settings" element={<SettingsPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
