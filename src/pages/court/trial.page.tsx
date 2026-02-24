import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation } from "@tanstack/react-query";
import { getSuspectCrime, updateSuspectStatus } from "@/api/suspect";
import { issuePunishment } from "@/api/punishment";
import { getCaseTimeline } from "@/api/cases";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "react-toastify";
import { useState } from "react";
import { format, parseISO } from "date-fns";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Legal01Icon,
  ArrowLeft01Icon,
  CheckmarkCircle02Icon,
  Cancel01Icon,
  TimelineEventIcon,
} from "@hugeicons/core-free-icons";
import { PunishmentType } from "@/types/punishment.type";

const safeFormatDate = (dateString?: string) => {
  if (!dateString) return "N/A";
  try {
    return format(parseISO(dateString), "PPP p");
  } catch {
    return "Invalid Date";
  }
};

export const TrialPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const suspectCrimeId = Number(id);

  const [verdict, setVerdict] = useState<"pending" | "guilty" | "innocent">(
    "pending",
  );

  // Punishment Form State
  const [punishmentType, setPunishmentType] = useState<PunishmentType | "">("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [duration, setDuration] = useState("");

  // 1. Fetch Suspect Details
  const { data: suspectCrime, isLoading: isLoadingSuspect } = useQuery({
    queryKey: ["suspect-crime", suspectCrimeId],
    queryFn: () => getSuspectCrime(suspectCrimeId),
    enabled: !isNaN(suspectCrimeId),
  });

  // 2. Fetch Case Timeline (once we have case ID)
  const caseId = suspectCrime?.case;
  const { data: timelineData, isLoading: isLoadingTimeline } = useQuery({
    queryKey: ["case-timeline", caseId],
    queryFn: () => getCaseTimeline(caseId!),
    enabled: !!caseId,
  });

  // Mutation: Issue Punishment
  const punishmentMutation = useMutation({
    mutationFn: async () => {
      if (!punishmentType) throw new Error("Select a punishment type");

      return issuePunishment(suspectCrimeId, {
        suspect_crime: suspectCrimeId,
        case: caseId!,
        punishment_type: punishmentType as PunishmentType,
        title,
        description,
        amount: amount || null,
        duration_months: duration ? Number(duration) : null,
      });
    },
    onSuccess: () => {
      toast.success("The punishment has been recorded.");
      navigate("/court");
    },
    onError: () => {
      toast.error("Failed to issue punishment.");
    },
  });

  // Mutation: Declare Innocent
  const innocentMutation = useMutation({
    mutationFn: async () => {
      return updateSuspectStatus(suspectCrimeId, "innocent");
    },
    onSuccess: () => {
      toast.success("Suspect declared innocent.");
      navigate("/court");
    },
    onError: () => {
      toast.error("Failed to update status.");
    },
  });

  if (isLoadingSuspect || (caseId && isLoadingTimeline)) {
    return <div className="p-10 text-center">Loading Trial Data...</div>;
  }

  if (!suspectCrime)
    return <div className="p-10 text-center">Suspect context not found.</div>;

  return (
    <div className="container mx-auto py-6 space-y-6">
      <Button
        variant="ghost"
        onClick={() => navigate("/court")}
        className="pl-0 gap-2"
      >
        <HugeiconsIcon icon={ArrowLeft01Icon} size={16} /> Back to Docket
      </Button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* LEFT COLUMN: Case Context & Timeline */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <HugeiconsIcon icon={TimelineEventIcon} /> Case Timeline
              </CardTitle>
              <CardDescription>
                Review all events, evidence, and reports linked to Case #
                {caseId}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* Simplified Timeline View */}
              <div className="relative border-l border-muted ml-4 space-y-8 pl-6 py-2">
                {/* We can map through valid timeline items from timelineData if avail 
                                    For now just show case creation and suspect add dates 
                                */}
                <div className="relative">
                  <span className="absolute -left-[31px] flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs ring-4 ring-background">
                    1
                  </span>
                  <div className="flex flex-col gap-1">
                    <span className="text-sm font-medium leading-none">
                      Case Opened
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {safeFormatDate(timelineData?.created_at)}
                    </span>
                    <p className="text-sm text-muted-foreground pt-1">
                      {timelineData?.crime_title || "Initial case opening."}
                    </p>
                  </div>
                </div>

                <div className="relative">
                  <span className="absolute -left-[31px] flex h-6 w-6 items-center justify-center rounded-full bg-destructive text-destructive-foreground text-xs ring-4 ring-background">
                    2
                  </span>
                  <div className="flex flex-col gap-1">
                    <span className="text-sm font-medium leading-none">
                      Suspect Identified
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {safeFormatDate(suspectCrime.added_at)}
                    </span>
                    <p className="text-sm text-muted-foreground pt-1">
                      {suspectCrime.suspect_details?.first_name}{" "}
                      {suspectCrime.suspect_details?.last_name} was added as a
                      suspect.
                    </p>
                  </div>
                </div>

                {/* Placeholder for more events if `timelineData` had an array of events */}
              </div>
            </CardContent>
          </Card>

          {/* Suspect Details */}
          <Card>
            <CardHeader>
              <CardTitle>Defendant Profile</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-muted-foreground">Full Name</Label>
                <div className="font-medium text-lg">
                  {suspectCrime.suspect_details?.first_name}{" "}
                  {suspectCrime.suspect_details?.last_name}
                </div>
              </div>
              <div>
                <Label className="text-muted-foreground">National ID</Label>
                <div className="font-mono">
                  {suspectCrime.suspect_details?.national_id}
                </div>
              </div>
              <div>
                <Label className="text-muted-foreground">Current Status</Label>
                <div>
                  <Badge
                    variant={
                      suspectCrime.status === "arrested"
                        ? "destructive"
                        : "outline"
                    }
                  >
                    {suspectCrime.status}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* RIGHT COLUMN: Judgment Form */}
        <div className="space-y-6">
          <Card className="border-primary/20 bg-card shadow-lg">
            <CardHeader className="bg-primary/5 pb-4">
              <CardTitle className="flex items-center gap-2 text-xl">
                <HugeiconsIcon icon={Legal01Icon} className="text-primary" />
                Judicial Verdict
              </CardTitle>
              <CardDescription>
                Issue the final judgment for this defendant.
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6 space-y-6">
              {/* Verdict Selection */}
              {verdict === "pending" && (
                <div className="grid grid-cols-2 gap-4">
                  <Button
                    variant="outline"
                    className="h-24 flex-col gap-2 hover:bg-green-50 hover:text-green-700 hover:border-green-200"
                    onClick={() => setVerdict("innocent")}
                  >
                    <HugeiconsIcon icon={CheckmarkCircle02Icon} size={24} />
                    <span className="font-bold text-lg">Not Guilty</span>
                    <span className="text-xs font-normal opacity-70">
                      Release Suspect
                    </span>
                  </Button>
                  <Button
                    variant="outline"
                    className="h-24 flex-col gap-2 hover:bg-red-50 hover:text-red-700 hover:border-red-200"
                    onClick={() => setVerdict("guilty")}
                  >
                    <HugeiconsIcon icon={Cancel01Icon} size={24} />
                    <span className="font-bold text-lg">Guilty</span>
                    <span className="text-xs font-normal opacity-70">
                      Proceed to Sentencing
                    </span>
                  </Button>
                </div>
              )}

              {/* Innocent Flow */}
              {verdict === "innocent" && (
                <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2">
                  <div className="bg-green-50 text-green-800 p-4 rounded-md flex items-center gap-3">
                    <HugeiconsIcon icon={CheckmarkCircle02Icon} />
                    <div>
                      <p className="font-semibold">Verdict: Not Guilty</p>
                      <p className="text-sm opacity-90">
                        Suspect will be declared innocent and released.
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      onClick={() => setVerdict("pending")}
                      className="flex-1"
                    >
                      Back
                    </Button>
                    <Button
                      className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                      onClick={() => innocentMutation.mutate()}
                    >
                      Confirm Release
                    </Button>
                  </div>
                </div>
              )}

              {/* Guilty Flow */}
              {verdict === "guilty" && (
                <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2">
                  <div className="bg-red-50 text-red-800 p-4 rounded-md flex items-center gap-3">
                    <HugeiconsIcon icon={Legal01Icon} />
                    <div>
                      <p className="font-semibold">Verdict: Guilty</p>
                      <p className="text-sm opacity-90">
                        Specify the punishment details below.
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Punishment Type</Label>
                    <Select
                      value={punishmentType}
                      onValueChange={(v) =>
                        setPunishmentType(v as PunishmentType)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select type..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value={PunishmentType.FINE}>
                          Fine (Monetary)
                        </SelectItem>
                        <SelectItem value={PunishmentType.BAIL}>
                          Bail
                        </SelectItem>
                        <SelectItem value={PunishmentType.IMPRISONMENT}>
                          Imprisonment
                        </SelectItem>
                        <SelectItem value={PunishmentType.DEATH}>
                          Death Penalty
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Title / Charge</Label>
                    <Input
                      placeholder="e.g. First Degree Murder"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Sentence Description</Label>
                    <Textarea
                      placeholder="Details of the sentence..."
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                    />
                  </div>

                  {(punishmentType === PunishmentType.FINE ||
                    punishmentType === PunishmentType.BAIL) && (
                    <div className="space-y-2">
                      <Label>Amount ($)</Label>
                      <Input
                        type="number"
                        placeholder="0.00"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                      />
                    </div>
                  )}

                  {punishmentType === PunishmentType.IMPRISONMENT && (
                    <div className="space-y-2">
                      <Label>Duration (Months)</Label>
                      <Input
                        type="number"
                        placeholder="Months"
                        value={duration}
                        onChange={(e) => setDuration(e.target.value)}
                      />
                    </div>
                  )}

                  <div className="flex gap-2 pt-2">
                    <Button
                      variant="ghost"
                      onClick={() => setVerdict("pending")}
                      className="flex-1"
                    >
                      Back
                    </Button>
                    <Button
                      className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                      disabled={!punishmentType || !title || !description}
                      onClick={() => punishmentMutation.mutate()}
                    >
                      Issue Sentence
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
