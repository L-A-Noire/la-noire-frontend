import { useQuery } from "@tanstack/react-query";
import { getSuspectCrimes } from "@/api/suspect";
import { Link } from "react-router-dom";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { HugeiconsIcon } from "@hugeicons/react";
import { Legal01Icon, Loading03Icon } from "@hugeicons/core-free-icons";

export const CourtDashboardPage = () => {
  const { data: suspects, isLoading } = useQuery({
    queryKey: ["suspects-trial"],
    queryFn: getSuspectCrimes,
  });

  // Filter suspects who are eligible for trial (e.g., arrested)
  const eligibleSuspects =
    suspects?.filter((s) => s.status === "arrested") || [];

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <HugeiconsIcon
          icon={Loading03Icon}
          className="h-10 w-10 animate-spin text-primary"
        />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Court Docket</h1>
          <p className="text-muted-foreground mt-1">
            Select a case to proceed with the trial.
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Awaiting Trial</CardTitle>
        </CardHeader>
        <CardContent>
          {eligibleSuspects.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No suspects awaiting trial.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Suspect</TableHead>
                  <TableHead>Case</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {eligibleSuspects.map((sc) => (
                  <TableRow key={sc.id}>
                    <TableCell className="font-medium">
                      {sc.suspect_details?.first_name}{" "}
                      {sc.suspect_details?.last_name}
                    </TableCell>
                    <TableCell>
                      {sc.case_details ? (
                        <Link
                          to={`/cases/${sc.case_details.id}`}
                          className="hover:underline text-primary"
                        >
                          Case #{sc.case_details.id}
                        </Link>
                      ) : (
                        <span className="text-muted-foreground">
                          No Case Linked
                        </span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className="bg-orange-100 text-orange-800 border-orange-200"
                      >
                        {sc.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Link to={`/court/trial/${sc.id}`}>
                        <Button size="sm" className="gap-2">
                          <HugeiconsIcon icon={Legal01Icon} size={16} />
                          Start Trial
                        </Button>
                      </Link>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
