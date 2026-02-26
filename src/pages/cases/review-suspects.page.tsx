import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  ArrowLeft01Icon,
  CheckmarkCircle01Icon,
  UserIcon,
} from "@hugeicons/core-free-icons";
import { toast } from "react-toastify";
import { format } from "date-fns";
import {
  getSuspectsByCase,
  updateSuspectStatus,
  markAsWanted,
} from "@/api/suspect";

const STATUS_OPTIONS = [
  { value: "suspect", label: "Suspect", color: "bg-gray-100 text-gray-800" },
  { value: "wanted", label: "Wanted", color: "bg-orange-100 text-orange-800" },
  {
    value: "most_wanted",
    label: "Most Wanted",
    color: "bg-red-100 text-red-800",
  },
  { value: "arrested", label: "Arrested", color: "bg-blue-100 text-blue-800" },
  {
    value: "convicted",
    label: "Convicted",
    color: "bg-purple-100 text-purple-800",
  },
  {
    value: "innocent",
    label: "Innocent",
    color: "bg-green-100 text-green-800",
  },
];

export const ReviewSuspectsPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const caseId = parseInt(id!);

  const { data: suspects = [], isLoading } = useQuery({
    queryKey: ["suspects", "case", caseId],
    queryFn: () => getSuspectsByCase(caseId),
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({
      suspectId,
      status,
    }: {
      suspectId: number;
      status: string;
    }) => updateSuspectStatus(suspectId, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["suspects", "case", caseId] });
      toast.success("Suspect status updated");
    },
  });

  const markAsWantedMutation = useMutation({
    mutationFn: (suspectId: number) => markAsWanted(suspectId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["suspects", "case", caseId] });
      toast.success("Suspect marked as wanted");
    },
  });

  const getStatusBadge = (status: string) => {
    const option = STATUS_OPTIONS.find((opt) => opt.value === status);
    return (
      <Badge className={option?.color || "bg-gray-100"}>
        {option?.label || status}
      </Badge>
    );
  };

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
          Review and update suspect statuses
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
                        <h3 className="font-semibold">
                          {suspect.suspect_details?.first_name}{" "}
                          {suspect.suspect_details?.last_name}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          Added:{" "}
                          {format(new Date(suspect.added_at || ""), "PPP")}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusBadge(suspect.status)}
                    </div>
                  </div>

                  <div className="flex items-center gap-4 pt-2 border-t">
                    <Select
                      value={suspect.status}
                      onValueChange={(value) =>
                        updateStatusMutation.mutate({
                          suspectId: suspect.id,
                          status: value,
                        })
                      }
                    >
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Change status" />
                      </SelectTrigger>
                      <SelectContent>
                        {STATUS_OPTIONS.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    {suspect.status === "suspect" && (
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
