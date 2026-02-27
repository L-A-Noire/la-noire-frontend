// src/components/interrogations/interrogation-list.tsx
import { useQuery } from "@tanstack/react-query";
import { getCaseInterrogations } from "@/api/interrogations";
import { getCaseById } from "@/api/cases";
import { InterrogationCard } from "./interrogation-card";
import { CreateInterrogationDialog } from "./create-interrogation-dialog";
import { useAuthStore } from "@/stores/auth.store";
import { Separator } from "@/components/ui/separator";

interface InterrogationListProps {
  caseId: number;
}

export function InterrogationList({ caseId }: InterrogationListProps) {
  const { session } = useAuthStore();
  const userRole = session?.user?.role_title;

  // Get case details to check crime level
  const { data: caseDetails } = useQuery({
    queryKey: ["case", caseId],
    queryFn: () => getCaseById(caseId),
  });

  const { data: interrogations, isLoading } = useQuery({
    queryKey: ["interrogations", caseId],
    queryFn: () => getCaseInterrogations(caseId),
  });

  const isCaptain = userRole === "Captain" || userRole === "Chief" || userRole === "Administrator";
  const isDetectiveOrSergeant = userRole === "Detective" || userRole === "Sergent";

  // Check if crime level is critical (level 4)
  const isCriticalCrime = caseDetails?.crime_details?.level === "4";

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Interrogations</h3>
        {isDetectiveOrSergeant && <CreateInterrogationDialog caseId={caseId} />}
      </div>
      <Separator />

      {isLoading ? (
        <div className="text-muted-foreground text-sm">Loading interrogations...</div>
      ) : interrogations && interrogations.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {interrogations.map((interrogation) => (
            <InterrogationCard
              key={interrogation.id}
              interrogation={interrogation}
              isCaptain={isCaptain}
              isDetectiveOrSergeant={isDetectiveOrSergeant}
              isCriticalCrime={isCriticalCrime}
            />
          ))}
        </div>
      ) : (
        <div className="text-muted-foreground text-sm py-8 text-center border rounded-lg border-dashed">
          No interrogations recorded yet.
          {isDetectiveOrSergeant && (
            <p className="mt-2">
              Add wanted suspects to start interrogations.
            </p>
          )}
        </div>
      )}
    </div>
  );
}