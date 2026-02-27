// import { useState } from "react";
// import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
// import {
//   Dialog,
//   DialogContent,
//   DialogHeader,
//   DialogTitle,
//   DialogDescription,
//   DialogFooter,
//   DialogTrigger,
// } from "@/components/ui/dialog";
// import { Button } from "@/components/ui/button";
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import { Textarea } from "@/components/ui/textarea";
// import { Badge } from "@/components/ui/badge";
// import { getSuspectsByCaseDirect } from "@/api/suspect";
// import { createInterrogation } from "@/api/interrogations";
// import { useAuthStore } from "@/stores/auth.store";
// import { toast } from "react-toastify";
// import { Add01Icon } from "@hugeicons/core-free-icons";
// import { HugeiconsIcon } from "@hugeicons/react";

// interface CreateInterrogationDialogProps {
//   caseId: number;
// }

// export function CreateInterrogationDialog({
//   caseId,
// }: CreateInterrogationDialogProps) {
//   const [open, setOpen] = useState(false);
//   const [selectedSuspectId, setSelectedSuspectId] = useState<string>("");
//   const [location, setLocation] = useState("");
//   const [notes, setNotes] = useState("");
//   const { session } = useAuthStore();
//   const queryClient = useQueryClient();

//   // Get suspects for this case with status = wanted or most_wanted
//   const { data: suspects, isLoading: isLoadingSuspects } = useQuery({
//     queryKey: ["suspects", "case", caseId, "interrogatable"],
//     queryFn: () => getSuspectsByCaseDirect(caseId),
//     enabled: open, // Only fetch when dialog is open
//   });

//   // Filter suspects to only show wanted or most_wanted
//   const interrogatableSuspects = suspects?.filter(
//     (suspect) => suspect.status === "wanted" || suspect.status === "most_wanted"
//   );

//   const createMutation = useMutation({
//     mutationFn: createInterrogation,
//     onSuccess: () => {
//       queryClient.invalidateQueries({ queryKey: ["interrogations", caseId] });
//       queryClient.invalidateQueries({ queryKey: ["suspects", "case", caseId] });
//       setOpen(false);
//       resetForm();
//       toast.success("Interrogation started successfully");
//     },
//     onError: (error: any) => {
//       console.error("Error starting interrogation:", error);
//       toast.error(error.response?.data?.message || "Failed to start interrogation");
//     },
//   });

//   const handleSubmit = () => {
//     if (!selectedSuspectId || !location) {
//       toast.error("Please select a suspect and enter a location");
//       return;
//     }

//     // Get current user ID
//     const currentUserId = session?.user.id;
//     if (!currentUserId) {
//       toast.error("You must be logged in");
//       return;
//     }

//     // For now, we need another interrogator (a partner)
//     // In a real app, you'd select this from a list
//     // This is a simplified version - you might want to add a second select
//     const otherInterrogatorId = currentUserId; // This should be different in production

//     createMutation.mutate({
//       suspect: Number(selectedSuspectId),
//       case: caseId,
//       location,
//       notes,
//       interrogator_ids: [currentUserId, otherInterrogatorId],
//     });
//   };

//   const resetForm = () => {
//     setSelectedSuspectId("");
//     setLocation("");
//     setNotes("");
//   };

