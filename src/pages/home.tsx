import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../stores/auth-store";
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

export const Home = () => {
  const { session, clearSession } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    clearSession();
    navigate("/login");
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] gap-6">
      <h1 className="text-3xl font-extrabold tracking-tight lg:text-4xl text-primary">
        Case File: Dashboard
      </h1>
      {session ? (
        <Card className="w-full max-w-md shadow-lg">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl">Detective Profile</CardTitle>
              <Badge variant="outline" className="text-primary border-primary">
                Active
              </Badge>
            </div>
            <CardDescription>Authorized personnel access only.</CardDescription>
          </CardHeader>
          <Separator />
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex flex-col space-y-1">
                <span className="text-xs uppercase text-muted-foreground tracking-wider">
                  Username
                </span>
                <span className="font-mono text-base font-semibold text-foreground">
                  {session.user.username}
                </span>
              </div>

              <div className="flex flex-col space-y-1">
                <span className="text-xs uppercase text-muted-foreground tracking-wider">
                  Badge ID
                </span>
                <span className="font-mono text-base font-semibold text-foreground">
                  #{session.user.id.toString().padStart(6, "0")}
                </span>
              </div>

              <div className="col-span-2 flex flex-col space-y-1">
                <span className="text-xs uppercase text-muted-foreground tracking-wider">
                  Full Name
                </span>
                <span className="font-mono text-base font-semibold text-foreground">
                  {session.user.first_name} {session.user.last_name}
                </span>
              </div>

              <div className="col-span-2 flex flex-col space-y-1">
                <span className="text-xs uppercase text-muted-foreground tracking-wider">
                  Email Contact
                </span>
                <span className="font-mono text-base font-semibold text-foreground">
                  {session.user.email}
                </span>
              </div>

              <div className="flex flex-col space-y-1">
                <span className="text-xs uppercase text-muted-foreground tracking-wider">
                  Phone
                </span>
                <span className="font-mono text-base font-semibold text-foreground">
                  {session.user.phone}
                </span>
              </div>

              <div className="flex flex-col space-y-1">
                <span className="text-xs uppercase text-muted-foreground tracking-wider">
                  National ID
                </span>
                <span className="font-mono text-base font-semibold text-foreground">
                  {session.user.national_id}
                </span>
              </div>

              <div className="col-span-2 flex flex-col space-y-1 pt-2 border-t border-dashed border-muted-foreground/30">
                <span className="text-xs uppercase text-muted-foreground tracking-wider">
                  Rank / Designation
                </span>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-lg font-bold text-primary">
                    {session.user.role_title}
                  </span>
                  <Badge variant="secondary" className="text-xs">
                    Level {session.user.role}
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button
              onClick={handleLogout}
              variant="destructive"
              className="w-full"
            >
              Sign Off Case
            </Button>
          </CardFooter>
        </Card>
      ) : (
        <Card className="w-full max-w-sm text-center">
          <CardHeader>
            <CardTitle>Restricted Area</CardTitle>
            <CardDescription>
              Please identify yourself to proceed.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              You are currently operating anonymously.
            </p>
          </CardContent>
          <CardFooter className="flex justify-center">
            <Button onClick={() => navigate("/login")} className="w-full">
              Access Login
            </Button>
          </CardFooter>
        </Card>
      )}
    </div>
  );
};

export default Home;
