import { Outlet, Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Shield01Icon,
  Briefcase01Icon,
  File01Icon,
  MapPinIcon,
  Search01Icon,
  Legal01Icon,
  User02Icon,
} from "@hugeicons/core-free-icons";

const adminNavItems = [
  {
    title: "Users",
    href: "/admin/users",
    icon: User02Icon,
  },
  {
    title: "Roles",
    href: "/admin/roles",
    icon: Shield01Icon,
  },
  {
    title: "Cases",
    href: "/admin/cases",
    icon: Briefcase01Icon,
  },
  {
    title: "Complaints",
    href: "/admin/complaints",
    icon: File01Icon,
  },
  {
    title: "Crime Scenes",
    href: "/admin/crime-scenes",
    icon: MapPinIcon,
  },
  {
    title: "Suspects",
    href: "/admin/suspects",
    icon: Search01Icon,
  },
  {
    title: "Punishments",
    href: "/admin/punishments",
    icon: Legal01Icon,
  },
];

export default function AdminLayout() {
  const location = useLocation();

  return (
    <div className="flex min-h-screen bg-muted/40">
      {/* Sidebar */}
      <aside className="w-64 border-r bg-background flex flex-col">
        <Link
          to="/admin"
          className="h-14 flex items-center px-4 border-b font-semibold hover:bg-muted/50 transition-colors"
        >
          <span className="text-xl font-bold tracking-tighter text-primary">
            L.A. NOIRE
          </span>
        </Link>
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {adminNavItems.map((item) => {
            const isActive =
              location.pathname === item.href ||
              location.pathname.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.href}
                to={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "hover:bg-muted text-muted-foreground hover:text-foreground",
                )}
              >
                <HugeiconsIcon icon={item.icon} className="h-4 w-4" />
                {item.title}
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0">
        <header className="h-14 border-b bg-background flex items-center px-6">
          <h1 className="font-semibold text-lg">Administration Panel</h1>
        </header>
        <div className="flex-1 p-6 overflow-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
