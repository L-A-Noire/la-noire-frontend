import { useQuery } from "@tanstack/react-query";
import { getCaseInterrogations } from "@/api/interrogations";
import { InterrogationCard } from "./interrogation-card";
import { CreateInterrogationDialog } from "./create-interrogation-dialog";
import { useAuthStore } from "@/stores/auth.store";
import { Separator } from "@/components/ui/separator";

interface InterrogationListProps {
  caseId: number;
  caseLevel?: string; // "Critical" etc.
}

export function InterrogationList({
  caseId,
  caseLevel,
}: InterrogationListProps) {
  const { session } = useAuthStore();
  const userRole = session?.user?.role_title;

  const { data: interrogations, isLoading } = useQuery({
    queryKey: ["interrogations", caseId],
    queryFn: () => getCaseInterrogations(caseId),
  });

  const isCaptain =
    userRole === "Captain" ||
    userRole === "Chief" ||
    userRole === "Administrator";
  const isDetectiveOrSergeant =
    userRole === "Detective" || userRole === "Sergeant";
  const isCritical =
    caseLevel?.toLowerCase() === "critical" ||
    caseLevel?.toLowerCase() === "high"; // Adjust based on actual values

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Interrogations & Suspects</h3>
        {isDetectiveOrSergeant && <CreateInterrogationDialog caseId={caseId} />}
      </div>
      <Separator />

      {isLoading ? (
        <div className="text-muted-foreground text-sm">
          Loading interrogations...
        </div>
      ) : interrogations && interrogations.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {interrogations.map((interrogation) => (
            <InterrogationCard
              key={interrogation.id}
              interrogation={interrogation}
              isCaptain={isCaptain}
              isDetectiveOrSergeant={isDetectiveOrSergeant}
              isCriticalCrime={isCritical}
            />
          ))}
        </div>
      ) : (
        <div className="text-muted-foreground text-sm py-8 text-center border rounded-lg border-dashed">
          No interrogations recorded yet.
        </div>
      )}
    </div>
  );
}
