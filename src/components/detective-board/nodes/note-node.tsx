import { Handle, Position, useReactFlow } from "@xyflow/react";
import type { NodeProps } from "@xyflow/react";
import { Textarea } from "@/components/ui/textarea";
import { useCallback, useState } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { Cancel01Icon } from "@hugeicons/core-free-icons";

export function NoteNode({ data, id }: NodeProps) {
  const { deleteElements } = useReactFlow();
  const [label, setLabel] = useState(data.label as string);

  const onChange = useCallback(
    (evt: React.ChangeEvent<HTMLTextAreaElement>) => {
      setLabel(evt.target.value);
    },
    [],
  );

  const onDelete = useCallback(() => {
    deleteElements({ nodes: [{ id }] });
  }, [id, deleteElements]);

  return (
    <div
      className={`relative group w-[200px] h-[200px] bg-yellow-200 shadow-xl rotate-[-2deg] transition-transform hover:scale-105 hover:z-50 p-4 border border-yellow-300 dark:border-yellow-700 rounded-sm`}
    >
      <button
        onClick={onDelete}
        className="absolute -top-2 -right-2 bg-primary text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-primary/90 z-20"
      >
        <HugeiconsIcon icon={Cancel01Icon} className="size-3" />
      </button>

      <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-primary/20 blur-sm pointer-events-none" />
      <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-primary shadow-sm border border-primary z-10" />

      <Textarea
        defaultValue={label}
        onChange={onChange}
        className="nodrag w-full h-full bg-transparent border-none resize-none text-stone-900 font-handwriting text-lg focus-visible:ring-0 p-0 placeholder:text-stone-500/50"
        placeholder="Type a note..."
      />

      {/* Connection Handles */}
      <Handle
        type="source"
        position={Position.Top}
        className="!bg-primary !w-3 !h-3 !border-2 !border-white dark:!border-zinc-900 !-top-1.5 opacity-0 group-hover:opacity-100 transition-opacity"
      />
      <Handle
        type="target"
        position={Position.Bottom}
        className="!bg-primary !w-3 !h-3 !border-2 !border-white dark:!border-zinc-900 !-bottom-1.5 opacity-0 group-hover:opacity-100 transition-opacity"
      />
      <Handle
        type="source"
        position={Position.Left}
        id="l"
        className="!bg-primary !w-3 !h-3 !border-2 !border-white dark:!border-zinc-900 !-left-1.5 opacity-0 group-hover:opacity-100 transition-opacity"
      />
      <Handle
        type="source"
        position={Position.Right}
        id="r"
        className="!bg-primary !w-3 !h-3 !border-2 !border-white dark:!border-zinc-900 !-right-1.5 opacity-0 group-hover:opacity-100 transition-opacity"
      />
    </div>
  );
}
