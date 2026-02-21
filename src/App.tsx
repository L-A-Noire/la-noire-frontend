import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import MainLayout from "@/components/layout/main-layout";
import HomePage from "./pages/home.page";
import LoginPage from "@/pages/login.page";
import RegisterPage from "@/pages/register.page";
import RoleGuard from "@/guards/role.guard";
import { RolesListPage, RoleFormPage } from "@/pages/roles.page";
import { CasesListPage } from "@/pages/cases/cases-list.page";
import { CaseCreatePage } from "@/pages/cases/create-case.page";
import { CaseTimelinePage } from "@/pages/cases/case-timeline.page";

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MainLayout />}>
          <Route index element={<HomePage />} />
          <Route path="login" element={<LoginPage />} />
          <Route path="register" element={<RegisterPage />} />

          <Route path="cases" element={<CasesListPage />} />
          <Route path="cases/new" element={<CaseCreatePage />} />
          <Route path="cases/:id/timeline" element={<CaseTimelinePage />} />

          {/* Protected Routes for Administrators */}
          <Route element={<RoleGuard allowedRoles={["Administrator"]} />}>
            <Route path="roles" element={<RolesListPage />} />
            <Route path="roles/new" element={<RoleFormPage />} />
            <Route path="roles/:id" element={<RoleFormPage />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