//   return (
//     <Dialog open={open} onOpenChange={setOpen}>
//       <DialogTrigger asChild>
//         <Button className="gap-2">
//           <HugeiconsIcon icon={Add01Icon} size={16} />
//           Interrogate Suspect
//         </Button>
//       </DialogTrigger>
//       <DialogContent className="max-w-2xl">
//         <DialogHeader>
//           <DialogTitle>Start New Interrogation</DialogTitle>
//           <DialogDescription>
//             Select a wanted suspect to interrogate. This will change their status to "arrested".
//           </DialogDescription>
//         </DialogHeader>
//         <div className="grid gap-4 py-4">
//           <div className="grid gap-2">
//             <Label htmlFor="suspect">Suspect *</Label>
//             <Select
//               value={selectedSuspectId}
//               onValueChange={setSelectedSuspectId}
//             >
//               <SelectTrigger>
//                 <SelectValue placeholder="Select suspect" />
//               </SelectTrigger>
//               <SelectContent>
//                 {isLoadingSuspects ? (
//                   <SelectItem value="loading" disabled>
//                     Loading suspects...
//                   </SelectItem>
//                 ) : !interrogatableSuspects || interrogatableSuspects.length === 0 ? (
//                   <SelectItem value="none" disabled>
//                     No wanted suspects available
//                   </SelectItem>
//                 ) : (
//                   interrogatableSuspects.map((suspect) => (
//                     <SelectItem key={suspect.id} value={String(suspect.id)}>
//                       <div className="flex items-center gap-2">
//                         <span>{suspect.name}</span>
//                         {suspect.nickname && (
//                           <span className="text-xs text-muted-foreground">
//                             (AKA: {suspect.nickname})
//                           </span>
//                         )}
//                         <Badge
//                           variant="outline"
//                           className={
//                             suspect.status === "most_wanted"
//                               ? "bg-red-100 text-red-800"
//                               : "bg-orange-100 text-orange-800"
//                           }
//                         >
//                           {suspect.status}
//                         </Badge>
//                       </div>
//                     </SelectItem>
//                   ))
//                 )}
//               </SelectContent>
//             </Select>
//             <p className="text-xs text-muted-foreground">
//               Only suspects with "wanted" or "most_wanted" status can be interrogated
//             </p>
//           </div>

//           <div className="grid gap-2">
//             <Label htmlFor="location">Interrogation Location *</Label>
//             <Input
//               id="location"
//               value={location}
//               onChange={(e) => setLocation(e.target.value)}
//               placeholder="e.g., Interview Room 1, Police Station"
//             />
//           </div>

