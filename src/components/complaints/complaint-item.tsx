import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { HugeiconsIcon } from "@hugeicons/react";
import { ChevronRight, AlertCircle } from "@hugeicons/core-free-icons";
import { format } from "date-fns";
import { ComplaintStatusBadge } from "./complaint-status-badge";
import type { ComplaintDetail } from "@/types/complaint.type";

interface ComplaintItemProps {
  complaint: ComplaintDetail;
  onAction?: (action: string, id: number) => void;
}

export const ComplaintItem = ({ complaint }: ComplaintItemProps) => {
  const isRejected =
    complaint.status === "rejected_by_cadet" ||
    complaint.status === "rejected_by_officer";

  const requiresAttention =
    complaint.status === "pending_cadet" ||
    complaint.status === "pending_officer";

  return (
    <Card
      className={`relative overflow-hidden transition-all hover:shadow-md ${isRejected ? "opacity-75" : ""
        }`}
    >
      {requiresAttention && (
        <div className="absolute top-4 right-4">
          <HugeiconsIcon
            icon={AlertCircle}
            className="h-5 w-5 text-amber-500 animate-pulse"
          />
        </div>
      )}

      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-4 mr-6">
          <div className="flex-1 min-w-0">
            <CardTitle className="text-base line-clamp-2">
              {complaint.description.substring(0, 20)}...
            </CardTitle>
            <p className="text-xs text-muted-foreground mt-1">
              #{complaint.id} • {format(new Date(complaint.created_at), "PPP")}
            </p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {/* Status */}
        <div className="justify-between space-y-2">
          <label className="text-xs font-semibold text-muted-foreground">
            Status:
          </label>
          <ComplaintStatusBadge status={complaint.status} />
        </div>

        {/* Complaint Info */}
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <p className="text-xs text-muted-foreground">Complainants</p>
            <p className="font-medium">{complaint.complainants.length}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Rejections</p>
            <p
              className={`font-medium ${complaint.rejection_count >= 3 ? "text-destructive" : ""}`}
            >
              {complaint.rejection_count}/3
            </p>
          </div>
        </div>

        {/* Rejection Reason if exists */}
        {isRejected && (
          <div className="bg-muted/50 p-2 rounded border-l-2 border-destructive">
            <p className="text-xs font-semibold text-muted-foreground mb-1">
              Reason
            </p>
            <p className="text-xs text-foreground line-clamp-2">
              {complaint.cadet_rejection_reason ||
                complaint.officer_rejection_reason ||
                "No reason provided"}
            </p>
          </div>
        )}

        {/* Actions */}
        <Button
          variant="ghost"
          size="sm"
          className="mt-3 justify-between"
          asChild
        >
          <Link to={`/complaints/${complaint.id}`}>
            <span>View Details</span>
            <HugeiconsIcon icon={ChevronRight} className="h-4 w-4" />
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
};
