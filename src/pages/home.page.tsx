import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../stores/auth.store";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import WantedSuspects from "@/components/wanted-suspects";

export default function HomePage() {
  const { session, clearSession } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    clearSession();
    navigate("/login");
  };

  return (
    <div className="container mx-auto p-4 md:p-6 space-y-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-extrabold tracking-tight lg:text-4xl text-primary font-mono">
          CASE FILE: DASHBOARD
        </h1>
        <p className="text-muted-foreground font-mono text-sm">
          {session
            ? `OFFICER ON DUTY: ${`${session.user.last_name}`.toUpperCase()}`
            : "UNAUTHORIZED ACCESS"}
        </p>
      </div>

      {session ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card className="w-full shadow-md border-primary/20 bg-card/50 backdrop-blur-sm">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-2xl font-mono text-primary flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                      DETECTIVE PROFILE
                    </CardTitle>
                    <CardDescription>
                      Authorized personnel access only. Clearance verified.
                    </CardDescription>
                  </div>
                  <Badge
                    variant="outline"
                    className="text-primary border-primary font-mono px-3 py-1"
                  >
                    STATUS: ACTIVE
                  </Badge>
                </div>
              </CardHeader>
              <Separator className="bg-primary/20" />
              <CardContent className="pt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-sm">
                  <div className="space-y-6">
                    <div className="flex flex-col space-y-1.5 p-3 rounded-lg bg-muted/30 border border-border/50">
                      <span className="text-[10px] uppercase text-muted-foreground tracking-wider font-bold">
                        Officer Name
                      </span>
                      <span className="font-mono text-lg font-semibold text-foreground tracking-tight">
                        {session.user.first_name} {session.user.last_name}
                      </span>
                    </div>

                    <div className="flex flex-col space-y-1.5 p-3 rounded-lg bg-muted/30 border border-border/50">
                      <span className="text-[10px] uppercase text-muted-foreground tracking-wider font-bold">
                        Badge Number
                      </span>
                      <span className="font-mono text-lg font-semibold text-foreground tracking-tight">
                        #{session.user.id.toString().padStart(6, "0")}
                      </span>
                    </div>

                    <div className="flex flex-col space-y-1.5 p-3 rounded-lg bg-muted/30 border border-border/50">
                      <span className="text-[10px] uppercase text-muted-foreground tracking-wider font-bold">
                        Rank Designation
                      </span>
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-lg font-semibold text-primary tracking-tight">
                          {session.user.role_title}
                        </span>
                        <Badge
                          variant="secondary"
                          className="font-mono text-xs"
                        >
                          Lvl {session.user.role}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="flex flex-col space-y-1.5 p-3 rounded-lg bg-muted/30 border border-border/50">
                      <span className="text-[10px] uppercase text-muted-foreground tracking-wider font-bold">
                        System Username
                      </span>
                      <span className="font-mono text-base text-foreground/80">
                        {session.user.username}
                      </span>
                    </div>

                    <div className="flex flex-col space-y-1.5 p-3 rounded-lg bg-muted/30 border border-border/50">
                      <span className="text-[10px] uppercase text-muted-foreground tracking-wider font-bold">
                        Contact Email
                      </span>
                      <span className="font-mono text-base text-foreground/80 truncate">
                        {session.user.email}
                      </span>
                    </div>

                    <div className="flex flex-col space-y-1.5 p-3 rounded-lg bg-muted/30 border border-border/50">
                      <span className="text-[10px] uppercase text-muted-foreground tracking-wider font-bold">
                        National ID
                      </span>
                      <span className="font-mono text-base text-foreground/80">
                        {session.user.national_id}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="bg-muted/20 border-t border-primary/10 pt-4">
                <Button
                  onClick={handleLogout}
                  variant="destructive"
                  className="w-full md:w-auto ml-auto font-mono text-xs uppercase tracking-wider"
                >
                  End Shift / Sign Off
                </Button>
              </CardFooter>
            </Card>
          </div>

          <div className="lg:col-span-1 min-h-full">
            <WantedSuspects />
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center min-h-[50vh]">
          <Card className="w-full max-w-sm text-center border-destructive/50 shadow-2xl shadow-destructive/10">
            <CardHeader>
              <CardTitle className="text-destructive flex items-center justify-center gap-2">
                RESTRICTED ACCESS
              </CardTitle>
              <CardDescription>Identity verification required.</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground font-mono">
                You are currently operating in an unauthorized capacity. Access
                to case files is denied.
              </p>
            </CardContent>
            <CardFooter className="flex justify-center">
              <Button
                onClick={() => navigate("/login")}
                className="w-full font-mono uppercase"
              >
                Access Login Terminal
              </Button>
            </CardFooter>
          </Card>
        </div>
      )}
    </div>
  );
}
