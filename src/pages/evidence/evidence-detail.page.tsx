import { useNavigate, useParams } from "react-router-dom";
import { useQuery, useMutation } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  ArrowLeft01Icon,
  Delete02Icon,
  User02Icon,
  DropletIcon,
  VanIcon,
  UserIcon,
  Package01Icon,
} from "@hugeicons/core-free-icons";
import {
  getTestimony,
  getBiologicalEvidence,
  getVehicleEvidence,
  getIdentificationEvidence,
  getOtherEvidence,
  deleteTestimony,
  deleteBiologicalEvidence,
  deleteVehicleEvidence,
  deleteIdentificationEvidence,
  deleteOtherEvidence,
} from "@/api/evidence";
import { format } from "date-fns";

type EvidenceType =
  | "testimony"
  | "biological"
  | "vehicle"
  | "identification"
  | "other";

export const EvidenceDetailPage = () => {
  const navigate = useNavigate();
  const { caseId, evidenceType, evidenceId } = useParams<{
    caseId: string;
    evidenceType: string;
    evidenceId: string;
  }>();

  const type = evidenceType as EvidenceType;
  const id = evidenceId ? parseInt(evidenceId) : 0;

  // Fetch evidence based on type
  const { data: testimony } = useQuery({
    queryKey: ["testimony", id],
    queryFn: () => getTestimony(id),
    enabled: type === "testimony" && id > 0,
  });

  const { data: biological } = useQuery({
    queryKey: ["biologicalEvidence", id],
    queryFn: () => getBiologicalEvidence(id),
    enabled: type === "biological" && id > 0,
  });

  const { data: vehicle } = useQuery({
    queryKey: ["vehicleEvidence", id],
    queryFn: () => getVehicleEvidence(id),
    enabled: type === "vehicle" && id > 0,
  });

  const { data: identification } = useQuery({
    queryKey: ["identificationEvidence", id],
    queryFn: () => getIdentificationEvidence(id),
    enabled: type === "identification" && id > 0,
  });

  const { data: other } = useQuery({
    queryKey: ["otherEvidence", id],
    queryFn: () => getOtherEvidence(id),
    enabled: type === "other" && id > 0,
  });

  const evidence =
    testimony || biological || vehicle || identification || other;

  const deleteMutation = useMutation({
    mutationFn: async () => {
      switch (type) {
        case "testimony":
          return deleteTestimony(id);
        case "biological":
          return deleteBiologicalEvidence(id);
        case "vehicle":
          return deleteVehicleEvidence(id);
        case "identification":
          return deleteIdentificationEvidence(id);
        case "other":
          return deleteOtherEvidence(id);
        default:
          throw new Error("Unknown evidence type");
      }
    },
    onSuccess: () => {
      toast.success("Evidence deleted successfully");
      navigate(`/cases/${caseId}`);
    },
    onError: () => {
      toast.error("Failed to delete evidence");
    },
  });

  const getTypeIcon = () => {
    switch (type) {
      case "testimony":
        return User02Icon;
      case "biological":
        return DropletIcon;
      case "vehicle":
        return VanIcon;
      case "identification":
        return UserIcon;
      case "other":
        return Package01Icon;
      default:
        return Package01Icon;
    }
  };

  const getTypeColor = () => {
    switch (type) {
      case "testimony":
        return "bg-sky-100 text-sky-800 dark:bg-sky-900/30 dark:text-sky-400";
      case "biological":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400";
      case "vehicle":
        return "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400";
      case "identification":
        return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400";
      case "other":
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400";
    }
  };

  const getTypeLabel = () => {
    switch (type) {
      case "testimony":
        return "Witness Testimony";
      case "biological":
        return "Biological Evidence";
      case "vehicle":
        return "Vehicle";
      case "identification":
        return "Identification";
      case "other":
        return "Other";
      default:
        return type;
    }
  };

  if (!evidence) {
    return (
      <div className="space-y-6">
        <Button
          variant="ghost"
          onClick={() => navigate(`/cases/${caseId}`)}
          className="gap-2"
        >
          <HugeiconsIcon icon={ArrowLeft01Icon} className="h-4 w-4" />
          Back
        </Button>
        <Card>
          <CardContent className="pt-6 text-center">
            <p className="text-muted-foreground">Evidence not found</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          onClick={() => navigate(`/cases/${caseId}`)}
          className="gap-2 -ml-3"
        >
          <HugeiconsIcon icon={ArrowLeft01Icon} className="h-5 w-5" />
          Back
        </Button>
        <Button
          variant="destructive"
          onClick={() => deleteMutation.mutate()}
          disabled={deleteMutation.isPending}
          className="gap-2"
        >
          <HugeiconsIcon icon={Delete02Icon} className="h-4 w-4" />
          Delete
        </Button>
      </div>

      <div className="space-y-1">
        <h1 className="text-3xl font-bold tracking-tight">{evidence.title}</h1>
        <p className="text-sm text-muted-foreground">
          Case #{caseId} • Created:{" "}
          {format(new Date(evidence.created_at), "MMM dd, yyyy HH:mm")}
        </p>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Type Badge */}
          <Card>
            <CardContent className="pt-6">
              <Badge className={getTypeColor()}>
                <HugeiconsIcon
                  icon={getTypeIcon()}
                  className="h-3.5 w-3.5 ml-1"
                />
                {getTypeLabel()}
              </Badge>
            </CardContent>
          </Card>

          {/* Description */}
          <Card>
            <CardHeader>
              <CardTitle>Description</CardTitle>
            </CardHeader>
            <CardContent className="whitespace-pre-wrap text-sm">
              {evidence.description}
            </CardContent>
          </Card>

          {/* Type-Specific Details */}
          {type === "testimony" && testimony && (
            <Card>
              <CardHeader>
                <CardTitle>Testimony Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-xs font-semibold text-muted-foreground mb-1">
                    Transcription
                  </p>
                  <p className="text-sm whitespace-pre-wrap">
                    {testimony.transcription}
                  </p>
                </div>
                {testimony.attachments.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground mb-2">
                      Attachments ({testimony.attachments.length})
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {testimony.attachments.map((_, idx) => (
                        <Badge key={idx} variant="outline">
                          Attachment {idx + 1}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {type === "biological" && biological && (
            <Card>
              <CardHeader>
                <CardTitle>Biological Evidence Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {biological.images.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground mb-2">
                      Images ({biological.images.length})
                    </p>
                    <div className="grid grid-cols-3 gap-2">
                      {biological.images.map((_, idx) => (
                        <div
                          key={idx}
                          className="aspect-square bg-gray-100 rounded flex items-center justify-center"
                        >
                          <span className="text-xs text-gray-500">
                            Image {idx + 1}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {biological.result && (
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground mb-1">
                      Analysis Result
                    </p>
                    <p className="text-sm">{biological.result}</p>
                  </div>
                )}
                {biological.coronary !== null &&
                  biological.coronary !== undefined && (
                    <div>
                      <p className="text-xs font-semibold text-muted-foreground mb-1">
                        Coronary Value
                      </p>
                      <p className="text-sm">{biological.coronary}</p>
                    </div>
                  )}
              </CardContent>
            </Card>
          )}

          {type === "vehicle" && vehicle && (
            <Card>
              <CardHeader>
                <CardTitle>Vehicle Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground mb-1">
                      Model
                    </p>
                    <p className="text-sm">{vehicle.vehicle_model}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground mb-1">
                      Color
                    </p>
                    <p className="text-sm">{vehicle.color}</p>
                  </div>
                </div>
                {vehicle.registration_plate_number && (
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground mb-1">
                      Registration Plate
                    </p>
                    <p className="text-sm font-mono">
                      {vehicle.registration_plate_number}
                    </p>
                  </div>
                )}
                {vehicle.serial_number && (
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground mb-1">
                      Serial Number (VIN)
                    </p>
                    <p className="text-sm font-mono">{vehicle.serial_number}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {type === "identification" && identification && (
            <Card>
              <CardHeader>
                <CardTitle>Identification Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground mb-1">
                      First Name
                    </p>
                    <p className="text-sm">{identification.owner_first_name}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground mb-1">
                      Last Name
                    </p>
                    <p className="text-sm">{identification.owner_last_name}</p>
                  </div>
                </div>
                {identification.information &&
                  Object.keys(identification.information).length > 0 && (
                    <div>
                      <p className="text-xs font-semibold text-muted-foreground mb-2">
                        Additional Information
                      </p>
                      <div className="space-y-2">
                        {Object.entries(identification.information).map(
                          ([key, value]) => (
                            <div
                              key={key}
                              className="flex justify-between text-sm"
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
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-xs font-semibold text-muted-foreground mb-1">
                  ID
                </p>
                <p className="text-sm font-mono">#{evidence.id}</p>
              </div>
              <Separator />
              <div>
                <p className="text-xs font-semibold text-muted-foreground mb-1">
                  Type
                </p>
                <p className="text-sm">{getTypeLabel()}</p>
              </div>
              <Separator />
              <div>
                <p className="text-xs font-semibold text-muted-foreground mb-1">
                  Date Created
                </p>
                <p className="text-sm">
                  {format(new Date(evidence.created_at), "MMM dd, yyyy")}
                </p>
              </div>
              <Separator />
              <div>
                <p className="text-xs font-semibold text-muted-foreground mb-1">
                  Time Created
                </p>
                <p className="text-sm">
                  {format(new Date(evidence.created_at), "HH:mm:ss")}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
