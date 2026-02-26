import { useState } from "react";
import { format } from "date-fns";
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
import { Alert02Icon, FileEditIcon } from "@hugeicons/core-free-icons";
import { ReportTipDialog } from "@/components/wanted-suspects/report-tip-dialog";

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
            {[1, 2, 3, 4, 5, 6].map((i) => (
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
  const [reportDialogOpen, setReportDialogOpen] = useState(false);
  const getInitials = (name?: string, nickname?: string) => {
    if (name) {
      const parts = name.trim().split(/\s+/);
      return parts.length >= 2
        ? `${parts[0].charAt(0)}${parts[1].charAt(0)}`.toUpperCase()
        : `${name.charAt(0)}${(nickname || "?").charAt(0)}`.toUpperCase();
    }
    return `${(nickname || "?").charAt(0)}?`.toUpperCase();
  };

  const statusLabel =
    suspect.status === "most_wanted"
      ? "MOST WANTED"
      : suspect.status === "wanted"
        ? "WANTED"
        : suspect.status?.toUpperCase() || "N/A";

  return (
    <div className="group relative flex flex-col gap-3 p-3 rounded-lg border border-border/40 hover:border-destructive/50 hover:bg-destructive/5 transition-all duration-300">
      <div className="flex items-start gap-4">
        <div className="shrink-0 relative">
          {suspect.picture ? (
            <img
              src={suspect.picture}
              alt={suspect.name}
              className="w-12 h-12 rounded-full object-cover border-2 border-destructive/20"
            />
          ) : (
            <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center border-2 border-destructive/20 text-destructive font-mono font-bold text-lg">
              {getInitials(suspect.name, suspect.nickname)}
            </div>
          )}
          <div className="absolute -bottom-1 -right-1 bg-background rounded-full p-0.5 border border-border">
            <div className="w-3 h-3 rounded-full bg-destructive animate-pulse" />
          </div>
        </div>
        <div className="flex-1 min-w-0 space-y-1">
          <div className="flex items-center justify-between gap-2">
            <h4 className="font-semibold text-sm truncate leading-none">
              {suspect.name}
            </h4>
            <Badge
              variant="outline"
              className="text-[10px] h-5 px-1.5 border-destructive/30 text-destructive uppercase tracking-wider"
            >
              {statusLabel}
            </Badge>
          </div>
          {suspect.nickname && (
            <p className="text-xs text-muted-foreground truncate font-mono">
              AKA: {suspect.nickname}
            </p>
          )}
          {suspect.national_id && (
            <p className="text-xs text-muted-foreground truncate font-mono">
              ID: {suspect.national_id}
            </p>
          )}
          {suspect.description && (
            <p className="text-xs font-medium text-foreground truncate line-clamp-2">
              {suspect.description}
            </p>
          )}
          {(suspect.reward_amount ?? 0) > 0 && (
            <p className="text-xs font-semibold text-amber-600">
              Reward: ${suspect.reward_amount?.toLocaleString()}
            </p>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between text-xs mt-1 pt-2 border-t border-border/30 border-dashed">
        <div className="flex flex-col">
          <span className="text-[10px] text-muted-foreground uppercase tracking-widest">
            Status
          </span>
          <span className="font-mono font-bold text-orange-500">
            {statusLabel}
          </span>
        </div>
        {suspect.wanted_since && (
          <div className="flex flex-col text-right">
            <span className="text-[10px] text-muted-foreground uppercase tracking-widest">
              Wanted Since
            </span>
            <span className="font-mono text-muted-foreground">
              {format(new Date(suspect.wanted_since), "MMM d, yyyy")}
            </span>
          </div>
        )}
      </div>

      <div className="flex gap-2 mt-1">
        <Button
          size="sm"
       variant="outline"
          className="flex-1 text-xs h-7 hover:bg-destructive hover:text-destructive-foreground hover:cursor-pointer"
          onClick={() => setReportDialogOpen(true)}
        >
          <HugeiconsIcon icon={FileEditIcon} className="mr-1.5 h-3.5 w-3.5" />
          Report Tip
        </Button>
      </div>

      <ReportTipDialog
        open={reportDialogOpen}
        onOpenChange={setReportDialogOpen}
        suspect={suspect}
      />
    </div>
  );
}
