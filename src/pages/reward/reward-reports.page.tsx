import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "@/stores/auth.store";
import { useState, useMemo } from "react";
import {
  getReports,
  getReportById,
  reviewReportAsOfficer,
  reviewReportAsDetective,
} from "@/api/reward-reports";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  CheckmarkCircle01Icon,
  Cancel01Icon,
  FileEditIcon,
  UserIcon,
} from "@hugeicons/core-free-icons";
import { format } from "date-fns";
import { toast } from "react-toastify";
import type {
  Report,
  ReportDetail,
  ReportStatus,
} from "@/types/reward-report.type";

const OFFICER_ROLES = [
  "Police/Patrol Officer",
  "Sergent",
  "Captain",
  "Chief",
  "Administrator",
];
const DETECTIVE_ROLES = [
  "Detective",
  "Sergent",
  "Captain",
  "Chief",
  "Administrator",
];

const STATUS_LABELS: Record<ReportStatus, string> = {
  pending_officer: "Pending Officer",
  rejected_by_officer: "Rejected (Officer)",
  pending_detective: "Pending Detective",
  rejected_by_detective: "Rejected (Detective)",
  approved: "Approved",
};

const STATUS_VARIANTS: Record<
  ReportStatus,
  "default" | "secondary" | "destructive" | "outline"
> = {
  pending_officer: "default",
  rejected_by_officer: "destructive",
  pending_detective: "secondary",
  rejected_by_detective: "destructive",
  approved: "outline",
};

export default function RewardReportsPage() {
  const { session } = useAuthStore();
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState<ReportStatus | "all">("all");
  const [selectedReportId, setSelectedReportId] = useState<number | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");

  const isOfficer = session && OFFICER_ROLES.includes(session.user.role_title);
  const isDetective =
    session && DETECTIVE_ROLES.includes(session.user.role_title);

  const { data: reports = [], isLoading } = useQuery({
    queryKey: ["reward-reports"],
    queryFn: getReports,
    enabled: !!(isOfficer || isDetective),
  });

  const { data: selectedReport, isLoading: isLoadingDetail } = useQuery({
    queryKey: ["reward-report", selectedReportId],
    queryFn: () => getReportById(selectedReportId!),
    enabled: !!selectedReportId,
  });

  const reviewOfficerMutation = useMutation({
    mutationFn: ({
      id,
      isApproved,
      rejectionReason,
    }: {
      id: number;
      isApproved: boolean;
      rejectionReason?: string;
    }) =>
      reviewReportAsOfficer(id, {
        is_approved: isApproved,
        rejection_reason: rejectionReason,
      }),
    onSuccess: (_, { isApproved }) => {
      toast.success(isApproved ? "Report approved" : "Report rejected");
      setSelectedReportId(null);
      setRejectionReason("");
      queryClient.invalidateQueries({ queryKey: ["reward-reports"] });
    },
    onError: () => toast.error("Failed to review report"),
  });

  const reviewDetectiveMutation = useMutation({
    mutationFn: ({
      id,
      isApproved,
      rejectionReason,
    }: {
      id: number;
      isApproved: boolean;
      rejectionReason?: string;
    }) =>
      reviewReportAsDetective(id, {
        is_approved: isApproved,
        rejection_reason: rejectionReason,
      }),
    onSuccess: (_, { isApproved }) => {
      toast.success(
        isApproved ? "Report approved — reward issued" : "Report rejected",
      );
      setSelectedReportId(null);
      setRejectionReason("");
      queryClient.invalidateQueries({ queryKey: ["reward-reports"] });
    },
    onError: () => toast.error("Failed to review report"),
  });

  const filteredReports = useMemo(() => {
    if (statusFilter === "all") return reports;
    return reports.filter((r: Report) => r.status === statusFilter);
  }, [reports, statusFilter]);

  const canReviewAsOfficer = (report: Report) =>
    isOfficer && report.status === "pending_officer";
  const canReviewAsDetective = (report: Report) =>
    isDetective && report.status === "pending_detective";

  const handleApprove = (report: Report) => {
    if (canReviewAsOfficer(report)) {
      reviewOfficerMutation.mutate({ id: report.id, isApproved: true });
    } else if (canReviewAsDetective(report)) {
      reviewDetectiveMutation.mutate({ id: report.id, isApproved: true });
    }
  };

  const handleReject = (report: Report) => {
    if (canReviewAsOfficer(report)) {
      reviewOfficerMutation.mutate({
        id: report.id,
        isApproved: false,
        rejectionReason: rejectionReason || undefined,
      });
    } else if (canReviewAsDetective(report)) {
      reviewDetectiveMutation.mutate({
        id: report.id,
        isApproved: false,
        rejectionReason: rejectionReason || undefined,
      });
    }
  };

  if (!isOfficer && !isDetective) {
    return (
      <div className="container mx-auto py-8">
        <Card className="border-destructive/50">
          <CardHeader>
            <CardTitle className="text-destructive">Access Denied</CardTitle>
            <CardDescription>
              You do not have permission to review reward reports.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Reward Reports</h1>
        <p className="text-muted-foreground mt-1">
          Review citizen tips on wanted suspects. Officer approval first, then
          Detective. Approved reports receive a reward coupon.
        </p>
      </div>

      <div className="flex flex-wrap gap-4 items-center">
        <div className="space-y-2">
          <Label>Status</Label>
          <Select
            value={statusFilter}
            onValueChange={(v) => setStatusFilter(v as ReportStatus | "all")}
          >
            <SelectTrigger className="w-[200px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="pending_officer">Pending Officer</SelectItem>
              <SelectItem value="pending_detective">
                Pending Detective
              </SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="rejected_by_officer">
                Rejected (Officer)
              </SelectItem>
              <SelectItem value="rejected_by_detective">
                Rejected (Detective)
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {isLoading ? (
        <div className="grid gap-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-32 w-full rounded-lg" />
          ))}
        </div>
      ) : filteredReports.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            <HugeiconsIcon
              icon={FileEditIcon}
              className="mx-auto h-12 w-12 mb-4 opacity-50"
            />
            <p>No reward reports found.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {filteredReports.map((report) => (
            <ReportCard
              key={report.id}
              report={report}
              onSelect={() => setSelectedReportId(report.id)}
              canReview={
                !!(canReviewAsOfficer(report) || canReviewAsDetective(report))
              }
            />
          ))}
        </div>
      )}

      <ReportReviewDialog
        open={!!selectedReportId}
        onOpenChange={(open) => !open && setSelectedReportId(null)}
        report={selectedReport}
        isLoading={isLoadingDetail}
        rejectionReason={rejectionReason}
        onRejectionReasonChange={setRejectionReason}
        onApprove={
          selectedReport ? () => handleApprove(selectedReport) : undefined
        }
        onReject={
          selectedReport ? () => handleReject(selectedReport) : undefined
        }
        canReview={
          selectedReport
            ? !!(
                canReviewAsOfficer(selectedReport) ||
                canReviewAsDetective(selectedReport)
              )
            : false
        }
        isPending={
          reviewOfficerMutation.isPending || reviewDetectiveMutation.isPending
        }
      />
    </div>
  );
}

