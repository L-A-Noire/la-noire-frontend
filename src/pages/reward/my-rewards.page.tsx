import { Navigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useAuthStore } from "@/stores/auth.store";
import { getMyRewards } from "@/api/rewards";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { HugeiconsIcon } from "@hugeicons/react";
import { GiftIcon } from "@hugeicons/core-free-icons";
import { RewardCard } from "@/components/rewards/reward-card";

export default function MyRewardsPage() {
  const { session } = useAuthStore();

  const { data: rewards = [], isLoading } = useQuery({
    queryKey: ["my-rewards"],
    queryFn: getMyRewards,
    enabled: !!session,
  });

  if (!session) {
    return <Navigate to="/login" replace />;
  }

  if (session.user.role_title !== "Base User") {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="container mx-auto py-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">My Rewards</h1>
        <p className="text-muted-foreground mt-1">
          Your reward coupons from approved tips. Use the unique code to claim
          your reward.
        </p>
      </div>

      {isLoading ? (
        <div className="grid gap-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-28 w-full rounded-lg" />
          ))}
        </div>
      ) : rewards.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            <HugeiconsIcon
              icon={GiftIcon}
              className="mx-auto h-12 w-12 mb-4 opacity-50"
            />
            <p>You have no rewards yet.</p>
            <p className="text-sm mt-2">
              Submit tips from the Most Wanted list to earn rewards.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-2 gap-4">
          {rewards.map((reward) => (
            <RewardCard key={reward.id} reward={reward} />
          ))}
        </div>
      )}
    </div>
  );
}
