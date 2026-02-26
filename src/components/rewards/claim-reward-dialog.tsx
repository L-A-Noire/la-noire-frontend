import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { verifyReward, claimReward } from "@/api/rewards";
import type { RewardDetail } from "@/types/reward.type";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  GiftIcon,
  Search01Icon,
  CheckmarkCircle01Icon,
  Alert02Icon,
  Cash01Icon,
} from "@hugeicons/core-free-icons";
import { toast } from "react-toastify";
import { format } from "date-fns";

interface ClaimRewardDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialCode?: string | null;
  onClose?: () => void;
}

function ClaimFormContent({
  initialCode,
  onOpenChange,
}: {
  initialCode: string;
  onOpenChange: (open: boolean) => void;
}) {
  const [uniqueCode, setUniqueCode] = useState(initialCode);
  const [nationalId, setNationalId] = useState("");
  const [fullName, setFullName] = useState("");
  const [verificationResult, setVerificationResult] = useState<{
    isValid: boolean;
    reward?: RewardDetail;
    error?: string;
  } | null>(null);

  const verifyMutation = useMutation({
    mutationFn: ({ code, id }: { code: string; id: string }) =>
      verifyReward(code, id),
    onSuccess: (data) => {
      if (data.valid && data.reward) {
        setVerificationResult({ isValid: true, reward: data.reward });
        toast.success("Reward verified");
      } else {
        setVerificationResult({
          isValid: false,
          error: data.message || "Invalid code or national ID",
        });
        toast.error("Verification failed");
      }
    },
    onError: (error: Error) => {
      setVerificationResult({
        isValid: false,
        error: error.message || "Verification failed",
      });
      toast.error("Verification failed");
    },
  });

  const claimMutation = useMutation({
    mutationFn: claimReward,
    onSuccess: () => {
      toast.success("Reward claimed successfully!");
      setVerificationResult(null);
      setUniqueCode("");
      setNationalId("");
      setFullName("");
      onOpenChange(false);
    },
    onError: () => {
      toast.error("Failed to claim reward");
    },
  });

  const handleVerify = () => {
    if (!uniqueCode.trim()) {
      toast.error("Please enter your reward code");
      return;
    }
    if (!nationalId.trim()) {
      toast.error("Please enter your national ID");
      return;
    }
    verifyMutation.mutate({ code: uniqueCode, id: nationalId });
  };

  const handleClaim = () => {
    if (!verificationResult?.reward) return;
    if (!fullName.trim()) {
      toast.error("Please enter your full name");
      return;
    }
    claimMutation.mutate({
      unique_code: verificationResult.reward.unique_code,
      national_id: nationalId,
      full_name: fullName,
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const reward = verificationResult?.reward;
  const hasAmount =
    reward && "amount" in reward && typeof reward.amount === "number";

  return (
    <div className="space-y-4 py-4">
      {!verificationResult ? (
        <>
          <div className="space-y-2">
            <Label htmlFor="claim-code">Reward Code</Label>
            <Input
              id="claim-code"
              placeholder="e.g. 550e8400-e29b-41d4-a716-446655440000"
              value={uniqueCode}
              onChange={(e) => setUniqueCode(e.target.value)}
              className="font-mono"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="claim-national-id">National ID</Label>
            <Input
              id="claim-national-id"
              placeholder="Your national ID"
              value={nationalId}
              onChange={(e) => setNationalId(e.target.value)}
            />
          </div>
          <Button
            className="w-full"
            onClick={handleVerify}
            disabled={
              verifyMutation.isPending ||
              !uniqueCode.trim() ||
              !nationalId.trim()
            }
          >
            <HugeiconsIcon icon={Search01Icon} className="mr-2 h-4 w-4" />
            {verifyMutation.isPending ? "Verifying..." : "Verify"}
          </Button>
        </>
      ) : verificationResult.isValid && reward ? (
        <>
          <div className="rounded-lg border border-green-500/30 bg-green-500/5 p-4">
            <div className="flex items-center gap-2 text-green-700 dark:text-green-400 mb-2">
              <HugeiconsIcon icon={CheckmarkCircle01Icon} className="h-5 w-5" />
              <span className="font-semibold">Verified</span>
            </div>
            {hasAmount && (
              <p className="text-2xl font-bold text-primary">
                {formatCurrency(
                  (reward as RewardDetail & { amount: number }).amount,
                )}
              </p>
            )}
            <p className="text-xs text-muted-foreground mt-1">
              Issued {format(new Date(reward.created_at), "PPp")}
            </p>
          </div>

          {!reward.is_claimed ? (
            <>
              <div className="space-y-2">
                <Label htmlFor="claim-full-name">Full Name (for payment)</Label>
                <Input
                  id="claim-full-name"
                  placeholder="As per your ID"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                />
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setVerificationResult(null)}
                >
                  Back
                </Button>
                <Button
                  onClick={handleClaim}
                  disabled={claimMutation.isPending || !fullName.trim()}
                >
                  <HugeiconsIcon icon={Cash01Icon} className="mr-2 h-4 w-4" />
                  {claimMutation.isPending ? "Processing..." : "Claim Reward"}
                </Button>
              </DialogFooter>
            </>
          ) : (
            <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400">
              <HugeiconsIcon icon={Alert02Icon} className="h-5 w-5" />
              <span>This reward has already been claimed.</span>
            </div>
          )}
        </>
      ) : (
        <>
          <div className="flex items-center gap-2 text-destructive">
            <HugeiconsIcon icon={Alert02Icon} className="h-5 w-5" />
            <span>{verificationResult.error}</span>
          </div>
          <Button variant="outline" onClick={() => setVerificationResult(null)}>
            Try Again
          </Button>
        </>
      )}
    </div>
  );
}

export function ClaimRewardDialog({
  open,
  onOpenChange,
  initialCode,
  onClose,
}: ClaimRewardDialogProps) {
  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) {
      onClose?.();
    }
    onOpenChange(nextOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <HugeiconsIcon icon={GiftIcon} className="h-6 w-6 text-primary" />
            Claim Your Reward
          </DialogTitle>
          <DialogDescription>
            Enter your reward code and national ID to verify and claim your
            reward.
          </DialogDescription>
        </DialogHeader>

        {open && (
          <ClaimFormContent
            key={initialCode ?? "open"}
            initialCode={initialCode ?? ""}
            onOpenChange={onOpenChange}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
