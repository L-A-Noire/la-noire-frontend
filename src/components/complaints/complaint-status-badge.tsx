import { Badge } from "@/components/ui/badge";
import type { ComplaintStatus } from "@/types/complaint.type";

interface ComplaintStatusBadgeProps {
  status: ComplaintStatus;
  count?: number;
}

const statusConfig: Record<
  ComplaintStatus,
  {
    label: string;
    variant: "default" | "secondary" | "destructive" | "outline";
    color: string;
  }
> = {
  pending_cadet: {
    label: "Pending Cadet Review",
    variant: "outline",
    color: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
  },
  rejected_by_cadet: {
    label: "Rejected by Cadet",
    variant: "destructive",
    color:
      "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
  },
  pending_officer: {
    label: "Pending Officer Review",
    variant: "outline",
    color:
      "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400",
  },
  rejected_by_officer: {
    label: "Rejected by Officer",
    variant: "destructive",
    color:
      "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400",
  },
  approved: {
    label: "Approved",
    variant: "default",
    color:
      "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  },
  invalid: {
    label: "Invalid",
    variant: "destructive",
    color: "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400",
  },
};

export const ComplaintStatusBadge = ({
  status,
  count,
}: ComplaintStatusBadgeProps) => {
  const config = statusConfig[status] || {
    label: String(status || "Unknown"),
    variant: "secondary" as const,
    color: "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400",
  };

  return (
    <Badge variant={config.variant} className={config.color}>
      {config.label}
      {count !== undefined && <span className="ml-1">({count})</span>}
    </Badge>
  );
};
