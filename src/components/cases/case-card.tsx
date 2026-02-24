import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  TimelineEventIcon,
  Delete02Icon,
  Document,
  UserAddIcon,
} from "@hugeicons/core-free-icons";
import type { CaseList } from "@/types/case.type";
import { useAuthStore } from "@/stores/auth.store";

interface CaseCardProps {
  caseItem: CaseList;
  onClose?: (caseId: number) => void;
  isClosing?: boolean;
}

export const CaseCard = ({ caseItem, onClose, isClosing }: CaseCardProps) => {
  const { session } = useAuthStore();
  const isOpen = !caseItem.is_closed;
  const isDetective = session?.user.role_title === "Detective";

  return (
    <Card
      className={`relative overflow-hidden transition-shadow ${
        isOpen ? "hover:shadow-md" : "opacity-80"
      }`}
    >
      <div className="absolute top-4 right-4">
        <Badge
          className={
            isOpen
              ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
              : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
          }
          variant={isOpen ? "outline" : "destructive"}
        >
          {isOpen ? "Open" : "Closed"}
        </Badge>
      </div>

      <CardHeader>
        <CardTitle className="pr-12 truncate">
          <Link
            to={`/cases/${caseItem.id}`}
            className="hover:underline hover:text-primary transition-colors"
          >
            {caseItem.crime_title || `Case #${caseItem.id}`}
          </Link>
        </CardTitle>
        <CardDescription>
          Created: {format(new Date(caseItem.created_at), "PPP")}
        </CardDescription>
      </CardHeader>

      <CardContent>
        <div className="space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Detective:</span>
            <span className="font-medium">
              {caseItem.detective_name || "Unassigned"}
            </span>
          </div>

          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Crime Scene:</span>
            <Badge
              variant={caseItem.is_from_crime_scene ? "secondary" : "outline"}
            >
              {caseItem.is_from_crime_scene ? "Yes" : "No"}
            </Badge>
          </div>

          <div className="pt-4 flex justify-end gap-2 border-t mt-4">
            <Button variant="outline" size="sm" asChild>
              <Link to={`/cases/${caseItem.id}/evidence`}>
                <HugeiconsIcon icon={Document} className="mr-2 h-4 w-4" />
                Evidence
              </Link>
            </Button>

            <Button variant="outline" size="sm" asChild>
              <Link to={`/cases/${caseItem.id}/timeline`}>
                <HugeiconsIcon
                  icon={TimelineEventIcon}
                  className="mr-2 h-4 w-4"
                />
                Timeline
              </Link>
            </Button>

            {/* Add Suspect button - only for detectives */}
            {isOpen && isDetective && (
              <Button variant="outline" size="sm" asChild>
                <Link to={`/cases/${caseItem.id}/suspects/add`}>
                  <HugeiconsIcon icon={UserAddIcon} className="mr-2 h-4 w-4" />
                  Add Suspect
                </Link>
              </Button>
            )}

            {isOpen && onClose && (
              <Button
                variant="outline"
                size="sm"
                className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/20 border-red-200 dark:border-red-900"
                onClick={() => {
                  if (confirm("Are you sure you want to close this case?")) {
                    onClose(caseItem.id);
                  }
                }}
                disabled={isClosing}
              >
                <HugeiconsIcon icon={Delete02Icon} className="mr-2 h-4 w-4" />
                Close
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
