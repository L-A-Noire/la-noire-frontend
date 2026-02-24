import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import MainLayout from "@/components/layout/main-layout";
import HomePage from "./pages/home.page";
import LoginPage from "@/pages/login.page";
import RegisterPage from "@/pages/register.page";
import { RolesListPage, RoleFormPage } from "@/pages/roles.page";
import { CasesListPage } from "@/pages/cases/cases-list.page";
import { CaseCreatePage } from "@/pages/cases/create-case.page";
import { CaseDetailPage } from "@/pages/cases/case-detail.page";
import { CaseTimelinePage } from "@/pages/cases/case-timeline.page";
import { ComplaintsListPage } from "@/pages/complaints/complaints-list.page";
import { FileComplaintPage } from "@/pages/complaints/file-complaint.page";
import { ComplaintDetailPage } from "@/pages/complaints/complaint-detail.page";
import { CrimeScenesListPage } from "@/pages/crime-scenes/crime-scenes-list.page";
import { ReportCrimeScenePage } from "@/pages/crime-scenes/report-crime-scene.page";
import { CrimeSceneDetailPage } from "@/pages/crime-scenes/crime-scene-detail.page";
import { CaseEvidencePage } from "@/pages/evidence/case-evidence.page";
import RecordEvidencePage from "@/pages/evidence/record-evidence.page";
import { EvidenceDetailPage } from "@/pages/evidence/evidence-detail.page";
import DetectiveBoardPage from "@/pages/detective-board/detective-board.page";
import { AddSuspectPage } from "@/pages/cases/add-suspect.page";
import RoleGuard from "./guards/role.guard";
import { ALLOWED_CASE_ROLES } from "./types/role.type";

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MainLayout />}>
          <Route index element={<HomePage />} />
          <Route path="login" element={<LoginPage />} />
          <Route path="register" element={<RegisterPage />} />

          <Route element={<RoleGuard allowedRoles={ALLOWED_CASE_ROLES} />}>
            <Route path="cases" element={<CasesListPage />} />
            <Route path="cases/new" element={<CaseCreatePage />} />
            <Route path="cases/:id" element={<CaseDetailPage />} />
            <Route path="cases/:id/timeline" element={<CaseTimelinePage />} />
            <Route
              path="cases/:caseId/evidence"
              element={<CaseEvidencePage />}
            />
            <Route
              path="cases/:caseId/evidence/record"
              element={<RecordEvidencePage />}
            />
            <Route
              path="cases/:caseId/evidence/:evidenceType/:evidenceId"
              element={<EvidenceDetailPage />}
            />
            <Route path="cases/:id/suspects/add" element={<AddSuspectPage />} />
          </Route>

          <Route element={<RoleGuard allowedRoles={["Detective"]} />}>
            <Route path="detective-board" element={<DetectiveBoardPage />} />
          </Route>

          <Route path="complaints" element={<ComplaintsListPage />} />
          <Route path="complaints/new" element={<FileComplaintPage />} />
          <Route path="complaints/:id" element={<ComplaintDetailPage />} />

          <Route path="crime-scenes" element={<CrimeScenesListPage />} />
          <Route path="crime-scenes/new" element={<ReportCrimeScenePage />} />
          <Route path="crime-scenes/:id" element={<CrimeSceneDetailPage />} />

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
