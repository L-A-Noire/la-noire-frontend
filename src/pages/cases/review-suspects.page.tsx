import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { AxiosError } from "axios";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  ArrowLeft01Icon,
  CheckmarkCircle01Icon,
  UserIcon,
} from "@hugeicons/core-free-icons";
import { toast } from "react-toastify";
import { format } from "date-fns";
import { getSuspectsByCaseDirect, markSuspectAsWanted } from "@/api/suspect";
import { getCaseById } from "@/api/cases";

const STATUS_OPTIONS: Record<string, { label: string; color: string }> = {
  suspected: { label: "Suspect", color: "bg-gray-100 text-gray-800" },
  wanted: { label: "Wanted", color: "bg-orange-100 text-orange-800" },
  most_wanted: { label: "Most Wanted", color: "bg-red-100 text-red-800" },
  arrested: { label: "Arrested", color: "bg-blue-100 text-blue-800" },
  convicted: { label: "Convicted", color: "bg-purple-100 text-purple-800" },
  innocent: { label: "Innocent", color: "bg-green-100 text-green-800" },
};

export const ReviewSuspectsPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const caseId = parseInt(id!);

  // First, get case details to verify it exists
  const { data: caseDetails, isLoading: isLoadingCase } = useQuery({
    queryKey: ["case", caseId],
    queryFn: () => getCaseById(caseId),
  });

  interface ErrorResponse {
    message?: string;
  }

  // Get suspects directly linked to this case
  const {
    data: suspects = [],
    isLoading: isLoadingSuspects,
    error,
  } = useQuery({
    queryKey: ["suspects", "case", caseId],
    queryFn: () => getSuspectsByCaseDirect(caseId),
    enabled: !!caseDetails, // Only run if we have case details
  });

  const markAsWantedMutation = useMutation({
    mutationFn: (suspectId: number) => markSuspectAsWanted(suspectId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["suspects", "case", caseId] });
      toast.success("Suspect marked as wanted");
    },
    onError: (error: AxiosError<ErrorResponse>) => {
      console.error("Error marking as wanted:", error);
      toast.error(error.response?.data?.message || "Failed to mark as wanted");
    },
  });

  const getStatusBadge = (status: string) => {
    const option = STATUS_OPTIONS[status] || {
      label: status,
      color: "bg-gray-100 text-gray-800",
    };
    return <Badge className={option.color}>{option.label}</Badge>;
  };

  const isLoading = isLoadingCase || isLoadingSuspects;

  if (isLoadingCase) {
    return (
      <div className="container mx-auto py-8 max-w-4xl">
        <div className="text-center py-12">Loading case details...</div>
      </div>
    );
  }

  if (!caseDetails) {
    return (
      <div className="container mx-auto py-8 max-w-4xl">
        <Card className="border-destructive">
          <CardContent className="pt-6 text-center">
            <h2 className="text-xl font-bold mb-2">Error</h2>
            <p className="text-muted-foreground mb-4">Case not found</p>
            <Button onClick={() => navigate("/cases")}>Back to Cases</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

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

      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Review Suspects - Case #{caseId}
        </h1>
        <p className="text-muted-foreground mt-1">
          Review suspects and mark them as wanted
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          Crime ID: {caseDetails.crime}
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Suspects in this Case</CardTitle>
          <CardDescription>
            {suspects.length} suspect(s) to review
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">Loading suspects...</div>
          ) : error ? (
            <div className="text-center py-8 text-destructive">
              Error loading suspects: {error.message}
            </div>
          ) : suspects.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No suspects to review
            </div>
          ) : (
            <div className="space-y-6">
              {suspects.map((suspect) => (
                <div
                  key={suspect.id}
                  className="p-4 border rounded-lg space-y-4"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <HugeiconsIcon
                        icon={UserIcon}
                        className="h-5 w-5 text-muted-foreground mt-1"
                      />
                      <div>
                        <h3 className="font-semibold">{suspect.name}</h3>
                        {suspect.nickname && (
                          <p className="text-xs text-muted-foreground">
                            AKA: {suspect.nickname}
                          </p>
                        )}
                        {suspect.national_id && (
                          <p className="text-xs text-muted-foreground">
                            ID: {suspect.national_id}
                          </p>
                        )}
                        <p className="text-xs text-muted-foreground mt-1">
                          Created: {format(new Date(suspect.created_at), "PPP")}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusBadge(suspect.status)}
                    </div>
                  </div>

                  <div className="flex items-center gap-4 pt-2 border-t">
                    {suspect.status === "suspected" ? (
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-orange-600 border-orange-200 hover:bg-orange-50"
                        onClick={() => markAsWantedMutation.mutate(suspect.id)}
                        disabled={markAsWantedMutation.isPending}
                      >
                        <HugeiconsIcon
                          icon={CheckmarkCircle01Icon}
                          className="mr-2 h-4 w-4"
                        />
                        Mark as Wanted
                      </Button>
                    ) : (
                      <p className="text-sm text-muted-foreground">
                        Status:{" "}
                        {STATUS_OPTIONS[suspect.status]?.label ||
                          suspect.status}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
