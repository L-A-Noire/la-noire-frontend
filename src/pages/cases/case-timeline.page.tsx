import { useQuery } from "@tanstack/react-query";
import { getCaseTimeline } from "@/api/cases";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowLeft01Icon } from "@hugeicons/core-free-icons";
import { format } from "date-fns";

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

  if (isLoading)
    return (
      <div className="p-8 text-center text-muted-foreground">
        Loading timeline...
      </div>
    );
  if (isError)
    return (
      <div className="p-8 text-center text-destructive">
        Error loading timeline
      </div>
    );

  return (
    <div className="container mx-auto py-8 max-w-4xl space-y-6">
      <Button
        variant="ghost"
        className="pl-0 hover:bg-transparent hover:text-primary"
        onClick={() => navigate("/cases")}
      >
        <HugeiconsIcon icon={ArrowLeft01Icon} />
        Back to Cases
      </Button>

      <div className="flex flex-col gap-4">
        <h1 className="text-3xl font-bold tracking-tight">
          Case #{caseDetails?.id} Timeline
        </h1>
        <p className="text-muted-foreground">
          Chronological events for {caseDetails?.crime_title || "this case"}.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Case Details</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div>
            <span className="text-sm text-muted-foreground block">
              Created At
            </span>
            <span className="font-medium">
              {caseDetails?.created_at
                ? format(new Date(caseDetails.created_at), "PPP p")
                : "N/A"}
            </span>
          </div>
          <div>
            <span className="text-sm text-muted-foreground block">Status</span>
            <span className="font-medium capitalize">
              {caseDetails?.is_closed ? "Closed" : "Open"}
            </span>
          </div>
          {/* 
                        The API response for timeline was shown as just the Case object. 
                        If the API returns a list of events in a 'timeline' property or similar, 
                        we should map over it here. 
                        Since the documentation is ambiguous, I am displaying the case details. 
                     */}
        </CardContent>
      </Card>

      {/* Placeholder for actual timeline events if they were in the response */}
      <div className="relative border-l border-muted ml-4 space-y-8 pb-8">
        <div className="mb-0 ml-6">
          <span className="flex absolute -left-[5px] justify-center items-center w-2.5 h-2.5 bg-primary rounded-full ring-4 ring-background"></span>
          <h3 className="flex items-center mb-1 text-lg font-semibold text-foreground">
            Case Created
          </h3>
          <time className="block mb-2 text-sm font-normal leading-none text-muted-foreground">
            {caseDetails?.created_at
              ? format(new Date(caseDetails.created_at), "PPP")
              : ""}
          </time>
          <p className="mb-4 text-base font-normal text-muted-foreground">
            The case was officially opened
            {caseDetails?.detective_name
              ? ` and assigned to Detective ${caseDetails.detective_name}`
              : ""}
            .
          </p>
        </div>
        {caseDetails?.is_closed && (
          <div className="mb-0 ml-6">
            <span className="flex absolute -left-[5px] justify-center items-center w-2.5 h-2.5 bg-destructive rounded-full ring-4 ring-background"></span>
            <h3 className="flex items-center mb-1 text-lg font-semibold text-foreground">
              Case Closed
            </h3>
            <p className="mb-4 text-base font-normal text-muted-foreground">
              The investigation has been concluded.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
