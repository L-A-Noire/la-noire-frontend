import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getSuspectCrime, updateSuspectCrimeStatus } from "@/api/suspect";
import { getCaseById, closeCase } from "@/api/cases";
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
import { Separator } from "@/components/ui/separator";
import { toast } from "react-toastify";
import { useState, useEffect } from "react";
import { format, parseISO } from "date-fns";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Legal01Icon,
  ArrowLeft01Icon,
  CheckmarkCircle02Icon,
  Cancel01Icon,
  TimelineEventIcon,
  UserIcon,
  File01Icon,
  Loading03Icon,
} from "@hugeicons/core-free-icons";

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
  const location = useLocation();
  const queryClient = useQueryClient();
  const suspectCrimeId = Number(id);

  const caseIdFromState = location.state?.caseId;

  const [verdict, setVerdict] = useState<"pending" | "guilty" | "innocent">(
    "pending",
  );

  const [punishmentType, setPunishmentType] = useState<string>("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [duration, setDuration] = useState("");

  const { data: suspectCrime, isLoading: isLoadingSuspect } = useQuery({
    queryKey: ["suspect-crime", suspectCrimeId],
    queryFn: () => getSuspectCrime(suspectCrimeId),
    enabled: !isNaN(suspectCrimeId),
  });

  const suspect = suspectCrime?.suspect_details;


  const caseId = caseIdFromState || suspectCrime?.case || suspectCrime?.case_details?.id;

  const { data: caseDetails, isLoading: isLoadingCase } = useQuery({
    queryKey: ["case", caseId],
    queryFn: () => getCaseById(caseId!),
    enabled: !!caseId,
  });

  const { data: timelineData, isLoading: isLoadingTimeline } = useQuery({
    queryKey: ["case-timeline", caseId],
    queryFn: () => getCaseTimeline(caseId!),
    enabled: !!caseId,
  });

  useEffect(() => {
    if (verdict === "pending") {
      setPunishmentType("");
      setTitle("");
      setDescription("");
      setAmount("");
      setDuration("");
    }
  }, [verdict]);

  const punishmentMutation = useMutation({
    mutationFn: async () => {
      if (!punishmentType) throw new Error("Select a punishment type");
      if (!title) throw new Error("Enter a title for the punishment");
      if (!description) throw new Error("Enter a description");
      if (!caseId) throw new Error("Case ID is required");

      const payload = {
        suspect_crime: suspectCrimeId,
        punishment_type: punishmentType,
        title,
        description,
        amount: amount || null,
        duration_months: duration ? Number(duration) : null,
      };

      console.log("Sending punishment payload (without case):", payload);
      return issuePunishment(suspectCrimeId, payload);
    },
    onSuccess: () => {
      if (caseId) {
        closeCase(caseId).catch((err) =>
          console.error("Error closing case:", err),
        );
      }

      queryClient.invalidateQueries({ queryKey: ["suspect-crimes"] });
      queryClient.invalidateQueries({ queryKey: ["suspects"] });
      queryClient.invalidateQueries({ queryKey: ["cases"] });
      toast.success("Punishment issued. Case closed.");
      navigate("/court");
    },
    onError: (error: any) => {
      console.error("Punishment error:", error);
      toast.error(
        error.response?.data?.message || "Failed to issue punishment",
      );
    },
  });

  const innocentMutation = useMutation({
    mutationFn: async () => {
      await updateSuspectCrimeStatus(suspectCrimeId, "innocent");

      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["suspect-crimes"] });
      queryClient.invalidateQueries({ queryKey: ["suspects"] });
      toast.success("Suspect declared innocent. Case remains open.");
      navigate("/court");
    },
    onError: (error: any) => {
      console.error("Innocent verdict error:", error);
      toast.error(error.response?.data?.message || "Failed to update status");
    },
  });

  if (
    isLoadingSuspect ||
    (caseId && isLoadingCase) ||
    (caseId && isLoadingTimeline)
  ) {
    return (
      <div className="flex h-screen items-center justify-center">
        <HugeiconsIcon
          icon={Loading03Icon}
          className="h-10 w-10 animate-spin text-primary"
        />
      </div>
    );
  }

  if (!suspectCrime) {
    return (
      <div className="container mx-auto py-8">
        <Card>
          <CardContent className="pt-6 text-center">
            <p className="text-muted-foreground">Suspect context not found.</p>
            <Button
              variant="outline"
              className="mt-4"
              onClick={() => navigate("/court")}
            >
              Back to Docket
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // If we don't have a case ID, show an error
  if (!caseId) {
    return (
      <div className="container mx-auto py-8">
        <Card className="border-destructive">
          <CardContent className="pt-6 text-center">
            <p className="text-destructive mb-2">
              Error: No case linked to this suspect
            </p>
            <p className="text-sm text-muted-foreground mb-4">
              This suspect crime is not associated with any case.
            </p>
            <Button variant="outline" onClick={() => navigate("/court")}>
              Back to Docket
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const suspectName =
    suspect?.name ||
    (suspect?.first_name && suspect?.last_name
      ? `${suspect.first_name} ${suspect.last_name}`
      : "Unknown Suspect");

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
          {/* Case Header */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <HugeiconsIcon icon={File01Icon} /> Case #{caseId}:{" "}
                {caseDetails?.crime_title || "Criminal Case"}
              </CardTitle>
              <CardDescription>
                Review all evidence and context before issuing judgment
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">Crime Type</Label>
                  <p className="font-medium">
                    {caseDetails?.crime_details?.title || "N/A"}
                  </p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Crime Level</Label>
                  <Badge
                    variant={
                      caseDetails?.crime_details?.level === "4"
                        ? "destructive"
                        : "outline"
                    }
                    className={
                      caseDetails?.crime_details?.level === "4"
                        ? "bg-red-100 text-red-800"
                        : ""
                    }
                  >
                    Level {caseDetails?.crime_details?.level || "N/A"}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Timeline */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <HugeiconsIcon icon={TimelineEventIcon} /> Case Timeline
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="relative border-l border-muted ml-4 space-y-8 pl-6 py-2">
                {/* Case Opened */}
                <div className="relative">
                  <span className="absolute -left-[31px] flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs ring-4 ring-background">
                    1
                  </span>
                  <div className="flex flex-col gap-1">
                    <span className="text-sm font-medium leading-none">
                      Case Opened
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {safeFormatDate(
                        timelineData?.created_at || caseDetails?.created_at,
                      )}
                    </span>
                  </div>
                </div>

                {/* Suspect Identified */}
                <div className="relative">
                  <span className="absolute -left-[31px] flex h-6 w-6 items-center justify-center rounded-full bg-orange-500 text-white text-xs ring-4 ring-background">
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
                      {suspectName} was added as a suspect.
                    </p>
                  </div>
                </div>

                {/* Conviction Status */}
                {suspect?.status === "convicted" && (
                  <div className="relative">
                    <span className="absolute -left-[31px] flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-white text-xs ring-4 ring-background">
                      3
                    </span>
                    <div className="flex flex-col gap-1">
                      <span className="text-sm font-medium leading-none">
                        Convicted by Interrogation
                      </span>
                      <p className="text-sm text-muted-foreground pt-1">
                        The suspect was found guilty during interrogation and
                        now awaits sentencing.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Suspect Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <HugeiconsIcon icon={UserIcon} /> Defendant Profile
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-muted-foreground">Full Name</Label>
                <div className="font-medium text-lg">{suspectName}</div>
              </div>
              {suspect?.nickname && (
                <div>
                  <Label className="text-muted-foreground">AKA</Label>
                  <div>{suspect.nickname}</div>
                </div>
              )}
              <div>
                <Label className="text-muted-foreground">National ID</Label>
                <div className="font-mono">{suspect?.national_id || "N/A"}</div>
              </div>
              <div>
                <Label className="text-muted-foreground">Current Status</Label>
                <div>
                  <Badge
                    variant="outline"
                    className={
                      suspect?.status === "convicted"
                        ? "bg-purple-100 text-purple-800 border-purple-200"
                        : "bg-gray-100 text-gray-800"
                    }
                  >
                    {suspect?.status || "N/A"}
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
                Issue the final judgment for {suspectName}.
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
                      Release Suspect, Case Stays Open
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
                      Issue Punishment & Close Case
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
                        {suspectName} will be declared innocent and released.
                        The case will remain open for other suspects.
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
                      disabled={innocentMutation.isPending}
                    >
                      {innocentMutation.isPending
                        ? "Processing..."
                        : "Confirm Release"}
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
                        Specify the punishment details below. The case will be
                        closed after sentencing.
                      </p>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-2">
                    <Label>Punishment Type *</Label>
                    <Select
                      value={punishmentType}
                      onValueChange={setPunishmentType}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select punishment type..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="fine">Fine (Monetary)</SelectItem>
                        <SelectItem value="bail">Bail</SelectItem>
                        <SelectItem value="imprisonment">
                          Imprisonment
                        </SelectItem>
                        <SelectItem value="death">Death Penalty</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Title / Charge *</Label>
                    <Input
                      placeholder="e.g. First Degree Murder"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Sentence Description *</Label>
                    <Textarea
                      placeholder="Details of the sentence..."
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      rows={3}
                    />
                  </div>

                  {(punishmentType === "fine" || punishmentType === "bail") && (
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

                  {punishmentType === "imprisonment" && (
                    <div className="space-y-2">
                      <Label>Duration (Months)</Label>
                      <Input
                        type="number"
                        placeholder="e.g. 24"
                        value={duration}
                        onChange={(e) => setDuration(e.target.value)}
                      />
                    </div>
                  )}

                  <div className="flex gap-2 pt-4">
                    <Button
                      variant="ghost"
                      onClick={() => setVerdict("pending")}
                      className="flex-1"
                      disabled={punishmentMutation.isPending}
                    >
                      Back
                    </Button>
                    <Button
                      className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                      disabled={
                        !punishmentType ||
                        !title ||
                        !description ||
                        !caseId ||
                        punishmentMutation.isPending
                      }
                      onClick={() => punishmentMutation.mutate()}
                    >
                      {punishmentMutation.isPending
                        ? "Processing..."
                        : "Issue Sentence & Close Case"}
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
