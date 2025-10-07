import { Link, NavLink } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Download, PlusCircle, LogOut, User } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useNavigate } from "react-router-dom";

export function AppLayout({ children, onCreateClick, onExportClick }) {
  const { user, logout, hasRole, hasAnyRole } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };
  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/30 text-foreground">
      <header className="sticky top-0 z-40 border-b bg-card/80 backdrop-blur supports-[backdrop-filter]:bg-card/60">
        <div className="container flex items-center justify-between h-14">
          <Link to="/" className="flex items-center gap-2">
            <div className="rounded-md shadow-inner h-7 w-7 bg-primary/90" />
            <span className="font-extrabold tracking-tight">
              СтройДефект Контроль
            </span>
          </Link>
          <nav className="items-center hidden gap-1 text-sm md:flex">
            <TopLink to="/" label="Панель" />
            <TopLink to="/defects" label="Дефекты" />
          </nav>
          <div className="flex items-center gap-2">
            {onExportClick && hasRole("manager") && (
              <Button
                variant="outline"
                size="sm"
                onClick={onExportClick}
                className="gap-2"
              >
                <Download className="w-4 h-4" /> Экспорт CSV
              </Button>
            )}
            {onCreateClick && hasAnyRole(["manager", "engineer"]) && (
              <Button size="sm" onClick={onCreateClick} className="gap-2">
                <PlusCircle className="w-4 h-4" /> Новый дефект
              </Button>
            )}
            {user && (
              <div className="flex items-center gap-2 ml-4">
                <div className="flex items-center gap-2 text-sm">
                  <User className="w-4 h-4" />
                  <span>
                    {user.name} ({user.role})
                  </span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleLogout}
                  className="gap-2"
                >
                  <LogOut className="w-4 h-4" /> Выйти
                </Button>
              </div>
            )}
          </div>
        </div>
      </header>
      <main className="container py-6">{children}</main>
      <footer className="py-6 text-xs text-center border-t text-muted-foreground">
        © {new Date().getFullYear()} СтройДефект Контроль
      </footer>
    </div>
  );
}

function TopLink({ to, label }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        cn(
          "rounded-md px-3 py-1.5 hover:bg-muted transition-colors",
          isActive && "bg-muted text-foreground",
        )
      }
      end
    >
      {label}
    </NavLink>
  );
}
