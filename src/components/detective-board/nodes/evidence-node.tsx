import { Handle, Position } from "@xyflow/react";
import type { NodeProps } from "@xyflow/react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { BaseEvidence } from "@/types/evidence.type";

import {
  FingerPrintIcon,
  Car01Icon,
  InjectionIcon,
  ArchiveIcon,
} from "@hugeicons/core-free-icons";

import { HugeiconsIcon } from "@hugeicons/react";

const getIcon = (evidence: any) => {
  if (evidence.transcription)
    return <HugeiconsIcon icon={ArchiveIcon} className="size-4" />;
  if (evidence.vehicle_model)
    return <HugeiconsIcon icon={Car01Icon} className="size-4" />;
  if (evidence.images)
    return <HugeiconsIcon icon={InjectionIcon} className="size-4" />;
  if (evidence.owner_first_name)
    return <HugeiconsIcon icon={FingerPrintIcon} className="size-4" />;

  return <HugeiconsIcon icon={ArchiveIcon} className="size-4" />;
};

export function EvidenceNode({ data, selected }: NodeProps) {
  const evidence = data.evidence as BaseEvidence;

  return (
    <div className="relative group min-w-[250px] max-w-[300px]">
      <Card
        className={`bg-yellow-50 dark:bg-zinc-800 border-2 shadow-md transition-all duration-200 ${
          selected
            ? "border-primary ring-2 ring-primary/20"
            : "border-stone-300 dark:border-stone-700"
        } rotate-1 hover:rotate-0 hover:z-50 hover:shadow-xl`}
      >
        <CardHeader className="p-3 pb-1 space-y-1">
          <div className="flex items-center justify-between">
            <Badge
              variant="outline"
              className="bg-white/50 dark:bg-black/50 text-[10px] font-mono uppercase tracking-wider"
            >
              #{evidence.id}
            </Badge>
            {getIcon(evidence)}
          </div>

          <CardTitle className="text-sm font-serif font-bold leading-tight pt-1">
            {evidence.title}
          </CardTitle>
        </CardHeader>

        <CardContent className="p-3 pt-2">
          <CardDescription className="line-clamp-3 text-xs font-mono text-stone-600 dark:text-stone-400">
            {evidence.description}
          </CardDescription>
        </CardContent>
      </Card>

      {/* Handles */}
      <Handle
        type="source"
        position={Position.Top}
        className="!bg-red-500 !w-3 !h-3 !border-2 !border-white dark:!border-zinc-900 !-top-1.5 opacity-0 group-hover:opacity-100 transition-opacity"
      />
      <Handle
        type="target"
        position={Position.Bottom}
        className="!bg-red-500 !w-3 !h-3 !border-2 !border-white dark:!border-zinc-900 !-bottom-1.5 opacity-0 group-hover:opacity-100 transition-opacity"
      />
      <Handle
        type="source"
        position={Position.Left}
        id="l"
        className="!bg-red-500 !w-3 !h-3 !border-2 !border-white dark:!border-zinc-900 !-left-1.5 opacity-0 group-hover:opacity-100 transition-opacity"
      />
      <Handle
        type="source"
        position={Position.Right}
        id="r"
        className="!bg-red-500 !w-3 !h-3 !border-2 !border-white dark:!border-zinc-900 !-right-1.5 opacity-0 group-hover:opacity-100 transition-opacity"
      />
    </div>
  );
}
