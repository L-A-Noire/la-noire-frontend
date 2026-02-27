import { Navigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useAuthStore } from "@/stores/auth.store";
import { claimRewardByCode } from "@/api/rewards";
import {
  ClaimRewardSchema,
  type ClaimRewardFormValues,
} from "@/schemas/claim-reward.schema";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { HugeiconsIcon } from "@hugeicons/react";
import { GiftIcon } from "@hugeicons/core-free-icons";
import { toast } from "react-toastify";

const POLICE_ROLES = [
  "Police/Patrol Officer",
  "Detective",
  "Sergent",
  "Captain",
  "Chief",
];

export default function ClaimRewardPage() {
  const session = useAuthStore((s) => s.session);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ClaimRewardFormValues>({
    resolver: zodResolver(ClaimRewardSchema),
    defaultValues: { reward_code: "", national_id: "" },
  });

  const mutation = useMutation({
    mutationFn: claimRewardByCode,
    onSuccess: (data) => {
      toast.success(`${data.detail} — Amount: ${data.amount.toLocaleString()}`);
      reset();
    },
    onError: (err: { response?: { data?: { detail?: string } } }) => {
      const message =
        err.response?.data?.detail ?? "Invalid code or national ID.";
      toast.error(message);
    },
  });

  const onSubmit = (data: ClaimRewardFormValues) => {
    mutation.mutate(data);
  };

  if (!session) {
    return <Navigate to="/login" replace />;
  }

  const isPolice = POLICE_ROLES.includes(session.user.role_title);
  if (!isPolice) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="container mx-auto flex min-h-full items-center justify-center px-4 py-12">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-extrabold tracking-tight text-primary font-mono">
            CLAIM REWARD
          </h1>
          <p className="text-sm text-muted-foreground font-mono">
            Enter reward code and recipient national ID. National ID must match
            the reward recipient.
          </p>
        </div>

        <Card className="border-primary/20 bg-linear-to-br from-card/95 to-card/50 backdrop-blur-sm shadow-lg">
          <CardHeader>
            <CardTitle className="text-lg font-mono text-primary flex items-center gap-2">
              <HugeiconsIcon icon={GiftIcon} className="h-5 w-5" />
              Reward claim
            </CardTitle>
            <CardDescription>
              Only police and authorized roles can claim rewards. Recipient
              national ID must match the reward.
            </CardDescription>
          </CardHeader>

          <Separator className="bg-primary/20" />

          <form onSubmit={handleSubmit(onSubmit)}>
            <CardContent className="space-y-5">
              <div className="space-y-2">
                <Label
                  htmlFor="reward_code"
                  className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground"
                >
                  Reward code
                </Label>
                <Input
                  id="reward_code"
                  type="text"
                  placeholder="e.g. RWD-xxxx"
                  className={errors.reward_code ? "border-destructive" : ""}
                  {...register("reward_code")}
                />
                {errors.reward_code && (
                  <p className="text-xs text-destructive font-mono">
                    {errors.reward_code.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="national_id"
                  className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground"
                >
                  Recipient national ID
                </Label>
                <Input
                  id="national_id"
                  type="text"
                  dir="ltr"
                  placeholder="National ID"
                  className={errors.national_id ? "border-destructive" : ""}
                  {...register("national_id")}
                />
                {errors.national_id && (
                  <p className="text-xs text-destructive font-mono">
                    {errors.national_id.message}
                  </p>
                )}
              </div>

              <Button
                type="submit"
                className="w-full font-mono"
                disabled={mutation.isPending}
              >
                {mutation.isPending ? "Claiming…" : "Claim reward"}
              </Button>
            </CardContent>
          </form>
        </Card>
      </div>
    </div>
  );
}
