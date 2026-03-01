import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { getCaseTimeline } from "@/api/cases";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  ArrowLeft01Icon,
  TimelineEventIcon,
  Document,
  Add01Icon,
  Location01Icon,
  File01Icon,
  UserIcon,
  CheckmarkCircle02Icon,
} from "@hugeicons/core-free-icons";
import { format, isValid, parseISO } from "date-fns";
import type { TimelineEvent } from "@/types/case.type";

const safeFormatDate = (
  dateString: string | undefined,
  formatString: string,
  fallback = "N/A",
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

const getEventDate = (event: TimelineEvent): string => {
  return "date" in event ? event.date : "";
};

const getEventIcon = (event: TimelineEvent) => {
  switch (event.type) {
    case "crime_scene":
      return Location01Icon;
    case "case_opened":
      return CheckmarkCircle02Icon;
    case "complaint":
      return File01Icon;
    case "report":
      return Document;
    default:
      return TimelineEventIcon;
  }
};

const getEventColor = (event: TimelineEvent): string => {
  switch (event.type) {
    case "crime_scene":
      return "bg-blue-500";
    case "case_opened":
      return "bg-green-500";
    case "complaint":
      return "bg-amber-500";
    case "report":
      return "bg-purple-500";
    default:
      return "bg-muted-foreground";
  }
};

const getEventTitle = (event: TimelineEvent): string => {
  switch (event.type) {
    case "crime_scene":
      return "Crime Scene";
    case "case_opened":
      return "Case Opened";
    case "complaint":
      return "Complaint";
    case "report":
      return "Report";
    default:
      return "Event";
  }
};

const TimelineEventCard = ({ event }: { event: TimelineEvent }) => {
  const Icon = getEventIcon(event);
  const color = getEventColor(event);
  const title = getEventTitle(event);

  return (
    <div className="pb-8 pl-6 relative last:pb-0">
      <div
        className={`absolute -left-[10px] top-0 w-5 h-5 rounded-full ring-4 ring-background flex items-center justify-center ${color}`}
      >
        <HugeiconsIcon icon={Icon} className="h-3 w-3 text-white" />
      </div>
      <div className="space-y-2">
        <div className="flex items-center gap-2 flex-wrap">
          <h3 className="font-semibold text-lg">{title}</h3>
          {event.type === "complaint" || event.type === "report" ? (
            <Badge variant="outline">{"status" in event && event.status}</Badge>
          ) : null}
          {event.type === "crime_scene" && (
            <Badge
              variant={event.is_confirmed ? "default" : "secondary"}
              className={
                event.is_confirmed
                  ? "bg-green-600"
                  : "bg-amber-100 text-amber-800"
              }
            >
              {event.is_confirmed ? "Confirmed" : "Pending"}
            </Badge>
          )}
        </div>
        <p className="text-sm text-muted-foreground">
          {safeFormatDate(
            getEventDate(event),
            "EEEE, MMMM dd, yyyy 'at' h:mm a",
          )}
        </p>
        {event.type === "crime_scene" && event.location && (
          <p className="text-sm flex items-center gap-1.5">
            <HugeiconsIcon icon={Location01Icon} className="h-4 w-4" />
            {event.location}
          </p>
        )}
        {event.type === "case_opened" && event.assigned_detective && (
          <p className="text-sm flex items-center gap-1.5">
            <HugeiconsIcon icon={UserIcon} className="h-4 w-4" />
            Assigned to {event.assigned_detective.name}
          </p>
        )}
        {(event.type === "complaint" || event.type === "report") &&
          event.description && (
            <p className="text-sm text-muted-foreground mt-1">
              {event.description}
            </p>
          )}
      </div>
    </div>
  );
};

export const CaseTimelinePage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const caseId = Number(id);

  const {
    data: timelineData,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["case", caseId, "timeline"],
    queryFn: () => getCaseTimeline(caseId),
    enabled: !isNaN(caseId),
  });

  const sortedTimeline = useMemo(() => {
    const timeline = timelineData?.timeline;
    if (!timeline) return [];
    return [...timeline].sort((a, b) => {
      const dateA = new Date(getEventDate(a)).getTime();
      const dateB = new Date(getEventDate(b)).getTime();
      return dateA - dateB;
    });
  }, [timelineData]);

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

  if (!timelineData)
    return (
      <div className="p-8 text-center text-muted-foreground">
        Case not found.
      </div>
    );

  const { case: caseInfo } = timelineData;

  return (
    <div className="container mx-auto py-8 max-w-4xl space-y-6">
      <Button
        variant="ghost"
        className="pl-0 hover:bg-transparent hover:text-primary"
        onClick={() => navigate(`/cases/${caseId}`)}
      >
        <HugeiconsIcon icon={ArrowLeft01Icon} className="mr-2 h-4 w-4" />
        Back to Case
      </Button>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Case #{caseId} Timeline
            </h1>
            <p className="text-muted-foreground mt-2">
              Investigation events in chronological order
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

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <HugeiconsIcon icon={TimelineEventIcon} className="h-5 w-5" />
            Case Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">
                Opened Date
              </p>
              <p className="font-semibold">
                {safeFormatDate(caseInfo.opened_date, "EEEE, MMMM dd, yyyy")}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">
                Assigned Detective
              </p>
              <p className="font-semibold">
                {caseInfo.assigned_detective?.name ?? "Unassigned"}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Investigation Timeline</CardTitle>
          <p className="text-sm text-muted-foreground">
            {sortedTimeline.length} event
            {sortedTimeline.length !== 1 ? "s" : ""}
          </p>
        </CardHeader>
        <CardContent className="md:mx-4">
          <div className="relative border-l-2 border-muted space-y-0">
            {sortedTimeline.length === 0 ? (
              <div className="py-8 pl-6 text-muted-foreground">
                No timeline events recorded yet.
              </div>
            ) : (
              sortedTimeline.map((event, index) => (
                <TimelineEventCard
                  key={`${event.type}-${index}`}
                  event={event}
                />
              ))
            )}
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={() => navigate("/cases")}>
          Back to List
        </Button>
        <Button onClick={() => navigate(`/cases/${caseId}`)}>
          View Case Details
        </Button>
      </div>
    </div>
  );
};
