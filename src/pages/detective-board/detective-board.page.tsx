import { useCallback, useEffect, useRef, useState } from "react";
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  Panel,
  ReactFlowProvider,
  getNodesBounds,
} from "@xyflow/react";
import type { Connection } from "@xyflow/react";
import type { Node as ReactFlowNode, Edge } from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { toPng } from "html-to-image";
import { useQuery } from "@tanstack/react-query";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import {
  getTestimonies,
  getBiologicalEvidences,
  getVehicleEvidences,
  getOtherEvidences,
  getIdentificationEvidences,
} from "@/api/evidence";
import { getCases } from "@/api/cases";
import { useDetectiveBoardStore } from "@/stores/detective-board.store";
import { EvidenceNode } from "@/components/detective-board/nodes/evidence-node";
import { NoteNode } from "@/components/detective-board/nodes/note-node";
import {
  Camera01Icon,
  Note01Icon,
  FileEditIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { toast } from "react-toastify";

// Custom node types
const nodeTypes = {
  evidence: EvidenceNode,
  note: NoteNode,
};

const defaultEdgeOptions = {
  style: { stroke: "var(--primary)", strokeWidth: 3, opacity: 0.8 },
  type: "straight",
  animated: true,
};

export function DetectiveBoardPage() {
  const { data: cases = [] } = useQuery({
    queryKey: ["cases"],
    queryFn: getCases,
  });

  const [selectedCaseId, setSelectedCaseId] = useState<string | null>(null);

  const { updateBoard, getBoard } = useDetectiveBoardStore();

  // React Flow state
  const [nodes, setNodes, onNodesChange] = useNodesState<ReactFlowNode>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);
  const flowWrapper = useRef<HTMLDivElement>(null);

  const loadBoard = useCallback(
    async (caseId: string) => {
      try {
        // 1. Check store for existing board
        const storedBoard = getBoard(caseId);

        if (storedBoard) {
          setNodes(storedBoard.nodes);
          setEdges(storedBoard.edges);
        } else {
          // 2. If new, fetch evidence and initialize
          const [testimony, bio, vehicle, other, idEv] = await Promise.all([
            getTestimonies(Number(caseId)),
            getBiologicalEvidences(Number(caseId)),
            getVehicleEvidences(Number(caseId)),
            getOtherEvidences(Number(caseId)),
            getIdentificationEvidences(Number(caseId)),
          ]);

          const allEvidence = [
            ...testimony,
            ...bio,
            ...vehicle,
            ...other,
            ...idEv,
          ];

          const initialNodes: ReactFlowNode[] = allEvidence.map(
            (ev, index) => ({
              id: `evidence-${ev.id}`,
              type: "evidence",
              position: {
                x: 100 + (index % 4) * 320,
                y: 100 + Math.floor(index / 4) * 200,
              }, // Grid layout
              data: { evidence: ev },
            }),
          );

          setNodes(initialNodes);
          setEdges([]);
          // Save initial state
          updateBoard(caseId, initialNodes, []);
        }
      } catch (error) {
        console.error("Failed to load evidence", error);
        toast.error("Failed to load case evidence");
      }
    },
    [getBoard, setNodes, setEdges, updateBoard],
  );

  // Sync with store on changes
  useEffect(() => {
    if (selectedCaseId && nodes.length > 0) {
      updateBoard(selectedCaseId, nodes, edges);
    }
  }, [nodes, edges, selectedCaseId, updateBoard]);

  const onConnect = useCallback(
    (params: Connection) =>
      setEdges((eds) =>
        addEdge({ ...params, type: "default", animated: false }, eds),
      ),
    [setEdges],
  );

  const addNote = useCallback(() => {
    const id = `note-${Date.now()}`;
    const newNode: ReactFlowNode = {
      id,
      type: "note",
      position: { x: Math.random() * 400 + 200, y: Math.random() * 400 + 200 },
      data: { label: "New Note" },
    };
    setNodes((nds) => nds.concat(newNode));
  }, [setNodes]);

  const saveImage = useCallback(() => {
    if (flowWrapper.current === null) {
      return;
    }

    const flowElement = document.querySelector(
      ".react-flow__viewport",
    ) as HTMLElement;

    if (!flowElement) return;

    const bounds = getNodesBounds(nodes);
    const padding = 50; // Add padding around the bounds

    toPng(flowElement, {
      width: bounds.width + padding * 2,
      height: bounds.height + padding * 2,
      skipFonts: true,
      style: {
        width: `${bounds.width + padding * 2}px`,
        height: `${bounds.height + padding * 2}px`,
        transform: `translate(${-bounds.x + padding}px, ${-bounds.y + padding}px)`,
      },
    })
      .then((dataUrl) => {
        // Create a link
        const link = document.createElement("a");
        link.download = `case-${selectedCaseId}-board.png`;
        link.href = dataUrl;
        link.click();
        toast.success("Board saved as image!");
      })
      .catch((err) => {
        console.error(err);
        toast.error("Failed to save image");
      });
  }, [selectedCaseId]);

  return (
    <div className="h-[calc(100vh-100px)] flex flex-col gap-4">
      {/* Header / Toolbar */}
      <div className="flex items-center justify-between bg-card p-4 rounded-lg border shadow-sm">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-bold font-serif tracking-tight flex items-center gap-2">
            <HugeiconsIcon icon={FileEditIcon} className="text-primary" />
            Detective Board
          </h1>
          <Select
            onValueChange={(val) => {
              setSelectedCaseId(val);
              loadBoard(val);
            }}
          >
            <SelectTrigger className="w-[300px]">
              <SelectValue placeholder="Select a Case File..." />
            </SelectTrigger>
            <SelectContent>
              {cases.map((c) => (
                <SelectItem key={c.id} value={String(c.id)}>
                  Case #{c.id}
                  {c.crime_title ? `: ${c.crime_title}` : ""}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2">
          <Button
            onClick={addNote}
            variant="outline"
            disabled={!selectedCaseId}
          >
            <HugeiconsIcon icon={Note01Icon} className="mr-2 size-4" /> Add Note
          </Button>
          <Button
            onClick={saveImage}
            variant="default"
            className="bg-primary hover:bg-primary/90"
            disabled={!selectedCaseId}
          >
            <HugeiconsIcon icon={Camera01Icon} className="mr-2 size-4" /> Save
            Evidence
          </Button>
        </div>
      </div>

      {/* Board Area */}
      <div
        className="flex-1 bg-stone-100 dark:bg-stone-900 rounded-xl overflow-hidden border-4 border-stone-300 dark:border-stone-800 shadow-inner relative"
        ref={flowWrapper}
      >
        {!selectedCaseId ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-stone-400">
            <div className="flex flex-col items-center gap-4">
              <HugeiconsIcon
                icon={FileEditIcon}
                className="size-24 opacity-20"
              />
              <div className="text-xl font-serif text-center">
                Select a case file from the options above
                <br />
                to open the evidence board.
              </div>
            </div>
          </div>
        ) : (
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            nodeTypes={nodeTypes}
            defaultEdgeOptions={defaultEdgeOptions}
            fitView
            className="bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px]" // Simple grid fallback
          >
            <Background color="#d6d3d1" gap={24} size={1} />
            <Controls />
            <MiniMap
              zoomable
              pannable
              inversePan
              position="bottom-right"
              className="!bg-background !border-border"
            />
            <Panel
              position="top-left"
              className="bg-background/80 p-2 rounded-md shadow-sm backdrop-blur-sm text-xs border border-border"
            >
              <p className="font-semibold text-muted-foreground">
                Connecting the dots...
              </p>
              <p className="opacity-70">
                Drag nodes to rearrange. Drag red dots to connect evidence.
              </p>
            </Panel>
          </ReactFlow>
        )}
      </div>
    </div>
  );
}

export default function DetectiveBoardPageWrapper() {
  return (
    <ReactFlowProvider>
      <DetectiveBoardPage />
    </ReactFlowProvider>
  );
}
