import { useDetectiveBoardStore } from "@/stores/detective-board.store";

const mockNodes = [
  { id: "node-1", position: { x: 0, y: 0 }, data: { label: "Suspect A" } },
  { id: "node-2", position: { x: 200, y: 100 }, data: { label: "Evidence B" } },
];

const mockEdges = [{ id: "edge-1", source: "node-1", target: "node-2" }];

describe("useDetectiveBoardStore", () => {
  beforeEach(() => {
    useDetectiveBoardStore.setState({ boards: {} });
  });

  it("should start with empty boards", () => {
    const { boards } = useDetectiveBoardStore.getState();
    expect(boards).toEqual({});
  });

  it("should return undefined for non-existent board", () => {
    const board = useDetectiveBoardStore.getState().getBoard("case-999");
    expect(board).toBeUndefined();
  });

  it("should save a board for a case", () => {
    useDetectiveBoardStore
      .getState()
      .updateBoard("case-1", mockNodes as any, mockEdges as any);

    const board = useDetectiveBoardStore.getState().getBoard("case-1");
    expect(board).toBeDefined();
    expect(board!.nodes).toHaveLength(2);
    expect(board!.edges).toHaveLength(1);
    expect(board!.nodes[0].data.label).toBe("Suspect A");
  });

  it("should update an existing board without affecting others", () => {
    const store = useDetectiveBoardStore.getState();
    store.updateBoard("case-1", mockNodes as any, mockEdges as any);
    store.updateBoard("case-2", [] as any, [] as any);

    const updatedNodes = [
      { id: "node-3", position: { x: 50, y: 50 }, data: { label: "New Lead" } },
    ];
    useDetectiveBoardStore
      .getState()
      .updateBoard("case-1", updatedNodes as any, []);

    const board1 = useDetectiveBoardStore.getState().getBoard("case-1");
    const board2 = useDetectiveBoardStore.getState().getBoard("case-2");

    expect(board1!.nodes).toHaveLength(1);
    expect(board1!.nodes[0].data.label).toBe("New Lead");
    expect(board2).toBeDefined();
  });

  it("should manage multiple case boards independently", () => {
    const store = useDetectiveBoardStore.getState();

    store.updateBoard("homicide-42", mockNodes as any, mockEdges as any);
    store.updateBoard("robbery-7", [mockNodes[0]] as any, []);

    const homicide = useDetectiveBoardStore.getState().getBoard("homicide-42");
    const robbery = useDetectiveBoardStore.getState().getBoard("robbery-7");

    expect(homicide!.nodes).toHaveLength(2);
    expect(homicide!.edges).toHaveLength(1);
    expect(robbery!.nodes).toHaveLength(1);
    expect(robbery!.edges).toHaveLength(0);
  });
});
