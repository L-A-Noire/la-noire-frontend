import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { createReport } from "@/api/reward-reports";
import type { Suspect } from "@/types/suspect.type";
import { HugeiconsIcon } from "@hugeicons/react";
import { Add01Icon } from "@hugeicons/core-free-icons";
import { toast } from "react-toastify";

interface ReportTipDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  suspect: Suspect;
}

export function ReportTipDialog({
  open,
  onOpenChange,
  suspect,
}: ReportTipDialogProps) {
  const [description, setDescription] = useState("");
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: () =>
      createReport({
        suspect: suspect.id,
        description: description.trim(),
      }),
    onSuccess: () => {
      toast.success("Tip submitted successfully. Police will review your report.");
      setDescription("");
      onOpenChange(false);
      queryClient.invalidateQueries({ queryKey: ["wanted-suspects"] });
      queryClient.invalidateQueries({ queryKey: ["reward-reports"] });
    },
    onError: () => {
      toast.error("Failed to submit tip. Please try again.");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) {
      toast.error("Please provide a description of your tip.");
      return;
    }
    if (description.trim().length < 10) {
      toast.error("Please provide more details (at least 10 characters).");
      return;
    }
    createMutation.mutate();
  };

  const handleClose = () => {
    if (!createMutation.isPending) {
      setDescription("");
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold">
            Report Tip — {suspect.name}
          </DialogTitle>
          <DialogDescription>
            Provide information about this wanted suspect. Your tip will be
            reviewed by a police officer, then a detective. If approved, you may
            be eligible for a reward.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="tip-description">
              Your Tip <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="tip-description"
              placeholder="Describe what you know: location, time, circumstances, or any other relevant information..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="min-h-[120px] resize-none"
              disabled={createMutation.isPending}
              maxLength={2000}
            />
            <p className="text-xs text-muted-foreground">
              {description.length}/2000 characters
            </p>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={createMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={
                createMutation.isPending ||
                !description.trim() ||
                description.trim().length < 10
              }
            >
              <HugeiconsIcon icon={Add01Icon} className="mr-2 h-4 w-4" />
              {createMutation.isPending ? "Submitting..." : "Submit Tip"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
