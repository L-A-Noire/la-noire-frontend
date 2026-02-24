import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
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
  isCriticalCrime: boolean; // Passed from parent based on Case logic
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
  const [captainScore, setCaptainScore] = useState<string>("");
  const [reviewNotes, setReviewNotes] = useState("");
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
  const [scoreDialogOpen, setScoreDialogOpen] = useState(false);

  // Status Badge Logic
  const getStatusBadge = (status: Interrogation["status"]) => {
    switch (status) {
      case "pending_score":
        return <Badge variant="secondary">Pending Score</Badge>;
      case "pending_review":
        return <Badge className="bg-orange-500">Pending Review</Badge>;
      case "completed":
        return <Badge className="bg-green-600">Completed</Badge>;
      case "rejected":
        return <Badge variant="destructive">Rejected</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const submitScoreMutation = useMutation({
    mutationFn: (data: { score: number }) =>
      submitInterrogationScore(interrogation.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["interrogations", interrogation.case],
      });
      setScoreDialogOpen(false);
      toast.success("Score submitted successfully");
    },
    onError: () => toast.error("Failed to submit score"),
  });

  const reviewMutation = useMutation({
    mutationFn: (data: {
      captain_score: number;
      notes: string;
      is_approved: boolean;
    }) => reviewInterrogation(interrogation.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["interrogations", interrogation.case],
      });
      setReviewDialogOpen(false);
      toast.success("Review submitted successfully");
    },
    onError: () => toast.error("Failed to submit review"),
  });

  const canScore =
    isDetectiveOrSergeant &&
    interrogation.status === "pending_score" &&
    interrogation.interrogator === session?.user?.id;
  const canReview = isCaptain && interrogation.status === "pending_review";

  const handleScoreSubmit = () => {
    const numScore = Number(score);
    if (isNaN(numScore) || numScore < 0 || numScore > 100) {
      toast.error("Please enter a valid score (0-100)");
      return;
    }
    submitScoreMutation.mutate({ score: numScore });
  };

  const handleReviewSubmit = (approved: boolean) => {
    const numScore = Number(captainScore);
    if (isNaN(numScore) || numScore < 0 || numScore > 100) {
      toast.error("Please enter a valid score (0-100)");
      return;
    }
    reviewMutation.mutate({
      captain_score: numScore,
      notes: reviewNotes,
      is_approved: approved,
    });
  };

  return (
    <Card className="mb-4">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle>{interrogation.suspect_name}</CardTitle>
            <CardDescription>
              Interrogated match by {interrogation.interrogator_name} (
              {interrogation.interrogator_role})
            </CardDescription>
          </div>
          {getStatusBadge(interrogation.status)}
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid gap-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Date:</span>
            <span>{format(new Date(interrogation.created_at), "PPP")}</span>
          </div>
          {interrogation.score !== null && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Interrogator Score:</span>
              <span className="font-semibold">{interrogation.score}/100</span>
            </div>
          )}
          {interrogation.captain_score !== null && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Captain Score:</span>
              <span className="font-semibold text-primary">
                {interrogation.captain_score}/100
              </span>
            </div>
          )}
          {interrogation.notes && (
            <div className="mt-2 text-muted-foreground italic">
              "{interrogation.notes}"
            </div>
          )}
          {interrogation.captain_notes && (
            <div className="mt-2 border-l-2 pl-2 border-primary/50 text-xs">
              <strong>Captain's Review:</strong> {interrogation.captain_notes}
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
                  Rate the suspect's cooperation and likelihood of guilt based
                  on your interrogation.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label>Score (0-100)</Label>
                  <Input
                    type="number"
                    min="0"
                    max="100"
                    value={score}
                    onChange={(e) => setScore(e.target.value)}
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
                  Review the interrogation results and provide a final score.
                  {isCriticalCrime &&
                    " This is a CRITICAL crime. Your decision will be final approval."}
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label>Final Score (0-100)</Label>
                  <Input
                    type="number"
                    min="0"
                    max="100"
                    value={captainScore}
                    onChange={(e) => setCaptainScore(e.target.value)}
                  />
                </div>
                <div className="grid gap-2">
                  <Label>Review Notes</Label>
                  <Textarea
                    value={reviewNotes}
                    onChange={(e) => setReviewNotes(e.target.value)}
                    placeholder="Add your comments..."
                  />
                </div>
              </div>
              <DialogFooter>
                {isCriticalCrime ? (
                  <>
                    <Button
                      variant="destructive"
                      onClick={() => handleReviewSubmit(false)}
                    >
                      Reject
                    </Button>
                    <Button onClick={() => handleReviewSubmit(true)}>
                      Approve & Finalize
                    </Button>
                  </>
                ) : (
                  <Button onClick={() => handleReviewSubmit(true)}>
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
