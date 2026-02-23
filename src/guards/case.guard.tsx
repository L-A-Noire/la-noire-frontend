import { Navigate, Outlet } from "react-router-dom";
import { useAuthStore } from "@/stores/auth.store";

const ALLOWED_CASE_ROLES = [
    "Administrator",
    "Chief",
    "Captain",
    "Sergent",
    "Detective",
    "Police/Patrol Officer",
    "Cadet",
    "Judge",
    "Coronary",
];

export default function CaseGuard() {
    const { session } = useAuthStore();

    if (!session) {
        return <Navigate to="/login" replace />;
    }

    if (!ALLOWED_CASE_ROLES.includes(session.user.role_title)) {
        return <Navigate to="/" replace />;
    }

    return <Outlet />;
}