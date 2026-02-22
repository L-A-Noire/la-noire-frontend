import { useQuery } from "@tanstack/react-query";
import { getCaseTimeline } from "@/api/cases";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  ArrowLeft01Icon,
  CheckSquare,
  TimelineEventIcon,
  LockIcon,
  Document,
  Add01Icon,
} from "@hugeicons/core-free-icons";
import { format, isValid, parseISO } from "date-fns";

// Helper function to safely format dates
const safeFormatDate = (
  dateString: string | undefined,
  formatString: string,
  fallback: string = "N/A",
): string => {
  if (!dateString) return fallback;
  try {
    const date = parseISO(dateString);
    if (!isValid(date)) return fallback;
    return format(date, formatString);
  } catch {
    return fallback;
  }
};

export const CaseTimelinePage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const caseId = Number(id);

  const {
    data: caseDetails,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["case", caseId, "timeline"],
    queryFn: () => getCaseTimeline(caseId),
    enabled: !isNaN(caseId),
  });
  console.log(caseDetails);

  if (isLoading)
    return (
      <div className="p-8 text-center text-muted-foreground">
        <div className="inline-block animate-spin text-2xl">⏳</div>
        <p className="mt-2">Loading timeline...</p>
      </div>
    );

  if (isError)
    return (
      <div className="p-8 text-center text-destructive">
        Error loading timeline. Please try again.
      </div>
    );

  if (!caseDetails)
    return (
      <div className="p-8 text-center text-muted-foreground">
        Case not found.
      </div>
    );

  return (
    <div className="container mx-auto py-8 max-w-4xl space-y-6">
      <Button
        variant="ghost"
        className="pl-0 hover:bg-transparent hover:text-primary"
        onClick={() => navigate("/cases")}
      >
        <HugeiconsIcon icon={ArrowLeft01Icon} className="mr-2 h-4 w-4" />
        Back to Cases
      </Button>

      {/* Page Header */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Case #{caseId}
            </h1>
            <p className="text-muted-foreground mt-2">
              {caseDetails.crime_title || "Criminal Case Timeline"}
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={() => navigate(`/cases/${caseId}/evidence`)}
              className="gap-2"
            >
              <HugeiconsIcon icon={Document} className="h-4 w-4" />
              Evidence
            </Button>
            <Button
              onClick={() => navigate(`/cases/${caseId}/evidence/record`)}
              variant="outline"
              className="gap-2"
            >
              <HugeiconsIcon icon={Add01Icon} className="h-4 w-4" />
              Record
            </Button>
          </div>
        </div>
      </div>

      {/* Case Summary Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <HugeiconsIcon icon={TimelineEventIcon} className="h-5 w-5" />
            Case Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">
                Case Status
              </p>
              <div className="flex items-center gap-2">
                <Badge
                  variant={caseDetails.is_closed ? "destructive" : "outline"}
                  className={
                    !caseDetails.is_closed
                      ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                      : ""
                  }
                >
                  {caseDetails.is_closed ? "Closed" : "Open"}
                </Badge>
              </div>
            </div>

            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">
                Assigned Detective
              </p>
              <p className="font-semibold">
                {caseDetails.detective_name || "Unassigned"}
              </p>
            </div>

            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">
                Crime Scene
              </p>
              <Badge
                variant={
                  caseDetails.is_from_crime_scene ? "secondary" : "outline"
                }
              >
                {caseDetails.is_from_crime_scene ? "Yes" : "No"}
              </Badge>
            </div>

            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">
                Opened Date
              </p>
              <p className="font-semibold">
                {safeFormatDate(caseDetails.created_at, "MMM dd, yyyy")}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Timeline */}
      <Card>
        <CardHeader>
          <CardTitle>Investigation Timeline</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative border-l-2 border-muted space-y-0">
            {/* Case Created Event */}
            <div className="pb-8 pl-6 relative">
              <div className="absolute -left-[10px] top-0 w-5 h-5 bg-green-500 rounded-full ring-4 ring-background flex items-center justify-center">
                <HugeiconsIcon
                  icon={CheckSquare}
                  className="h-3 w-3 text-white"
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-lg">Case Opened</h3>
                  <Badge variant="outline">Initial</Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  {safeFormatDate(
                    caseDetails.created_at,
                    "EEEE, MMMM dd, yyyy 'at' h:mm a",
                  )}
                </p>
                <p className="text-sm text-muted-foreground">
                  The case was officially opened
                  {caseDetails.detective_name
                    ? ` and assigned to Detective ${caseDetails.detective_name}`
                    : ""}
                  .{" "}
                  {caseDetails.is_from_crime_scene
                    ? "Crime scene detection was active."
                    : ""}
                </p>
              </div>
            </div>

            {/* Case Status Updates */}
            {caseDetails.is_from_crime_scene && (
              <div className="pb-8 pl-6 relative">
                <div className="absolute -left-[10px] top-0 w-5 h-5 bg-blue-500 rounded-full ring-4 ring-background flex items-center justify-center">
                  <HugeiconsIcon icon={TimelineEventIcon} className="h-5 w-5" />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-lg">
                      Crime Scene Investigation
                    </h3>
                    <Badge variant="secondary">Active</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {safeFormatDate(
                      caseDetails.created_at,
                      "EEEE, MMMM dd, yyyy",
                    )}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Scenes and evidence are being collected and catalogued for
                    the investigation.
                  </p>
                </div>
              </div>
            )}

            {/* Case Closed Event */}
            {caseDetails.is_closed && (
              <div className="pb-8 pl-6 relative">
                <div className="absolute -left-[10px] top-0 w-5 h-5 bg-red-500 rounded-full ring-4 ring-background flex items-center justify-center">
                  <HugeiconsIcon
                    icon={LockIcon}
                    className="h-3 w-3 text-white"
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-lg">Case Closed</h3>
                    <Badge variant="destructive">Final</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    The investigation has been concluded and the case is
                    archived.
                  </p>
                </div>
              </div>
            )}

            {/* Current Status */}
            {!caseDetails.is_closed && (
              <div className="pb-8 pl-6 relative">
                <div className="absolute -left-[10px] top-0 w-5 h-5 bg-yellow-500 rounded-full ring-4 ring-background flex items-center justify-center">
                  <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                </div>
                <div className="space-y-2">
                  <h3 className="font-semibold text-lg">
                    Active Investigation
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    The case is currently under investigation. Continue
                    collecting evidence and following leads.
                  </p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={() => navigate("/cases")}>
          Back to List
        </Button>
        <Button asChild>
          <a href="/cases">View All Cases</a>
        </Button>
      </div>
    </div>
  );
};
