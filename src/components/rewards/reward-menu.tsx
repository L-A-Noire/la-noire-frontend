import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useAuthStore } from "@/stores/auth.store";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  GiftIcon,
  Search01Icon,
  CheckmarkCircle01Icon,
  Alert02Icon,
  Cash01Icon,
  Cancel01Icon,
  IdIcon,
  LicenseIcon,
} from "@hugeicons/core-free-icons";
import { verifyReward, claimReward } from "@/api/rewards";
import type { RewardDetail } from "@/types/reward.type";
import { toast } from "react-toastify";
import { format } from "date-fns";

// Police roles that can access rewards
const POLICE_ROLES = [
  "Administrator",
  "Chief",
  "Captain",
  "Sergent",
  "Detective",
  "Police/Patrol Officer",
  "Cadet",
];

export function RewardMenu() {
  const { session } = useAuthStore();
  const [open, setOpen] = useState(false);
  const [uniqueCode, setUniqueCode] = useState("");
  const [nationalId, setNationalId] = useState("");
  const [fullName, setFullName] = useState("");
  const [verificationResult, setVerificationResult] = useState<{
    isValid: boolean;
    reward?: RewardDetail;
    error?: string;
  } | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);

  const canAccessRewards =
    session && POLICE_ROLES.includes(session.user.role_title);

  const verifyMutation = useMutation({
    mutationFn: ({ code, id }: { code: string; id: string }) =>
      verifyReward(code, id),
    onSuccess: (data) => {
      if (data.valid && data.reward) {
        setVerificationResult({
          isValid: true,
          reward: data.reward,
        });
        toast.success("Reward verified successfully!");
      } else {
        setVerificationResult({
          isValid: false,
          error:
            data.message || "Invalid reward code or national ID combination",
        });
        toast.error("Verification failed");
      }
      setIsVerifying(false);
    },
    onError: (error: Error) => {
      setVerificationResult({
        isValid: false,
        error: error.message || "Failed to verify reward",
      });
      toast.error("Verification failed");
      setIsVerifying(false);
    },
  });

  const claimMutation = useMutation({
    mutationFn: claimReward,
    onSuccess: () => {
      toast.success("Reward claimed successfully!");
      // Reset the form
      setUniqueCode("");
      setNationalId("");
      setFullName("");
      setVerificationResult(null);
    },
    onError: () => {
      toast.error("Failed to claim reward");
    },
  });

  const handleVerify = () => {
    if (!uniqueCode.trim()) {
      toast.error("Please enter the reward code");
      return;
    }
    if (!nationalId.trim()) {
      toast.error("Please enter the national ID");
      return;
    }

    setIsVerifying(true);
    verifyMutation.mutate({ code: uniqueCode, id: nationalId });
  };

  const handleClaim = () => {
    if (!verificationResult?.reward) return;

    if (!fullName.trim()) {
      toast.error("Please enter the recipient's full name");
      return;
    }

    claimMutation.mutate({
      unique_code: verificationResult.reward.unique_code,
      national_id: nationalId,
      full_name: fullName,
    });
  };

  const handleReset = () => {
    setUniqueCode("");
    setNationalId("");
    setFullName("");
    setVerificationResult(null);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  if (!canAccessRewards) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="relative gap-2">
          <HugeiconsIcon icon={GiftIcon} className="h-4 w-4" />
          <span className="hidden md:inline">Rewards</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <HugeiconsIcon icon={GiftIcon} className="h-6 w-6 text-primary" />
            Reward Verification
          </DialogTitle>
          <DialogDescription>
            Verify a reward by entering both the unique reward code and the
            recipient's national ID.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Verification Form */}
          {!verificationResult && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label
                  htmlFor="reward-code"
                  className="flex items-center gap-2"
                >
                  <HugeiconsIcon icon={LicenseIcon} className="h-4 w-4" />
                  Reward Unique Code
                </Label>
                <Input
                  id="reward-code"
                  placeholder="Enter the reward unique code (e.g., 550e8400-e29b-41d4-a716-446655440000)"
                  value={uniqueCode}
                  onChange={(e) => setUniqueCode(e.target.value)}
                  className="font-mono"
                />
                <p className="text-xs text-muted-foreground">
                  The unique code provided to the informant when the reward was
                  issued
                </p>
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="national-id"
                  className="flex items-center gap-2"
                >
                  <HugeiconsIcon icon={IdIcon} className="h-4 w-4" />
                  National ID
                </Label>
                <Input
                  id="national-id"
                  placeholder="Enter the recipient's national ID"
                  value={nationalId}
                  onChange={(e) => setNationalId(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  The national ID of the person claiming the reward
                </p>
              </div>

              <Button
                onClick={handleVerify}
                disabled={isVerifying || !uniqueCode || !nationalId}
                className="w-full"
              >
                <HugeiconsIcon icon={Search01Icon} className="mr-2 h-4 w-4" />
                {isVerifying ? "Verifying..." : "Verify Reward"}
              </Button>
            </div>
          )}

          {/* Verification Result */}
          {verificationResult && (
            <div className="space-y-4">
              {verificationResult.isValid && verificationResult.reward ? (
                <>
                  <div className="bg-green-50 dark:bg-green-950/20 p-4 rounded-lg border border-green-200 dark:border-green-900 flex items-start gap-3">
                    <HugeiconsIcon
                      icon={CheckmarkCircle01Icon}
                      className="h-5 w-5 text-green-600 mt-0.5"
                    />
                    <div>
                      <p className="font-semibold text-green-800 dark:text-green-300">
                        Reward Verified
                      </p>
                      <p className="text-sm text-green-700 dark:text-green-400">
                        The reward code matches this national ID
                      </p>
                    </div>
                  </div>

                  {/* Reward Details Card */}
                  <Card className="border-2 border-green-200 dark:border-green-900">
                    <CardContent className="p-4 space-y-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="text-xs text-muted-foreground">
                            Recipient
                          </p>
                          <p className="font-semibold text-lg">
                            {
                              verificationResult.reward.recipient_details
                                .first_name
                            }{" "}
                            {
                              verificationResult.reward.recipient_details
                                .last_name
                            }
                          </p>
                          <p className="text-sm text-muted-foreground">
                            National ID:{" "}
                            {
                              verificationResult.reward.recipient_details
                                .national_id
                            }
                          </p>
                        </div>
                        <Badge
                          variant={
                            verificationResult.reward.is_claimed
                              ? "outline"
                              : "default"
                          }
                          className={
                            verificationResult.reward.is_claimed
                              ? "bg-gray-100 text-gray-800"
                              : "bg-green-100 text-green-800"
                          }
                        >
                          {verificationResult.reward.is_claimed
                            ? "Claimed"
                            : "Available"}
                        </Badge>
                      </div>

                      <Separator />

                      <div className="flex justify-between items-center">
                        <div>
                          <p className="text-xs text-muted-foreground">
                            Reward Amount
                          </p>
                          <p className="text-3xl font-bold text-primary">
                            {formatCurrency(verificationResult.reward.amount)}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-muted-foreground">
                            Issued On
                          </p>
                          <p className="text-sm">
                            {format(
                              new Date(verificationResult.reward.created_at),
                              "MMM dd, yyyy",
                            )}
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div>
                          <p className="text-muted-foreground">Reward Code</p>
                          <p className="font-mono truncate">
                            {verificationResult.reward.unique_code}
                          </p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Issued By</p>
                          <p>
                            {verificationResult.reward.created_by_details
                              ?.username || "Unknown"}
                          </p>
                        </div>
                      </div>

                      {!verificationResult.reward.is_claimed ? (
                        <div className="space-y-3 mt-2 pt-2 border-t">
                          <div className="space-y-2">
                            <Label htmlFor="full-name">
                              Recipient Full Name (for payment)
                            </Label>
                            <Input
                              id="full-name"
                              placeholder="Enter full name as per ID"
                              value={fullName}
                              onChange={(e) => setFullName(e.target.value)}
                            />
                          </div>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              className="flex-1"
                              onClick={handleReset}
                            >
                              <HugeiconsIcon
                                icon={Cancel01Icon}
                                className="mr-2 h-4 w-4"
                              />
                              Cancel
                            </Button>
                            <Button
                              className="flex-1 bg-green-600 hover:bg-green-700"
                              onClick={handleClaim}
                              disabled={claimMutation.isPending || !fullName}
                            >
                              <HugeiconsIcon
                                icon={Cash01Icon}
                                className="mr-2 h-4 w-4"
                              />
                              {claimMutation.isPending
                                ? "Processing..."
                                : "Process Payment"}
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="bg-amber-50 dark:bg-amber-950/20 p-3 rounded border border-amber-200 dark:border-amber-900">
                          <p className="text-sm text-amber-800 dark:text-amber-200 flex items-center gap-2">
                            <HugeiconsIcon
                              icon={Alert02Icon}
                              className="h-4 w-4"
                            />
                            This reward has already been claimed on{" "}
                            {verificationResult.reward.claimed_at
                              ? format(
                                  new Date(
                                    verificationResult.reward.claimed_at,
                                  ),
                                  "PPP",
                                )
                              : "an unknown date"}
                          </p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </>
              ) : (
                <>
                  <div className="bg-red-50 dark:bg-red-950/20 p-4 rounded-lg border border-red-200 dark:border-red-900 flex items-start gap-3">
                    <HugeiconsIcon
                      icon={Alert02Icon}
                      className="h-5 w-5 text-red-600 mt-0.5"
                    />
                    <div>
                      <p className="font-semibold text-red-800 dark:text-red-300">
                        Verification Failed
                      </p>
                      <p className="text-sm text-red-700 dark:text-red-400">
                        {verificationResult.error ||
                          "The reward code does not match this national ID"}
                      </p>
                    </div>
                  </div>
                  <Button
                    onClick={handleReset}
                    variant="outline"
                    className="w-full"
                  >
                    Try Again
                  </Button>
                </>
              )}
            </div>
          )}

          {/* Info Section */}
          <div className="bg-blue-50 dark:bg-blue-950/20 p-4 rounded-lg border border-blue-200 dark:border-blue-900">
            <p className="text-xs font-semibold text-blue-900 dark:text-blue-300 mb-2">
              ℹ️ Reward Verification Process
            </p>
            <ul className="text-xs text-blue-800 dark:text-blue-200 space-y-1">
              <li>
                • Informants receive a unique reward code when their tip is
                approved
              </li>
              <li>
                • Verify the reward by entering both the code and their national
                ID
              </li>
              <li>
                • The system will confirm if they match and display the reward
                amount
              </li>
              <li>• Enter the recipient's full name to process the payment</li>
              <li>• Once claimed, the reward code becomes invalid</li>
            </ul>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
