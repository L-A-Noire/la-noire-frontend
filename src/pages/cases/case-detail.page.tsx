import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getCaseById, assignDetective, closeCase } from "@/api/cases";
import { Link, useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { InterrogationList } from "@/components/cases/interrogations/interrogation-list";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "react-toastify";
import { useState } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  ArrowLeft01Icon,
  Document,
  SecurityLockIcon,
} from "@hugeicons/core-free-icons";
import { format } from "date-fns";

export const CaseDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const caseId = Number(id);

  const [isAssigningDetective, setIsAssigningDetective] = useState(false);
  const [detectiveId, setDetectiveId] = useState("");

  const {
    data: caseDetail,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["case", caseId],
    queryFn: () => getCaseById(caseId),
    enabled: !isNaN(caseId),
  });

  const assignDetectiveMutation = useMutation({
    mutationFn: (detective: number) => assignDetective(caseId, { detective }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["case", caseId] });
      queryClient.invalidateQueries({ queryKey: ["cases"] });
      setIsAssigningDetective(false);
      setDetectiveId("");
      toast.success("Detective assigned successfully");
    },
    onError: () => {
      toast.error("Failed to assign detective");
    },
  });

  const closeCaseMutation = useMutation({
    mutationFn: () => closeCase(caseId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["case", caseId] });
      queryClient.invalidateQueries({ queryKey: ["cases"] });
      toast.success("Case closed successfully");
    },
    onError: () => {
      toast.error("Failed to close case");
    },
  });

  if (isLoading)
    return (
      <div className="p-8 text-center text-muted-foreground">
        <div className="inline-block animate-spin text-2xl">⏳</div>
        <p className="mt-2">Loading case details...</p>
      </div>
    );

  if (isError)
    return (
      <div className="p-8 text-center text-destructive">
        Error loading case details. Please try again.
      </div>
    );

  if (!caseDetail)
    return (
      <div className="p-8 text-center text-muted-foreground">
        Case not found.
      </div>
    );

  const isOpen = !caseDetail.is_closed;

  return (
    <div className="container mx-auto py-8 max-w-4xl space-y-6">
      {/* Back Button */}
      <Button
        variant="ghost"
        className="pl-0 hover:bg-transparent hover:text-primary"
        onClick={() => navigate("/cases")}
      >
        <HugeiconsIcon icon={ArrowLeft01Icon} className="mr-2 h-4 w-4" />
        Back to Cases
      </Button>

      {/* Header Card */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-3xl mb-2">
                {caseDetail.crime_details?.title || `Case #${caseDetail.id}`}
              </CardTitle>
              <p className="text-muted-foreground">
                Created: {format(new Date(caseDetail.created_at), "PPP p")}
              </p>
            </div>
            <Badge
              className={
                isOpen
                  ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                  : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
              }
              variant={isOpen ? "outline" : "destructive"}
            >
              {isOpen ? "Open" : "Closed"}
            </Badge>
          </div>
        </CardHeader>
      </Card>

      {/* Case Information */}
      <Card>
        <CardHeader>
          <CardTitle>Case Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-muted-foreground">Crime Type</Label>
              <p className="font-medium">
                {caseDetail.crime_details?.title ||
                  `Crime ID: ${caseDetail.crime}`}
              </p>
            </div>
            <div>
              <Label className="text-muted-foreground">From Crime Scene</Label>
              <Badge
                variant={
                  caseDetail.is_from_crime_scene ? "secondary" : "outline"
                }
              >
                {caseDetail.is_from_crime_scene ? "Yes" : "No"}
              </Badge>
            </div>
            <div>
              <Label className="text-muted-foreground">
                Assigned Detective
              </Label>
              <p className="font-medium">
                {caseDetail.detective_details?.name ||
                  `Detective ID: ${caseDetail.detective}`}
              </p>
            </div>
            <div>
              <Label className="text-muted-foreground">Status</Label>
              <p className="font-medium">{isOpen ? "Active" : "Closed"}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Interrogations Section */}
      <InterrogationList caseId={caseId} />

      {/* Detective Assignment */}
      <Card>
        <CardHeader>
          <CardTitle>Assign Detective</CardTitle>
        </CardHeader>
        <CardContent>
          {!isAssigningDetective ? (
            <Button
              onClick={() => setIsAssigningDetective(true)}
              variant="outline"
            >
              Change Detective
            </Button>
          ) : (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="detective-id">Detective ID</Label>
                <Input
                  id="detective-id"
                  type="number"
                  placeholder="Enter detective ID"
                  value={detectiveId}
                  onChange={(e) => setDetectiveId(e.target.value)}
                />
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={() => {
                    if (detectiveId.trim()) {
                      assignDetectiveMutation.mutate(Number(detectiveId));
                    } else {
                      toast.error("Please enter a valid detective ID");
                    }
                  }}
                  disabled={
                    assignDetectiveMutation.isPending || !detectiveId.trim()
                  }
                >
                  {assignDetectiveMutation.isPending
                    ? "Assigning..."
                    : "Assign"}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsAssigningDetective(false);
                    setDetectiveId("");
                  }}
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex gap-2 justify-end">
        <Button variant="outline" asChild className="gap-2">
          <Link to={`/cases/${caseId}/timeline`}>
            <HugeiconsIcon icon={Document} className="h-4 w-4" />
            View Timeline
          </Link>
        </Button>

        {isOpen && (
          <Button
            variant="destructive"
            onClick={() => {
              if (confirm("Are you sure you want to close this case?")) {
                closeCaseMutation.mutate();
              }
            }}
            disabled={closeCaseMutation.isPending}
            className="gap-2"
          >
            <HugeiconsIcon icon={SecurityLockIcon} className="h-4 w-4" />
            {closeCaseMutation.isPending ? "Closing..." : "Close Case"}
          </Button>
        )}
      </div>
    </div>
  );
};
