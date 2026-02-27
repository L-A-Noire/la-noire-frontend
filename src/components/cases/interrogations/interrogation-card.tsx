import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import type { Interrogation } from "@/types/interrogation.type";
import {
  submitInterrogationScore,
  reviewInterrogation,
} from "@/api/interrogations";
import { useAuthStore } from "@/stores/auth.store";
import { toast } from "react-toastify";
import { format } from "date-fns";

interface InterrogationCardProps {
  interrogation: Interrogation;
  isCaptain: boolean;
  isDetectiveOrSergeant: boolean;
  isCriticalCrime: boolean;
}

export function InterrogationCard({
  interrogation,
  isCaptain,
  isDetectiveOrSergeant,
  isCriticalCrime,
}: InterrogationCardProps) {
  const { session } = useAuthStore();
  const queryClient = useQueryClient();
  const [score, setScore] = useState<string>("");
  const [reviewScore, setReviewScore] = useState<string>("");
  const [reviewNotes, setReviewNotes] = useState("");
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
  const [scoreDialogOpen, setScoreDialogOpen] = useState(false);

  interface ErrorResponse {
    message?: string;
  }

  const suspect = interrogation.suspect_crime_details?.suspect_details;
  const userRole = session?.user?.role_title;

  const canScore =
    isDetectiveOrSergeant &&
    ((userRole === "Detective" && interrogation.detective_score === null) ||
      (userRole === "Sergent" && interrogation.sergeant_score === null));

  const canReview =
    isCaptain &&
    interrogation.detective_score !== null &&
    interrogation.sergeant_score !== null &&
    interrogation.final_score === null;

  const getStatus = () => {
    if (interrogation.final_score !== null) {
      return interrogation.final_score >= 7 ? "convicted" : "innocent";
    }
    if (
      interrogation.detective_score !== null &&
      interrogation.sergeant_score !== null
    ) {
      return "pending_review";
    }
    if (
      interrogation.detective_score !== null ||
      interrogation.sergeant_score !== null
    ) {
      return "pending_scores";
    }
    return "pending";
  };

  const status = getStatus();

  const getStatusBadge = () => {
    switch (status) {
      case "pending":
        return <Badge variant="secondary">Awaiting Scores</Badge>;
      case "pending_scores":
        return <Badge className="bg-orange-500">Partial Scores</Badge>;
      case "pending_review":
        return <Badge className="bg-purple-500">Awaiting Captain Review</Badge>;
      case "convicted":
        return <Badge className="bg-red-600">Convicted</Badge>;
      case "innocent":
        return <Badge className="bg-green-600">Innocent</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const submitScoreMutation = useMutation({
    mutationFn: (data: { score: number }) =>
      submitInterrogationScore(interrogation.id, data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: ["interrogations", interrogation.case],
      });
      setScoreDialogOpen(false);
      setScore("");
      toast.success("Score submitted successfully");

      console.log("Score submission response:", data);
    },
    onError: (error: AxiosError<ErrorResponse>) => {
      console.error("Score submission error:", error);
      console.error("Error response:", error.response?.data);
      toast.error(error.response?.data?.message || "Failed to submit score");
    },
  });

  const reviewMutation = useMutation({
    mutationFn: (data: {
      score: number;
      notes: string;
      is_approved: boolean;
    }) => reviewInterrogation(interrogation.id, data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: ["interrogations", interrogation.case],
      });
      setReviewDialogOpen(false);

      const finalScore = data.final_score;
      if (finalScore && finalScore >= 7) {
        toast.success("Suspect convicted. Case will proceed to trial.");
      } else if (finalScore && finalScore <= 3) {
        toast.success("Suspect found innocent. Status updated.");
      } else {
        toast.success("Review submitted successfully");
      }
    },
    onError: (error: AxiosError<ErrorResponse>) => {
      toast.error(error.response?.data?.message || "Failed to submit review");
    },
  });

  const handleScoreSubmit = () => {
    const numScore = Number(score);
    if (isNaN(numScore) || numScore < 1 || numScore > 10) {
      toast.error("Please enter a valid score (1-10)");
      return;
    }
    submitScoreMutation.mutate({ score: numScore });
  };

  const handleReviewSubmit = (approved: boolean) => {
    const numScore = Number(reviewScore);
    if (isNaN(numScore) || numScore < 1 || numScore > 10) {
      toast.error("Please enter a valid score (1-10)");
      return;
    }
    reviewMutation.mutate({
      score: numScore,
      notes: reviewNotes,
      is_approved: approved,
    });
  };

  return (
    <Card className="mb-4">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle>{suspect?.name || "Unknown Suspect"}</CardTitle>
            <CardDescription>
              {suspect?.nickname && <span>AKA: {suspect.nickname} • </span>}
              ID: {suspect?.national_id || "N/A"}
            </CardDescription>
            <div className="flex gap-2 mt-1">
              {interrogation.interrogators_details?.map((interrogator) => (
                <Badge
                  key={interrogator.id}
                  variant="outline"
                  className="text-xs"
                >
                  {interrogator.role_title}: {interrogator.first_name}
                </Badge>
              ))}
            </div>
          </div>
          {getStatusBadge()}
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid gap-3 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Date:</span>
            <span>{format(new Date(interrogation.date), "PPP")}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Location:</span>
            <span>{interrogation.location}</span>
          </div>

          {interrogation.detective_score !== null && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Detective Score:</span>
              <span className="font-semibold">
                {interrogation.detective_score}/10
              </span>
            </div>
          )}

          {interrogation.sergeant_score !== null && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Sergeant Score:</span>
              <span className="font-semibold">
                {interrogation.sergeant_score}/10
              </span>
            </div>
          )}

          {interrogation.final_score !== null && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Final Score:</span>
              <span className="font-semibold text-primary">
                {interrogation.final_score}/10
              </span>
            </div>
          )}

          {interrogation.notes && (
            <div className="mt-2 p-2 bg-muted/30 rounded">
              <p className="text-xs font-semibold mb-1">Notes:</p>
              <p className="text-xs text-muted-foreground">
                {interrogation.notes}
              </p>
            </div>
          )}

          {interrogation.review_notes && (
            <div className="mt-2 border-l-2 pl-2 border-primary/50">
              <p className="text-xs font-semibold">Captain's Review:</p>
              <p className="text-xs text-muted-foreground">
                {interrogation.review_notes}
              </p>
            </div>
          )}
        </div>
      </CardContent>

      <CardFooter className="flex justify-end gap-2 pt-0">
        {canScore && (
          <Dialog open={scoreDialogOpen} onOpenChange={setScoreDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm">Submit Score</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Submit Interrogation Score</DialogTitle>
                <DialogDescription>
                  Rate the suspect's guilt on a scale of 1-10.
                  {userRole === "Detective"
                    ? " Your score will be combined with the Sergeant's."
                    : " Your score will be combined with the Detective's."}
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label>Score (1-10)</Label>
                  <Input
                    type="number"
                    min="1"
                    max="10"
                    value={score}
                    onChange={(e) => setScore(e.target.value)}
                    placeholder="Enter score"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button onClick={handleScoreSubmit} disabled={!score}>
                  Submit
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}

        {canReview && (
          <Dialog open={reviewDialogOpen} onOpenChange={setReviewDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm">Review Interrogation</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Captain's Review</DialogTitle>
                <DialogDescription>
                  Review the interrogation results and provide a final verdict.
                  {isCriticalCrime && (
                    <span className="block mt-1 text-orange-500">
                      This is a CRITICAL crime. Your decision will be final.
                    </span>
                  )}
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label>
                    Detective Score: {interrogation.detective_score}/10
                  </Label>
                  <Label>
                    Sergeant Score: {interrogation.sergeant_score}/10
                  </Label>
                </div>
                <div className="grid gap-2">
                  <Label>Your Final Score (1-10) *</Label>
                  <Input
                    type="number"
                    min="1"
                    max="10"
                    value={reviewScore}
                    onChange={(e) => setReviewScore(e.target.value)}
                    placeholder="Enter final score"
                  />
                </div>
                <div className="grid gap-2">
                  <Label>Review Notes</Label>
                  <Textarea
                    value={reviewNotes}
                    onChange={(e) => setReviewNotes(e.target.value)}
                    placeholder="Add your comments and reasoning..."
                    rows={4}
                  />
                </div>
              </div>
              <DialogFooter className="gap-2">
                {isCriticalCrime ? (
                  <>
                    <Button
                      variant="destructive"
                      onClick={() => handleReviewSubmit(false)}
                      disabled={!reviewScore}
                    >
                      Reject & Mark Innocent
                    </Button>
                    <Button
                      onClick={() => handleReviewSubmit(true)}
                      disabled={!reviewScore}
                    >
                      Approve & Convict
                    </Button>
                  </>
                ) : (
                  <Button
                    onClick={() => handleReviewSubmit(true)}
                    disabled={!reviewScore}
                  >
                    Submit Review
                  </Button>
                )}
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </CardFooter>
    </Card>
  );
}
