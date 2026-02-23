import { Navigate, Outlet } from "react-router-dom";
import { useAuthStore } from "@/stores/auth.store";
import type { AllowedCaseRole } from "@/types/role.type";

export default function RoleGuard({
  allowedRoles,
}: {
  allowedRoles: readonly AllowedCaseRole[];
}) {
  const session = useAuthStore((s) => s.session);

  if (!session) {
    return <Navigate to="/login" replace />;
  }

  if (!allowedRoles.includes(session.user.role_title)) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}
