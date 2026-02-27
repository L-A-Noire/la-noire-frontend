import { useQuery } from "@tanstack/react-query";
import { getSuspectCrimes, getAllSuspects } from "@/api/suspect";
import { getCases } from "@/api/cases";
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
import { useMemo } from "react";
import type { Suspect } from "@/types/suspect.type";
import type { CaseDetail } from "@/types/case.type";

export const CourtDashboardPage = () => {
  const {
    data: suspectCrimes = [],
    isLoading: isLoadingCrimes,
    error: crimesError,
  } = useQuery({
    queryKey: ["suspect-crimes"],
    queryFn: getSuspectCrimes,
  });

  const {
    data: suspects = [],
    isLoading: isLoadingSuspects,
    error: suspectsError,
  } = useQuery({
    queryKey: ["suspects"],
    queryFn: getAllSuspects,
  });

  const {
    data: cases = [],
    isLoading: isLoadingCases,
    error: casesError,
  } = useQuery({
    queryKey: ["cases"],
    queryFn: getCases,
  });

  const suspectMap = useMemo(() => {
    const map = new Map<number, Suspect>();
    suspects.forEach((suspect) => map.set(suspect.id, suspect));
    return map;
  }, [suspects]);

  const caseMap = useMemo(() => {
    const map = new Map<number, CaseDetail>();
    cases.forEach((c) => map.set(c.id, c));
    return map;
  }, [cases]);

  const convictedCases = useMemo(() => {
    const convictedSuspectIds = suspects
      .filter((suspect) => suspect.status === "convicted")
      .map((suspect) => suspect.id);

    console.log("Convicted suspect IDs:", convictedSuspectIds);


    const relevantSuspectCrimes = suspectCrimes.filter((sc) =>
      convictedSuspectIds.includes(sc.suspect),

    );

    console.log("Relevant suspect-crimes:", relevantSuspectCrimes);

    // Enrich with full data
    return relevantSuspectCrimes.map((sc) => ({
      ...sc,
      suspect_details: suspectMap.get(sc.suspect),
      crime_details: sc.crime_details || (sc.crime ? { id: sc.crime } : null),
      case_details: sc.crime ? caseMap.get(sc.crime) : null,
    }));
  }, [suspectCrimes, suspects, suspectMap, caseMap]);

  const isLoading = isLoadingCrimes || isLoadingSuspects || isLoadingCases;
  const error = crimesError || suspectsError || casesError;

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

  if (error) {
    console.error("Error fetching data:", error);
    return (
      <div className="container mx-auto py-8">
        <Card className="border-destructive">
          <CardContent className="pt-6 text-center">
            <p className="text-destructive">
              Error loading cases. Please try again.
            </p>
            <Button
              variant="outline"
              className="mt-4"
              onClick={() => window.location.reload()}
            >
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Court Docket</h1>
          <p className="text-muted-foreground mt-1">
            Review convicted suspects and issue final judgments.
          </p>
        </div>
        <Badge variant="outline" className="px-3 py-1">
          {convictedCases.length} Cases Pending
        </Badge>
      </div>

      {/* Debug info - remove in production */}
      <div className="text-xs text-muted-foreground p-2 bg-muted/30 rounded space-y-1">
        <p>Total suspects: {suspects.length}</p>
        <p>
          Convicted suspects:{" "}
          {suspects.filter((s) => s.status === "convicted").length}
        </p>
        <p>Total suspect-crimes: {suspectCrimes.length}</p>
        <p>Cases for trial: {convictedCases.length}</p>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Cases Awaiting Sentencing</CardTitle>
          <p className="text-sm text-muted-foreground">
            {convictedCases.length} case(s) ready for judicial review
          </p>
        </CardHeader>
        <CardContent>
          {convictedCases.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground border rounded-lg border-dashed">
              <Legal01Icon className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium mb-2">
                No Cases Awaiting Sentencing
              </p>
              <p className="text-sm">
                Convicted suspects will appear here for judgment.
              </p>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead className="w-[250px]">Suspect</TableHead>
                    <TableHead>Case Details</TableHead>
                    <TableHead className="w-[100px]">Crime Level</TableHead>
                    <TableHead className="w-[100px]">Status</TableHead>
                    <TableHead className="w-[120px] text-right">
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {convictedCases.map((sc) => (
                    <TableRow key={sc.id} className="hover:bg-muted/50">
                      <TableCell className="font-medium">
                        <div className="space-y-1">
                          <p className="font-semibold">
                            {sc.suspect_details?.name}
                          </p>
                          {sc.suspect_details?.nickname && (
                            <p className="text-xs text-muted-foreground">
                              AKA: {sc.suspect_details.nickname}
                            </p>
                          )}
                          {sc.suspect_details?.national_id && (
                            <p className="text-xs text-muted-foreground font-mono">
                              ID: {sc.suspect_details.national_id}
                            </p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {sc.case_details ? (
                          <div className="space-y-1">
                            <p className="font-medium">
                              {sc.case_details.crime_title}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Case #{sc.case_details.id}
                            </p>
                            {sc.case_details.crime_details?.description && (
                              <p className="text-xs text-muted-foreground line-clamp-2">
                                {sc.case_details.crime_details.description}
                              </p>
                            )}
                          </div>
                        ) : (
                          <span className="text-muted-foreground text-sm">
                            Crime ID: {sc.crime}
                          </span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            sc.case_details?.crime_details?.level === "4"
                              ? "destructive"
                              : "outline"
                          }
                          className={
                            sc.case_details?.crime_details?.level === "4"
                              ? "bg-red-100 text-red-800 border-red-200"
                              : sc.case_details?.crime_details?.level === "3"
                                ? "bg-orange-100 text-orange-800 border-orange-200"
                                : sc.case_details?.crime_details?.level === "2"
                                  ? "bg-yellow-100 text-yellow-800 border-yellow-200"
                                  : "bg-green-100 text-green-800 border-green-200"
                          }
                        >
                          Level {sc.case_details?.crime_details?.level || "N/A"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className="bg-purple-100 text-purple-800 border-purple-200"
                        >
                          {sc.suspect_details?.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Link
                          to={`/court/trial/${sc.id}`}
                          state={{ caseId: sc.case_details?.id }}
                        >
                          <Button
                            size="sm"
                            className="gap-2 bg-primary hover:bg-primary/90"
                          >
                            <HugeiconsIcon icon={Legal01Icon} size={16} />
                            Review
                          </Button>
                        </Link>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Summary Cards */}
      {convictedCases.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold">{convictedCases.length}</div>
              <p className="text-xs text-muted-foreground">Total Cases</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold">
                {
                  convictedCases.filter(
                    (sc) => sc.case_details?.crime_details?.level === "4",
                  ).length
                }
              </div>
              <p className="text-xs text-muted-foreground">
                Critical Level Cases
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold">
                {new Set(convictedCases.map((sc) => sc.crime)).size}
              </div>
              <p className="text-xs text-muted-foreground">Unique Crimes</p>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};
