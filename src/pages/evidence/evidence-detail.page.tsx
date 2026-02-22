import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery, useMutation } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  ArrowLeft01Icon,
  Delete02Icon,
  Edit02Icon,
} from "@hugeicons/core-free-icons";
import { getEvidenceById, deleteEvidence } from "@/api/evidence";
import { EvidenceBadge } from "@/components/evidence/evidence-badge";
import { format } from "date-fns";

export const EvidenceDetailPage = () => {
  const navigate = useNavigate();
  const { caseId, evidenceId } = useParams<{
    caseId: string;
    evidenceId: string;
  }>();
  const [isEditing, setIsEditing] = useState(false);

  const { data: evidence, isLoading: evidenceLoading } = useQuery({
    queryKey: ["evidence", evidenceId],
    queryFn: () => getEvidenceById(evidenceId ? parseInt(evidenceId) : 0),
    enabled: !!evidenceId,
  });

  const deleteMutation = useMutation({
    mutationFn: () => deleteEvidence(evidenceId ? parseInt(evidenceId) : 0),
    onSuccess: () => {
      toast.success("Evidence deleted successfully");
      navigate(`/cases/${caseId}`);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || "Failed to delete evidence");
    },
  });

  if (evidenceLoading) {
    return <div className="flex justify-center py-12">Loading evidence...</div>;
  }

  if (!evidence) {
    return (
      <div className="flex justify-center py-12">
        <p className="text-muted-foreground">Evidence not found</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">
            {evidence.title}
          </h1>
          <p className="text-sm text-muted-foreground">
            Case #{caseId} • Created{" "}
            {format(new Date(evidence.recorded_at), "PPP")}
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => navigate(`/cases/${caseId}`)}
            className="gap-2"
          >
            <HugeiconsIcon icon={ArrowLeft01Icon} className="h-4 w-4" />
            Back
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Type Badge */}
          <Card>
            <CardContent className="pt-6">
              <EvidenceBadge type={evidence.evidence_type} />
            </CardContent>
          </Card>

          {/* Description */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Description</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-foreground">{evidence.description}</p>
            </CardContent>
          </Card>

          {/* Type-Specific Details */}
          {evidence.evidence_type === "witness_testimony" && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Witness Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {evidence.witness_name && (
                  <div>
                    <Label className="text-xs font-semibold">
                      Witness Name
                    </Label>
                    <p className="mt-1">{evidence.witness_name}</p>
                  </div>
                )}
                {evidence.witness_contact && (
                  <div>
                    <Label className="text-xs font-semibold">Contact</Label>
                    <p className="mt-1">{evidence.witness_contact}</p>
                  </div>
                )}
                {evidence.statement && (
                  <div>
                    <Label className="text-xs font-semibold">Statement</Label>
                    <p className="mt-1 whitespace-pre-wrap">
                      {evidence.statement}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {evidence.evidence_type === "forensic" && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Forensic Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-xs font-semibold">
                      Forensic Type
                    </Label>
                    <p className="mt-1">{evidence.forensic_type}</p>
                  </div>
                  <div>
                    <Label className="text-xs font-semibold">Test Status</Label>
                    <div className="mt-1">
                      <span
                        className={`px-2 py-1 rounded text-xs font-medium ${
                          evidence.test_status === "completed"
                            ? "bg-green-100/50 text-green-700 dark:bg-green-900/30"
                            : evidence.test_status === "error"
                              ? "bg-red-100/50 text-red-700 dark:bg-red-900/30"
                              : "bg-yellow-100/50 text-yellow-700 dark:bg-yellow-900/30"
                        }`}
                      >
                        {evidence.test_status}
                      </span>
                    </div>
                  </div>
                </div>

                {evidence.collection_location && (
                  <div>
                    <Label className="text-xs font-semibold">
                      Collection Location
                    </Label>
                    <p className="mt-1">{evidence.collection_location}</p>
                  </div>
                )}

                {evidence.test_result && (
                  <div>
                    <Label className="text-xs font-semibold">Test Result</Label>
                    <p className="mt-1 whitespace-pre-wrap">
                      {evidence.test_result}
                    </p>
                  </div>
                )}

                {/* Update Forensic Results Form */}
                {evidence.test_status !== "completed" && (
                  <div className="border-t pt-4 mt-4 space-y-3">
                    <p className="text-xs font-semibold text-amber-600">
                      Update Test Results
                    </p>
                    <Select defaultValue={evidence.test_status}>
                      <option value="pending">Pending</option>
                      <option value="completed">Completed</option>
                      <option value="error">Error</option>
                    </Select>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {evidence.evidence_type === "vehicle" && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Vehicle Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  {evidence.vehicle_model && (
                    <div>
                      <Label className="text-xs font-semibold">Model</Label>
                      <p className="mt-1">{evidence.vehicle_model}</p>
                    </div>
                  )}
                  {evidence.vehicle_color && (
                    <div>
                      <Label className="text-xs font-semibold">Color</Label>
                      <p className="mt-1">{evidence.vehicle_color}</p>
                    </div>
                  )}
                </div>

                {evidence.plate_number && (
                  <div>
                    <Label className="text-xs font-semibold">
                      Plate Number
                    </Label>
                    <p className="mt-1 font-mono text-lg">
                      {evidence.plate_number}
                    </p>
                  </div>
                )}

                {evidence.serial_number && (
                  <div>
                    <Label className="text-xs font-semibold">
                      Serial Number
                    </Label>
                    <p className="mt-1 font-mono">{evidence.serial_number}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {evidence.evidence_type === "identification" && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">
                  Identification Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {evidence.discovered_person_name && (
                  <div>
                    <Label className="text-xs font-semibold">Person Name</Label>
                    <p className="mt-1">{evidence.discovered_person_name}</p>
                  </div>
                )}

                {evidence.person_details &&
                  Object.keys(evidence.person_details).length > 0 && (
                    <div>
                      <Label className="text-xs font-semibold">
                        Additional Details
                      </Label>
                      <div className="mt-2 space-y-1 text-sm">
                        {Object.entries(evidence.person_details).map(
                          ([key, value]) => (
                            <div
                              key={key}
                              className="flex justify-between border-b pb-1"
                            >
                              <span className="text-muted-foreground">
                                {key}:
                              </span>
                              <span>{String(value)}</span>
                            </div>
                          ),
                        )}
                      </div>
                    </div>
                  )}
              </CardContent>
            </Card>
          )}

          {evidence.evidence_type === "other" && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Additional Properties</CardTitle>
              </CardHeader>
              <CardContent>
                {evidence.custom_properties &&
                Object.keys(evidence.custom_properties).length > 0 ? (
                  <div className="space-y-2 text-sm">
                    {Object.entries(evidence.custom_properties).map(
                      ([key, value]) => (
                        <div
                          key={key}
                          className="flex justify-between border-b pb-2"
                        >
                          <span className="font-semibold">{key}:</span>
                          <span>{String(value)}</span>
                        </div>
                      ),
                    )}
                  </div>
                ) : (
                  <p className="text-muted-foreground">
                    No additional properties
                  </p>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Metadata */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Evidence Metadata</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <div>
                <p className="text-xs font-semibold text-muted-foreground">
                  Evidence ID
                </p>
                <p className="font-mono">#{evidence.id}</p>
              </div>

              <div>
                <p className="text-xs font-semibold text-muted-foreground">
                  Recorded At
                </p>
                <p>{format(new Date(evidence.recorded_at), "PPP p")}</p>
              </div>

              <div>
                <p className="text-xs font-semibold text-muted-foreground">
                  Created At
                </p>
                <p>{format(new Date(evidence.created_at), "PPP p")}</p>
              </div>

              <div>
                <p className="text-xs font-semibold text-muted-foreground">
                  Recorded By
                </p>
                <p>Officer #{evidence.recorded_by}</p>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button
                variant="outline"
                className="w-full justify-start gap-2"
                onClick={() => setIsEditing(!isEditing)}
              >
                <HugeiconsIcon icon={Edit02Icon} className="h-4 w-4" />
                Edit Evidence
              </Button>
              <Button
                variant="destructive"
                className="w-full justify-start gap-2"
                onClick={() => {
                  if (confirm("Delete this evidence?")) {
                    deleteMutation.mutate();
                  }
                }}
                disabled={deleteMutation.isPending}
              >
                <HugeiconsIcon icon={Delete02Icon} className="h-4 w-4" />
                Delete
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