function ReportCard({
  report,
  onSelect,
  canReview,
}: {
  report: Report;
  onSelect: () => void;
  canReview: boolean;
}) {
  return (
    <Card
      className="cursor-pointer hover:border-primary/50 transition-colors"
      onClick={onSelect}
    >
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start gap-4">
          <div className="flex-1 min-w-0">
            <CardTitle className="text-base truncate">
              Report #{report.id}
            </CardTitle>
            <CardDescription className="line-clamp-2 mt-1">
              {report.description}
            </CardDescription>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Badge variant={STATUS_VARIANTS[report.status]}>
              {STATUS_LABELS[report.status]}
            </Badge>
            {canReview && (
              <Badge variant="outline" className="animate-pulse">
                Review
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0 text-xs text-muted-foreground">
        {format(new Date(report.created_at), "PPp")}
      </CardContent>
    </Card>
  );
}

function ReportReviewDialog({
  open,
  onOpenChange,
  report,
  isLoading,
  rejectionReason,
  onRejectionReasonChange,
  onApprove,
  onReject,
  canReview,
  isPending,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  report: ReportDetail | undefined;
  isLoading: boolean;
  rejectionReason: string;
  onRejectionReasonChange: (v: string) => void;
  onApprove?: () => void;
  onReject?: () => void;
  canReview: boolean;
  isPending: boolean;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[560px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Report Details</DialogTitle>
          <DialogDescription>
            Review this citizen tip. Approve to advance or reject with a reason.
          </DialogDescription>
        </DialogHeader>

        {isLoading || !report ? (
          <div className="space-y-4">
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-32 w-full" />
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Badge variant={STATUS_VARIANTS[report.status]}>
                {report.status_display}
              </Badge>
              <span className="text-xs text-muted-foreground">
                {format(new Date(report.created_at), "PPp")}
              </span>
            </div>

            <div>
              <Label className="text-xs text-muted-foreground">Reporter</Label>
              <div className="flex items-center gap-2 mt-1">
                <HugeiconsIcon icon={UserIcon} className="h-4 w-4" />
                <span>
                  {report.reporter_details?.first_name}{" "}
                  {report.reporter_details?.last_name} (
                  {report.reporter_details?.username})
                </span>
              </div>
            </div>

            <Separator />

            <div>
              <Label className="text-xs text-muted-foreground">
                Tip Description
              </Label>
              <p className="mt-1 p-3 rounded-lg bg-muted/50 text-sm">
                {report.description}
              </p>
            </div>

            {report.suspect_details && (
              <div>
                <Label className="text-xs text-muted-foreground">
                  Linked Suspect
                </Label>
                <p className="mt-1 text-sm">
                  {report.suspect_details.suspect_details?.first_name}{" "}
                  {report.suspect_details.suspect_details?.last_name || "N/A"} —{" "}
                  {report.suspect_details.crime_details?.title || "N/A"}
                </p>
              </div>
            )}

            {canReview && (
              <>
                <Separator />
                <div className="space-y-2">
                  <Label htmlFor="rejection-reason">
                    Rejection Reason (optional, for reject)
                  </Label>
                  <Textarea
                    id="rejection-reason"
                    placeholder="Explain why this report is rejected..."
                    value={rejectionReason}
                    onChange={(e) => onRejectionReasonChange(e.target.value)}
                    className="min-h-[80px]"
                    disabled={isPending}
                  />
                </div>
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => onReject?.()}
                    disabled={isPending}
                  >
                    <HugeiconsIcon
                      icon={Cancel01Icon}
                      className="mr-2 h-4 w-4"
                    />
                    Reject
                  </Button>
                  <Button onClick={() => onApprove?.()} disabled={isPending}>
                    <HugeiconsIcon
                      icon={CheckmarkCircle01Icon}
                      className="mr-2 h-4 w-4"
                    />
                    {isPending ? "Processing..." : "Approve"}
                  </Button>
                </DialogFooter>
              </>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
