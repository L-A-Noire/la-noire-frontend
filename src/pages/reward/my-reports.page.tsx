import { Navigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useAuthStore } from "@/stores/auth.store";
import { getReports } from "@/api/reward-reports";
import { getRewardById } from "@/api/rewards";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  FileEditIcon,
  CheckmarkCircle01Icon,
  Cancel01Icon,
  GiftIcon,
} from "@hugeicons/core-free-icons";
import { format } from "date-fns";
import { useState } from "react";
import { ClaimRewardDialog } from "@/components/rewards/claim-reward-dialog";
import type { Report, ReportStatus } from "@/types/reward-report.type";

const STATUS_LABELS: Record<ReportStatus, string> = {
  pending_officer: "Pending Officer Review",
  rejected_by_officer: "Rejected by Officer",
  pending_detective: "Pending Detective Review",
  rejected_by_detective: "Rejected by Detective",
  approved: "Approved",
};

const STATUS_ICONS: Record<ReportStatus, typeof FileEditIcon> = {
  pending_officer: FileEditIcon,
  pending_detective: FileEditIcon,
  rejected_by_officer: Cancel01Icon,
  rejected_by_detective: Cancel01Icon,
  approved: CheckmarkCircle01Icon,
};

export default function MyReportsPage() {
  const { session } = useAuthStore();
  const [claimDialogOpen, setClaimDialogOpen] = useState(false);
  const [selectedRewardCode, setSelectedRewardCode] = useState<string | null>(null);

  const { data: reports = [], isLoading } = useQuery({
    queryKey: ["reward-reports"],
    queryFn: getReports,
    enabled: !!session,
  });

  const myReports = reports.filter(
    (r) => r.reporter === session?.user.id
  );

  if (!session) {
    return <Navigate to="/login" replace />;
  }

  if (session.user.role_title !== "Base User") {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="container mx-auto py-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">My Tip Reports</h1>
        <p className="text-muted-foreground mt-1">
          Track the status of your wanted suspect tips. When approved, you will
          receive a reward coupon to claim.
        </p>
      </div>

      {isLoading ? (
        <div className="grid gap-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-28 w-full rounded-lg" />
          ))}
        </div>
      ) : myReports.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            <HugeiconsIcon icon={FileEditIcon} className="mx-auto h-12 w-12 mb-4 opacity-50" />
            <p>You have not submitted any tips yet.</p>
            <p className="text-sm mt-2">
              Report a tip from the Most Wanted list on the home page.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {myReports.map((report) => (
            <ReportStatusCard
              key={report.id}
              report={report}
              onClaimClick={(code) => {
                setSelectedRewardCode(code);
                setClaimDialogOpen(true);
              }}
            />
          ))}
        </div>
      )}

      <ClaimRewardDialog
        open={claimDialogOpen}
        onOpenChange={setClaimDialogOpen}
        initialCode={selectedRewardCode}
        onClose={() => setSelectedRewardCode(null)}
      />
    </div>
  );
}

function ReportStatusCard({
  report,
  onClaimClick,
}: {
  report: Report;
  onClaimClick: (code: string) => void;
}) {
  const { data: reward, isLoading: isLoadingReward } = useQuery({
    queryKey: ["reward", report.reward],
    queryFn: () => getRewardById(report.reward!),
    enabled: !!report.reward && report.status === "approved",
  });

  const Icon = STATUS_ICONS[report.status];
  const isApproved = report.status === "approved";

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start gap-4">
          <div className="flex-1 min-w-0">
            <CardTitle className="text-base flex items-center gap-2">
              <HugeiconsIcon icon={Icon} className="h-4 w-4" />
              Report #{report.id}
            </CardTitle>
            <CardDescription className="line-clamp-2 mt-1">
              {report.description}
            </CardDescription>
          </div>
          <Badge
            variant={
              isApproved
                ? "default"
                : report.status.includes("rejected")
                  ? "destructive"
                  : "secondary"
            }
          >
            {STATUS_LABELS[report.status]}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-xs text-muted-foreground">
          Submitted {format(new Date(report.created_at), "PPp")}
        </p>

        {isApproved && report.reward && (
          <ApprovedRewardSection
            reward={reward}
            isLoading={isLoadingReward}
            onClaimClick={onClaimClick}
          />
        )}
      </CardContent>
    </Card>
  );
}

function ApprovedRewardSection({
  reward,
  isLoading,
  onClaimClick,
}: {
  reward: { unique_code: string; is_claimed: boolean } | undefined;
  isLoading: boolean;
  onClaimClick: (code: string) => void;
}) {
  if (isLoading || !reward) {
    return <Skeleton className="h-20 w-full rounded-lg" />;
  }

  return (
    <div className="rounded-lg border border-green-500/30 bg-green-500/5 p-4 space-y-3">
      <div className="flex items-center gap-2 text-green-700 dark:text-green-400">
        <HugeiconsIcon icon={GiftIcon} className="h-5 w-5" />
        <span className="font-semibold">Reward Coupon Issued</span>
      </div>
      <div className="space-y-1">
        <p className="text-xs text-muted-foreground">Your unique reward code:</p>
        <code className="block font-mono text-sm bg-muted px-3 py-2 rounded break-all">
          {reward.unique_code}
        </code>
      </div>
      {!reward.is_claimed ? (
        <Button
          size="sm"
          className="bg-amber-600 hover:bg-amber-700"
          onClick={() => onClaimClick(reward.unique_code)}
        >
          <HugeiconsIcon icon={GiftIcon} className="mr-2 h-4 w-4" />
          Claim Reward
        </Button>
      ) : (
        <Badge variant="outline" className="text-amber-600 border-amber-600">
          Already Claimed
        </Badge>
      )}
    </div>
  );
}
