import { Outlet, Link } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useAuthStore } from "@/stores/auth.store";

const MainLayout = () => {
  const { session } = useAuthStore();
  const isAdmin = session?.user.role_title === "Administrator";

  return (
    <div className="dark flex min-h-screen flex-col font-sans text-foreground bg-background">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center justify-between px-4">
          <div className="flex items-center gap-6">
            <Link to="/" className="flex items-center space-x-2">
              <span className="text-xl font-bold tracking-tighter text-primary">
                L.A. NOIRE
              </span>
            </Link>
            <nav className="flex items-center gap-4 text-sm lg:gap-6">
              <Link
                to="/cases"
                className="transition-colors hover:text-foreground/80 text-foreground/60 font-mono"
              >
                Crime Cases
              </Link>
              {isAdmin && (
                <Link
                  to="/roles"
                  className="transition-colors hover:text-foreground/80 text-foreground/60 font-mono"
                >
                  Role Management
                </Link>
              )}
            </nav>
          </div>
          <div className="flex items-center gap-2">
            {session && (
              <div className="text-xs font-mono text-muted-foreground hidden md:block">
                Logged in as:{" "}
                <span className="text-primary">{session.user.username}</span>
              </div>
            )}
          </div>
        </div>
      </header>
      <main className="flex-1 container m-auto p-4 md:p-8">
        <Outlet />
      </main>
      <ToastContainer
        position="bottom-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="dark"
      />
    </div>
  );
};

export default MainLayout;
