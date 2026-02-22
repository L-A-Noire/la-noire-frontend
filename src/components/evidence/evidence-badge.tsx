import { Badge } from "@/components/ui/badge";
import type { EvidenceType } from "@/types/evidence.type";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  User02Icon,
  DropletIcon,
  VanIcon,
  UserIcon,
  Package01Icon,
} from "@hugeicons/core-free-icons";

interface EvidenceBadgeProps {
  type: EvidenceType;
  count?: number;
}

const evidenceConfig: Record<
  EvidenceType,
  { label: string; color: string; icon: any }
> = {
  witness_testimony: {
    label: "Witness Testimony",
    color: "bg-sky-100 text-sky-800 dark:bg-sky-900/30 dark:text-sky-400",
    icon: User02Icon,
  },
  forensic: {
    label: "Forensic",
    color:
      "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400",
    icon: DropletIcon,
  },
  vehicle: {
    label: "Vehicle",
    color:
      "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400",
    icon: VanIcon,
  },
  identification: {
    label: "Identification",
    color:
      "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
    icon: UserIcon,
  },
  other: {
    label: "Other",
    color: "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400",
    icon: Package01Icon,
  },
};

export const EvidenceBadge = ({ type, count }: EvidenceBadgeProps) => {
  const config = evidenceConfig[type];

  return (
    <Badge
      variant="outline"
      className={`${config.color} flex items-center gap-1.5`}
    >
      <HugeiconsIcon icon={config.icon} className="h-3.5 w-3.5" />
      <span>{config.label}</span>
      {count !== undefined && <span className="font-semibold">({count})</span>}
    </Badge>
  );
};
