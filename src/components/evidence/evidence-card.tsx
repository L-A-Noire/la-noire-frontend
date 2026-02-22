import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";
import { EvidenceBadge } from "./evidence-badge";
import type { EvidenceDetail } from "@/types/evidence.type";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  ChevronRight,
  User02Icon,
  DropletIcon,
  VanIcon,
  UserIcon,
  Package01Icon,
} from "@hugeicons/core-free-icons";

interface EvidenceCardProps {
  evidence: EvidenceDetail;
}

const iconMap = {
  witness_testimony: User02Icon,
  forensic: DropletIcon,
  vehicle: VanIcon,
  identification: UserIcon,
  other: Package01Icon,
};

export const EvidenceCard = ({ evidence }: EvidenceCardProps) => {
  const icon = iconMap[evidence.evidence_type];

  return (
    <Card className="relative overflow-hidden transition-all hover:shadow-md">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3 flex-1 min-w-0">
            <HugeiconsIcon
              icon={icon}
              className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-1"
            />
            <div className="flex-1 min-w-0">
              <CardTitle className="text-base line-clamp-2">
                {evidence.title}
              </CardTitle>
              <p className="text-xs text-muted-foreground mt-1">
                #{evidence.id} • {format(new Date(evidence.recorded_at), "PPP")}
              </p>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {/* Type Badge */}
        <EvidenceBadge type={evidence.evidence_type} />

        {/* Description */}
        <div>
          <p className="text-xs font-semibold text-muted-foreground mb-1">
            Description
          </p>
          <p className="text-sm text-foreground line-clamp-2">
            {evidence.description}
          </p>
        </div>

        {/* Type-specific info */}
        <div className="bg-muted/50 p-2 rounded border-l-2 border-muted-foreground/30">
          <EvidenceTypeInfo evidence={evidence} />
        </div>

        {/* View Details Link */}
        <Link
          to={`/cases/${evidence.case}/evidence/${evidence.id}`}
          className="flex items-center justify-between text-sm font-medium text-primary hover:underline mt-3"
        >
          <span>View Details</span>
          <HugeiconsIcon icon={ChevronRight} className="h-4 w-4" />
        </Link>
      </CardContent>
    </Card>
  );
};

// Type-specific info display
const EvidenceTypeInfo = ({ evidence }: { evidence: EvidenceDetail }) => {
  switch (evidence.evidence_type) {
    case "witness_testimony":
      return (
        <div className="text-xs space-y-1 text-foreground">
          {evidence.witness_name && (
            <p>
              <span className="font-semibold">Witness:</span>{" "}
              {evidence.witness_name}
            </p>
          )}
          {evidence.statement && (
            <p className="line-clamp-1">
              <span className="font-semibold">Statement:</span>{" "}
              {evidence.statement}
            </p>
          )}
        </div>
      );

    case "forensic":
      return (
        <div className="text-xs space-y-1 text-foreground">
          <p>
            <span className="font-semibold">Type:</span>{" "}
            {evidence.forensic_type?.replace("_", " ").toUpperCase()}
          </p>
          {evidence.test_status && (
            <p>
              <span className="font-semibold">Status:</span>{" "}
              <span
                className={`px-2 py-0.5 rounded text-xs font-medium ${
                  evidence.test_status === "completed"
                    ? "bg-green-100/50 text-green-700 dark:bg-green-900/30"
                    : evidence.test_status === "error"
                      ? "bg-red-100/50 text-red-700 dark:bg-red-900/30"
                      : "bg-yellow-100/50 text-yellow-700 dark:bg-yellow-900/30"
                }`}
              >
                {evidence.test_status}
              </span>
            </p>
          )}
        </div>
      );

    case "vehicle":
      return (
        <div className="text-xs space-y-1 text-foreground">
          {evidence.vehicle_model && (
            <p>
              <span className="font-semibold">Model:</span>{" "}
              {evidence.vehicle_model}
            </p>
          )}
          {evidence.plate_number && (
            <p>
              <span className="font-semibold">Plate:</span>{" "}
              {evidence.plate_number}
            </p>
          )}
          {evidence.serial_number && (
            <p>
              <span className="font-semibold">Serial:</span>{" "}
              {evidence.serial_number}
            </p>
          )}
        </div>
      );

    case "identification":
      return (
        <div className="text-xs space-y-1 text-foreground">
          {evidence.discovered_person_name && (
            <p>
              <span className="font-semibold">Person:</span>{" "}
              {evidence.discovered_person_name}
            </p>
          )}
        </div>
      );

    case "other":
      return (
        <div className="text-xs text-foreground/70">
          Custom evidence with additional properties
        </div>
      );

    default:
      return null;
  }
};