//           <div className="grid gap-2">
//             <Label htmlFor="notes">Initial Notes</Label>
//             <Textarea
//               id="notes"
//               value={notes}
//               onChange={(e) => setNotes(e.target.value)}
//               placeholder="Enter context, reason for interrogation, or initial observations..."
//               rows={4}
//             />
//           </div>
//         </div>
//         <DialogFooter>
//           <Button variant="outline" onClick={() => setOpen(false)}>
//             Cancel
//           </Button>
//           <Button
//             onClick={handleSubmit}
//             disabled={!selectedSuspectId || !location || createMutation.isPending}
//           >
//             {createMutation.isPending ? "Starting..." : "Start Interrogation"}
//           </Button>
//         </DialogFooter>
//       </DialogContent>
//     </Dialog>
//   );
// }

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  getSuspectsByCaseDirect,
  getSuspectCrimeBySuspectAndCase,
} from "@/api/suspect";
import { getCaseById } from "@/api/cases";
import { createInterrogation } from "@/api/interrogations";
import { toast } from "react-toastify";
import { Add01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

interface CreateInterrogationDialogProps {
  caseId: number;
}

interface ErrorResponse {
  message?: string;
}

export function CreateInterrogationDialog({
  caseId,
}: CreateInterrogationDialogProps) {
  const [open, setOpen] = useState(false);
  const [selectedSuspectId, setSelectedSuspectId] = useState<string>("");
  const [location, setLocation] = useState("");
  const [notes, setNotes] = useState("");
  const queryClient = useQueryClient();

  // Get case details to get crime ID
  const { data: caseDetails, isLoading: isLoadingCase } = useQuery({
    queryKey: ["case", caseId],
    queryFn: () => getCaseById(caseId),
    enabled: open,
  });

  const crimeId = caseDetails?.crime;

  // Get suspects for this case with status = wanted or most_wanted
  const { data: suspects, isLoading: isLoadingSuspects } = useQuery({
    queryKey: ["suspects", "case", caseId, "interrogatable"],
    queryFn: () => getSuspectsByCaseDirect(caseId),
    enabled: open && !!crimeId,
  });

  // Filter suspects to only show wanted or most_wanted
  const interrogatableSuspects = suspects?.filter(
    (suspect) =>
      suspect.status === "wanted" || suspect.status === "most_wanted",
  );

  const createMutation = useMutation({
    mutationFn: async () => {
      if (!crimeId) {
        throw new Error("Case has no associated crime");
      }

      // Get the suspect-crime ID using suspect and crime IDs
      const suspectCrime = await getSuspectCrimeBySuspectAndCase(
        Number(selectedSuspectId),
        caseId,
      );

      if (!suspectCrime) {
        throw new Error("Suspect is not linked to this case's crime");
      }

      // Create the interrogation with suspect_crime ID
      return createInterrogation({
        suspect_crime: suspectCrime.id,
        case: caseId,
        location,
        notes,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["interrogations", caseId] });
      queryClient.invalidateQueries({ queryKey: ["suspects", "case", caseId] });
      setOpen(false);
      resetForm();
      toast.success("Interrogation started successfully");
    },
    onError: (error: AxiosError<ErrorResponse>) => {
      console.error("Error starting interrogation:", error);
      toast.error(
        error.response?.data?.message ||
          error.message ||
          "Failed to start interrogation",
      );
    },
  });

  const handleSubmit = () => {
    if (!selectedSuspectId) {
      toast.error("Please select a suspect");
      return;
    }

    if (!location) {
      toast.error("Please enter an interrogation location");
      return;
    }

    if (!crimeId) {
      toast.error("Case has no associated crime");
      return;
    }

    createMutation.mutate();
  };

  const resetForm = () => {
    setSelectedSuspectId("");
    setLocation("");
    setNotes("");
  };

  const isLoading = isLoadingCase || isLoadingSuspects;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <HugeiconsIcon icon={Add01Icon} size={16} />
          Interrogate Suspect
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Start New Interrogation</DialogTitle>
          <DialogDescription>
            Select a wanted suspect to interrogate. This will change their
            status to "arrested".
          </DialogDescription>
          {crimeId && (
            <p className="text-xs text-muted-foreground mt-1">
              Crime ID: {crimeId}
            </p>
          )}
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="suspect">Suspect *</Label>
            <Select
              value={selectedSuspectId}
              onValueChange={setSelectedSuspectId}
              disabled={isLoading || !crimeId}
            >
              <SelectTrigger>
                <SelectValue
                  placeholder={isLoading ? "Loading..." : "Select suspect"}
                />
              </SelectTrigger>
              <SelectContent>
                {isLoading ? (
                  <SelectItem value="loading" disabled>
                    Loading suspects...
                  </SelectItem>
                ) : !interrogatableSuspects ||
                  interrogatableSuspects.length === 0 ? (
                  <SelectItem value="none" disabled>
                    No wanted suspects available
                  </SelectItem>
                ) : (
                  interrogatableSuspects.map((suspect) => (
                    <SelectItem key={suspect.id} value={String(suspect.id)}>
                      <div className="flex items-center gap-2">
                        <span>{suspect.name}</span>
                        {suspect.nickname && (
                          <span className="text-xs text-muted-foreground">
                            (AKA: {suspect.nickname})
                          </span>
                        )}
                        <Badge
                          variant="outline"
                          className={
                            suspect.status === "most_wanted"
                              ? "bg-red-100 text-red-800"
                              : "bg-orange-100 text-orange-800"
                          }
                        >
                          {suspect.status}
                        </Badge>
                      </div>
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Only suspects with "wanted" or "most_wanted" status can be
              interrogated
            </p>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="location">Interrogation Location *</Label>
            <Input
              id="location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g., Interview Room 1, Police Station"
              disabled={createMutation.isPending}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="notes">Initial Notes</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Enter context, reason for interrogation, or initial observations..."
              rows={4}
              disabled={createMutation.isPending}
            />
          </div>
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={createMutation.isPending}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={
              !selectedSuspectId ||
              !location ||
              createMutation.isPending ||
              !crimeId
            }
          >
            {createMutation.isPending ? "Starting..." : "Start Interrogation"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
