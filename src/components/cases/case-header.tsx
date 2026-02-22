import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { HugeiconsIcon } from "@hugeicons/react";
import { Add01Icon } from "@hugeicons/core-free-icons";

interface CaseHeaderProps {
  title: string;
  description?: string;
  showCreateButton?: boolean;
}

export const CaseHeader = ({
  title,
  description,
  showCreateButton = true,
}: CaseHeaderProps) => {
  const navigate = useNavigate();

  return (
    <div className="flex justify-between items-center">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
        {description && (
          <p className="text-muted-foreground mt-1">{description}</p>
        )}
      </div>

      {showCreateButton && (
        <Button onClick={() => navigate("/cases/new")}>
          <HugeiconsIcon icon={Add01Icon} className="mr-2 h-4 w-4" />
          Create Case
        </Button>
      )}
    </div>
  );
};
