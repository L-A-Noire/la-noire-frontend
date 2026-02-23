import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Node, Edge } from "@xyflow/react";

interface DetectiveBoardState {
  boards: Record<string, { nodes: Node[]; edges: Edge[] }>;
  updateBoard: (caseId: string, nodes: Node[], edges: Edge[]) => void;
  getBoard: (caseId: string) => { nodes: Node[]; edges: Edge[] } | undefined;
}

export const useDetectiveBoardStore = create<DetectiveBoardState>()(
  persist(
    (set, get) => ({
      boards: {},
      updateBoard: (caseId, nodes, edges) =>
        set((state) => ({
          boards: {
            ...state.boards,
            [caseId]: { nodes, edges },
          },
        })),
      getBoard: (caseId) => get().boards[caseId],
    }),
    {
      name: "detective-board-storage",
    },
  ),
);
