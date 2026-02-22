import { useQuery } from "@tanstack/react-query";
import { getWantedSuspects } from "@/api/suspect";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import type { Suspect } from "@/types/suspect.type";
import { HugeiconsIcon } from "@hugeicons/react";
import { Alert02Icon } from "@hugeicons/core-free-icons";

export default function WantedSuspects() {
  const {
    data: wantedSuspects,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["wanted-suspects"],
    queryFn: getWantedSuspects,
  });

  if (isLoading) {
    return (
      <Card className="h-full border-l-4 border-l-primary/20">
        <CardHeader>
          <CardTitle className="text-xl flex items-center gap-2">
            <HugeiconsIcon
              icon={Alert02Icon}
              className="w-5 h-5 text-destructive animate-pulse"
            />
            Wanted List
          </CardTitle>
          <CardDescription>Scanning database...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex gap-3 animate-pulse">
                <div className="w-12 h-12 rounded-full bg-muted" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-3/4 bg-muted rounded" />
                  <div className="h-3 w-1/2 bg-muted rounded" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (isError) {
    return (
      <Card className="border-destructive/50">
        <CardHeader>
          <CardTitle className="text-destructive">System Error</CardTitle>
          <CardDescription>Unable to fetch wanted list.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className="h-full border-l-4 border-l-destructive">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl font-bold flex items-center gap-2 text-destructive">
            <HugeiconsIcon icon={Alert02Icon} className="w-6 h-6" />
            MOST WANTED
          </CardTitle>
          <Badge variant="destructive" className="animate-pulse">
            LIVE FEED
          </Badge>
        </div>
        <CardDescription>
          High priority targets in your jurisdiction.
        </CardDescription>
      </CardHeader>
      <Separator className="mb-4" />
      <CardContent className="space-y-6 pr-2 overflow-y-auto scrollbar-thin scrollbar-thumb-muted scrollbar-track-transparent">
        {wantedSuspects?.map((suspect) => (
          <WantedSuspectItem key={suspect.id} suspect={suspect} />
        ))}
        {wantedSuspects?.length === 0 && (
          <div className="text-center text-muted-foreground py-8">
            No active warrants found.
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function WantedSuspectItem({ suspect }: { suspect: Suspect }) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getInitials = (first: string, last: string) => {
    return `${first.charAt(0)}${last.charAt(0)}`.toUpperCase();
  };

  return (
    <div className="group relative flex flex-col gap-3 p-3 rounded-lg border border-border/40 hover:border-destructive/50 hover:bg-destructive/5 transition-all duration-300">
      <div className="flex items-start gap-4">
        <div className="shrink-0 relative">
          <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center border-2 border-destructive/20 text-destructive font-mono font-bold text-lg">
            {getInitials(
              suspect.suspect_details.first_name,
              suspect.suspect_details.last_name,
            )}
          </div>
          <div className="absolute -bottom-1 -right-1 bg-background rounded-full p-0.5 border border-border">
            <div className="w-3 h-3 rounded-full bg-destructive animate-pulse" />
          </div>
        </div>
        <div className="flex-1 min-w-0 space-y-1">
          <div className="flex items-center justify-between gap-2">
            <h4 className="font-semibold text-sm truncate leading-none">
              {suspect.suspect_details.first_name}{" "}
              {suspect.suspect_details.last_name}
            </h4>
            <Badge
              variant="outline"
              className="text-[10px] h-5 px-1.5 border-destructive/30 text-destructive uppercase tracking-wider"
            >
              {suspect.crime_level}
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground truncate font-mono">
            {suspect.suspect_details.national_id}
          </p>
          <p className="text-xs font-medium text-foreground truncate">
            {suspect.crime_title}
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between text-xs mt-1 pt-2 border-t border-border/30 border-dashed">
        <div className="flex flex-col">
          <span className="text-[10px] text-muted-foreground uppercase tracking-widest">
            Reward
          </span>
          <span className="font-mono font-bold text-green-500">
            {formatCurrency(suspect.reward_amount)}
          </span>
        </div>
        <div className="flex flex-col items-end">
          <span className="text-[10px] text-muted-foreground uppercase tracking-widest">
            Priority
          </span>
          <span className="font-mono font-bold text-orange-500">
            {suspect.priority_score.toLocaleString()} BP
          </span>
        </div>
      </div>

      <Button
        size="sm"
        variant="ghost"
        className="w-full text-xs h-7 mt-1 hover:bg-destructive hover:text-destructive-foreground"
      >
        View Case
      </Button>
    </div>
  );
}
