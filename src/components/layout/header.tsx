// header.tsx
import { Link, useLocation } from "react-router-dom";
import { useAuthStore } from "@/stores/auth.store";
import { Button } from "@/components/ui/button";
import { ALLOWED_CASE_ROLES } from "@/types/role.type";

export const Header = () => {
  const session = useAuthStore((s) => s.session);
  const { pathname } = useLocation();
  const isAdmin = session?.user.role_title === "Administrator";
  const isDetective = session?.user.role_title === "Detective";
  const isJudge = session?.user.role_title === "Judge";

  // Base users can access testimonies
  const isBaseUser = session?.user.role_title === "Base User";

  // Police roles (excluding cadet) can access testimonies for review
  const canReviewTestimonies = session && [
    "Police/Patrol Officer",
    "Detective",
    "Sergent",
    "Captain",
    "Chief"
  ].includes(session.user.role_title);

  const canAccessCases =
    session && ALLOWED_CASE_ROLES.includes(session.user.role_title);

  const isActive = (path: string) => {
    return pathname.startsWith(path);
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center justify-between px-4">
        <div className="flex items-center gap-6">
          <Link to="/" className="flex items-center space-x-2">
            <span className="text-xl font-bold tracking-tighter text-primary">
              L.A. NOIRE
            </span>
          </Link>
          {session && (
            <nav className="flex items-center gap-4 text-sm lg:gap-6">
              {/* Testimonies - for base users and police reviewers */}
              {(isBaseUser || canReviewTestimonies) && (
                <Link
                  to="/testimonies"
                  className={`transition-colors font-mono ${isActive("/testimonies")
                    ? "text-primary font-semibold"
                    : "text-foreground/60 hover:text-foreground/80"
                    }`}
                >
                  Testimonies
                </Link>
              )}

              {/* Only show Cases menu if user has access */}
              {canAccessCases && (
                <>
                  <Link
                    to="/cases"
                    className={`transition-colors font-mono ${isActive("/cases")
                      ? "text-primary font-semibold"
                      : "text-foreground/60 hover:text-foreground/80"
                      }`}
                  >
                    Cases
                  </Link>
                  {isDetective && (
                    <Link
                      to="/detective-board"
                      className={`transition-colors font-mono ${isActive("/detective-board")
                        ? "text-primary font-semibold"
                        : "text-foreground/60 hover:text-foreground/80"
                        }`}
                    >
                      Board
                    </Link>
                  )}
                </>
              )}

              <Link
                to="/complaints"
                className={`transition-colors font-mono ${isActive("/complaints")
                  ? "text-primary font-semibold"
                  : "text-foreground/60 hover:text-foreground/80"
                  }`}
              >
                Complaints
              </Link>

              {/* Crime Scenes - for police roles */}
              {canReviewTestimonies && (
                <Link
                  to="/crime-scenes"
                  className={`transition-colors font-mono ${isActive("/crime-scenes")
                    ? "text-primary font-semibold"
                    : "text-foreground/60 hover:text-foreground/80"
                    }`}
                >
                  Scenes
                </Link>
              )}

              {isJudge && (
                <Link
                  to="/court"
                  className={`transition-colors font-mono ${isActive("/court")
                    ? "text-primary font-semibold"
                    : "text-foreground/60 hover:text-foreground/80"
                    }`}
                >
                  Court
                </Link>
              )}
              {isAdmin && (
                <Link
                  to="/roles"
                  className={`transition-colors font-mono ${isActive("/roles")
                    ? "text-primary font-semibold"
                    : "text-foreground/60 hover:text-foreground/80"
                    }`}
                >
                  Roles
                </Link>
              )}
            </nav>
          )}
        </div>
        <div className="flex items-center gap-2">
          {session ? (
            <div className="flex items-center gap-4">
              {isAdmin && (
                <Button
                  variant="outline"
                  size="sm"
                  asChild
                  className="font-mono text-xs border-primary text-primary hover:bg-primary hover:text-primary-foreground"
                >
                  <Link to="/admin">Admin Panel</Link>
                </Button>
              )}

              <div className="text-xs font-mono text-muted-foreground hidden md:block">
                Logged in as:{" "}
                <span className="text-primary">{session.user.username}</span>
                <span className="ml-2 text-xs">
                  ({session.user.role_title})
                </span>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                asChild
                className="font-mono text-xs"
              >
                <Link to="/login">Login</Link>
              </Button>
              <Button size="sm" asChild className="font-mono text-xs">
                <Link to="/register">Register</Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    </header >
  );
};