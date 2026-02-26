import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { getSuspectCrimes } from "@/api/suspect";
import { createInterrogation } from "@/api/interrogations";
import { toast } from "react-toastify";
import { Add01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

interface CreateInterrogationDialogProps {
  caseId: number;
}

export function CreateInterrogationDialog({
  caseId,
}: CreateInterrogationDialogProps) {
  const [open, setOpen] = useState(false);
  const [selectedSuspect, setSelectedSuspect] = useState<string>("");
  const [notes, setNotes] = useState("");
  const queryClient = useQueryClient();

  const { data: suspects, isLoading: isLoadingSuspects } = useQuery({
    queryKey: ["suspect-crimes"],
    queryFn: getSuspectCrimes,
  });

  const createMutation = useMutation({
    mutationFn: createInterrogation,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["interrogations", caseId] });
      setOpen(false);
      resetForm();
      toast.success("Interrogation started successfully");
    },
    onError: () => {
      toast.error("Failed to start interrogation");
    },
  });

  const handleSubmit = () => {
    if (!selectedSuspect) return;
    createMutation.mutate({
      case: caseId,
      suspect: Number(selectedSuspect),
      notes,
    });
  };

  const resetForm = () => {
    setSelectedSuspect("");
    setNotes("");
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <HugeiconsIcon icon={Add01Icon} size={16} />
          Add Suspect to Interrogate
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Start New Interrogation</DialogTitle>
          <DialogDescription>
            Select a suspect to bring in for questioning.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="suspect">Suspect</Label>
            <Select value={selectedSuspect} onValueChange={setSelectedSuspect}>
              <SelectTrigger>
                <SelectValue placeholder="Select suspect" />
              </SelectTrigger>
              <SelectContent>
                {isLoadingSuspects ? (
                  <SelectItem value="loading" disabled>
                    Loading suspects...
                  </SelectItem>
                ) : (
                  suspects?.map((suspect) => (
                    <SelectItem key={suspect.id} value={String(suspect.id)}>
                      {suspect.suspect_details?.first_name}{" "}
                      {suspect.suspect_details?.last_name} (
                      {suspect.suspect_details?.national_id})
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="notes">Initial Notes</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Enter context or reason for interrogation..."
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!selectedSuspect || createMutation.isPending}
          >
            {createMutation.isPending ? "Starting..." : "Start Interrogation"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
