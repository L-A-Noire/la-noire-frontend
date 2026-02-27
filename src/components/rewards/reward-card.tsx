import { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  GiftIcon,
  Copy01Icon,
  CheckmarkCircle01Icon,
} from "@hugeicons/core-free-icons";
import { format } from "date-fns";
import { toast } from "react-toastify";
import type { Reward } from "@/types/reward.type";

function formatAmount(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
  }).format(amount);
}

export function RewardCard({ reward }: { reward: Reward }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(reward.unique_code);
      setCopied(true);
      toast.success("Unique code copied to clipboard");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Failed to copy");
    }
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start gap-4">
          <div className="flex-1 min-w-0">
            <CardTitle className="text-base flex items-center gap-2">
              <HugeiconsIcon icon={GiftIcon} className="h-4 w-4" />
              Reward #{reward.id}
            </CardTitle>
            <CardDescription className="mt-1">
              Created {format(new Date(reward.created_at), "PPp")}
            </CardDescription>
          </div>
          <Badge variant={reward.is_claimed ? "secondary" : "default"}>
            {reward.is_claimed ? "Claimed" : "Available"}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="flex-1 space-y-1">
            <p className="text-xs text-muted-foreground">Unique Code</p>
            <code className="flex items-center gap-2 font-mono text-sm bg-muted px-3 py-2 rounded break-all">
              <span className="flex-1 min-w-0">{reward.unique_code}</span>
              <Button
                size="sm"
                variant="ghost"
                className="h-7 w-7 shrink-0 p-0 hover:bg-muted-foreground/10"
                onClick={handleCopy}
              >
                <HugeiconsIcon
                  icon={copied ? CheckmarkCircle01Icon : Copy01Icon}
                  className="h-4 w-4"
                />
              </Button>
            </code>
          </div>
          <div className="text-right sm:text-left">
            <p className="text-xs text-muted-foreground">Amount</p>
            <p className="font-semibold text-lg">
              {formatAmount(reward.amount)}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
