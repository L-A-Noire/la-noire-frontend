import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
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
import { HugeiconsIcon } from "@hugeicons/react";
import {
  FolderOpenIcon,
  CheckmarkCircle01Icon,
  UserGroupIcon,
  TimelineEventIcon,
} from "@hugeicons/core-free-icons";
import http from "@/lib/http";
import { logout as logoutApi } from "@/api/auth";
import WantedSuspects from "@/components/wanted-suspects";

// API function to fetch employee count
const getEmployeeCount = async () => {
  const response = await http.get("/auth/employees-count/");
  return response.data;
};

// API function to fetch case statistics
const getCaseStatistics = async () => {
  const response = await http.get("/crime/cases-count/");
  return response.data;
};

export default function HomePage() {
  const { session, clearSession } = useAuthStore();
  const navigate = useNavigate();

  // Fetch employee count from API
  const {
    data: employeeData,
    isLoading: isLoadingEmployees,
    isError: isErrorEmployees,
  } = useQuery({
    queryKey: ["employee-count"],
    queryFn: getEmployeeCount,
    enabled: !session, // Only fetch when user is not logged in (public view)
  });

  // Fetch case statistics from API
  const {
    data: caseStats,
    isLoading: isLoadingCases,
    isError: isErrorCases,
  } = useQuery({
    queryKey: ["case-statistics"],
    queryFn: getCaseStatistics,
    enabled: !session, // Only fetch when user is not logged in (public view)
  });

  const handleLogout = () => {
    const refresh = session?.refresh;
    if (refresh) {
      logoutApi(refresh).finally(() => {
        clearSession();
        navigate("/login");
      });
    } else {
      clearSession();
      navigate("/login");
    }
  };

  // Calculate solve rate
  const solveRate = caseStats?.total_count
    ? Math.round((caseStats.closed_count / caseStats.total_count) * 100)
    : 71.5;

  return (
    <div className="container mx-auto p-4 md:p-6 space-y-8">
      {!session && (
        <>
          <div className="flex flex-col gap-2">
            <h1 className="text-3xl font-extrabold tracking-tight lg:text-4xl text-primary font-mono">
              LOS ANGELES POLICE DEPARTMENT
            </h1>
            <p className="text-muted-foreground font-mono text-sm">
              UNAUTHORIZED ACCESS
            </p>
          </div>

          {/* Department Introduction */}
          <Card className="border-primary/20 bg-gradient-to-br from-card/95 to-card/50 backdrop-blur-sm shadow-lg">
            <CardHeader>
              <CardTitle className="text-2xl font-mono text-primary">
                COMMAND CENTER
              </CardTitle>
              <CardDescription className="text-base">
                Los Angeles Police Department - Protecting and Serving Since
                1869
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm leading-relaxed text-muted-foreground">
                The Los Angeles Police Department stands as a beacon of justice
                in the city of angels. Our detectives work tirelessly to solve
                crimes, protect citizens, and maintain law and order across the
                sprawling metropolis. From patrol officers on the beat to
                specialized detectives investigating homicides, vice, arson, and
                traffic cases, every member of the LAPD plays a crucial role in
                keeping our streets safe.
              </p>
              <p className="text-sm leading-relaxed text-muted-foreground">
                This case management system provides authorized personnel with
                tools to track investigations, manage evidence, coordinate with
                witnesses, and bring criminals to justice. Every case matters.
                Every clue counts. Every citizen deserves protection.
              </p>
            </CardContent>
          </Card>

          {/* Statistics Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Solved Cases Card */}
            <Card className="border-l-4 border-l-green-500 hover:shadow-lg transition-shadow">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardDescription className="text-xs uppercase font-bold tracking-wider">
                    Solved Cases
                  </CardDescription>
                  <HugeiconsIcon
                    icon={CheckmarkCircle01Icon}
                    className="h-5 w-5 text-green-600"
                  />
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-1">
                  {isLoadingCases ? (
                    <div className="h-8 w-16 bg-muted animate-pulse rounded" />
                  ) : (
                    <p className="text-3xl font-bold text-foreground font-mono">
                      {caseStats?.closed_count?.toLocaleString() || "0"}
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    {solveRate}% solve rate
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Active Cases Card */}
            <Card className="border-l-4 border-l-blue-500 hover:shadow-lg transition-shadow">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardDescription className="text-xs uppercase font-bold tracking-wider">
                    Active Cases
                  </CardDescription>
                  <HugeiconsIcon
                    icon={TimelineEventIcon}
                    className="h-5 w-5 text-blue-600"
                  />
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-1">
                  {isLoadingCases ? (
                    <div className="h-8 w-16 bg-muted animate-pulse rounded" />
                  ) : (
                    <p className="text-3xl font-bold text-foreground font-mono">
                      {caseStats?.open_count?.toLocaleString() || "0"}
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    Currently under investigation
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Total Cases Card */}
            <Card className="border-l-4 border-l-amber-500 hover:shadow-lg transition-shadow">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardDescription className="text-xs uppercase font-bold tracking-wider">
                    Total Cases
                  </CardDescription>
                  <HugeiconsIcon
                    icon={FolderOpenIcon}
                    className="h-5 w-5 text-amber-600"
                  />
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-1">
                  {isLoadingCases ? (
                    <div className="h-8 w-16 bg-muted animate-pulse rounded" />
                  ) : (
                    <p className="text-3xl font-bold text-foreground font-mono">
                      {caseStats?.total_count?.toLocaleString() || "0"}
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    All time records
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Personnel Card */}
            <Card className="border-l-4 border-l-purple-500 hover:shadow-lg transition-shadow">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardDescription className="text-xs uppercase font-bold tracking-wider">
                    Personnel
                  </CardDescription>
                  <HugeiconsIcon
                    icon={UserGroupIcon}
                    className="h-5 w-5 text-purple-600"
                  />
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-1">
                  {isLoadingEmployees ? (
                    <div className="h-8 w-16 bg-muted animate-pulse rounded" />
                  ) : (
                    <p className="text-3xl font-bold text-foreground font-mono">
                      {employeeData?.totalEmployees?.toLocaleString() || "0"}
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    Active duty officers
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Error Messages (if any) */}
          {(isErrorEmployees || isErrorCases) && (
            <div className="text-center text-amber-600 dark:text-amber-400 text-sm p-2">
              {isErrorEmployees && "Failed to load personnel count. "}
              {isErrorCases && "Failed to load case statistics. "}
            </div>
          )}
        </>
      )}

      {session ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card className="w-full shadow-md border-primary/20 bg-card/50 backdrop-blur-sm">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-2xl font-mono text-primary flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                      PROFILE
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
        <div className="flex flex-col items-center justify-center">
          <Card className="w-full max-w-2xl text-center border-destructive/50 shadow-2xl shadow-destructive/10">
            <CardHeader>
              <CardTitle className="text-destructive flex items-center justify-center gap-2">
                RESTRICTED ACCESS
              </CardTitle>
              <CardDescription>Identity verification required.</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground font-mono">
                You are currently operating in an unauthorized capacity. Access
                to case files and restricted areas is denied. Please
                authenticate to access the full LAPD Case Management System.
              </p>
            </CardContent>
            <CardFooter className="flex justify-center gap-3">
              <Button
                onClick={() => navigate("/login")}
                className="font-mono uppercase"
              >
                Access Login Terminal
              </Button>
              <Button
                onClick={() => navigate("/register")}
                variant="outline"
                className="font-mono uppercase"
              >
                Register
              </Button>
            </CardFooter>
          </Card>
        </div>
      )}
    </div>
  );
}
