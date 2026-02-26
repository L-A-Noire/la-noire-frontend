import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import MainLayout from "@/components/layout/main-layout";
import HomePage from "./pages/home.page";
import LoginPage from "@/pages/login.page";
import RegisterPage from "@/pages/register.page";
import { CourtDashboardPage } from "@/pages/court/court-dashboard.page";
import { TrialPage } from "@/pages/court/trial.page";
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
import { TestimoniesListPage } from "@/pages/testimonies/testimonies-list.page";
import { TestimonyDetailPage } from "@/pages/testimonies/testimony-detail.page";
import { TestimonyForm } from "@/components/evidence/testimony-form";
import RoleGuard from "./guards/role.guard";
import { ALLOWED_CASE_ROLES } from "./types/role.type";
import AdminLayout from "@/components/layout/admin-layout";
import AdminDashboardPage from "@/pages/admin/admin-dashboard.page";
import AdminCasesPage from "@/pages/admin/admin-cases.page";
import AdminRolesPage from "@/pages/admin/admin-roles.page";
import AdminComplaintsPage from "@/pages/admin/admin-complaints.page";
import AdminCrimeScenesPage from "@/pages/admin/admin-crime-scenes.page";
import AdminSuspectsPage from "@/pages/admin/admin-suspects.page";
import AdminPunishmentsPage from "@/pages/admin/admin-punishments.page";
import { ManageSuspectsPage } from "@/pages/cases/manage-suspects.page";
import { ReviewSuspectsPage } from "@/pages/cases/review-suspects.page";
import PaymentPage from "@/pages/payment.page";
import SuccessPaymentPage from "@/pages/success-payment.page";

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MainLayout />}>
          <Route index element={<HomePage />} />
          <Route path="login" element={<LoginPage />} />
          <Route path="register" element={<RegisterPage />} />
          <Route path="payment" element={<PaymentPage />} />
          <Route path="success-payment" element={<SuccessPaymentPage />} />

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
            <Route
              path="cases/:id/suspects/manage"
              element={<ManageSuspectsPage />}
            />
            <Route
              path="cases/:id/suspects/review"
              element={<ReviewSuspectsPage />}
            />
          </Route>

          <Route element={<RoleGuard allowedRoles={["Detective"]} />}>
            <Route path="detective-board" element={<DetectiveBoardPage />} />
          </Route>

          {/* Court Routes - Judge Only */}
          <Route element={<RoleGuard allowedRoles={["Judge"]} />}>
            <Route path="court" element={<CourtDashboardPage />} />
            <Route path="court/trial/:id" element={<TrialPage />} />
          </Route>

          <Route path="complaints" element={<ComplaintsListPage />} />
          <Route path="complaints/new" element={<FileComplaintPage />} />
          <Route path="complaints/:id" element={<ComplaintDetailPage />} />

          <Route path="crime-scenes" element={<CrimeScenesListPage />} />
          <Route path="crime-scenes/new" element={<ReportCrimeScenePage />} />
          <Route path="crime-scenes/:id" element={<CrimeSceneDetailPage />} />

          <Route path="testimonies" element={<TestimoniesListPage />} />
          <Route
            path="testimonies/new"
            element={
              <div className="container mx-auto py-8 max-w-2xl">
                <TestimonyForm />
              </div>
            }
          />
          <Route path="testimonies/:id" element={<TestimonyDetailPage />} />

          {/* Protected Routes for Administrators */}
          <Route element={<RoleGuard allowedRoles={["Administrator"]} />}>
            <Route path="roles" element={<RolesListPage />} />
            <Route path="roles/new" element={<RoleFormPage />} />
            <Route path="roles/:id" element={<RoleFormPage />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>

        {/* Admin Panel Routes */}
        <Route element={<RoleGuard allowedRoles={["Administrator"]} />}>
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminDashboardPage />} />
            <Route path="cases" element={<AdminCasesPage />} />
            <Route path="roles" element={<AdminRolesPage />} />
            <Route path="complaints" element={<AdminComplaintsPage />} />
            <Route path="crime-scenes" element={<AdminCrimeScenesPage />} />
            <Route path="suspects" element={<AdminSuspectsPage />} />
            <Route path="punishments" element={<AdminPunishmentsPage />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
