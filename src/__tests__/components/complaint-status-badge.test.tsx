import { render, screen } from "@testing-library/react";
import { ComplaintStatusBadge } from "@/components/complaints/complaint-status-badge";
import type { ComplaintStatus } from "@/types/complaint.type";

const statusLabels: Record<ComplaintStatus, string> = {
  pending_cadet: "Pending Cadet Review",
  rejected_by_cadet: "Rejected by Cadet",
  pending_officer: "Pending Officer Review",
  rejected_by_officer: "Rejected by Officer",
  approved: "Approved",
  invalid: "Invalid",
};

describe("ComplaintStatusBadge", () => {
  it.each(Object.entries(statusLabels))(
    "renders correct label for status '%s'",
    (status, expectedLabel) => {
      render(<ComplaintStatusBadge status={status as ComplaintStatus} />);
      expect(screen.getByText(expectedLabel)).toBeInTheDocument();
    },
  );

  it("displays count when provided", () => {
    render(<ComplaintStatusBadge status="approved" count={5} />);
    expect(screen.getByText("Approved")).toBeInTheDocument();
    expect(screen.getByText("(5)")).toBeInTheDocument();
  });

  it("does not display count when not provided", () => {
    render(<ComplaintStatusBadge status="approved" />);
    expect(screen.getByText("Approved")).toBeInTheDocument();
    expect(screen.queryByText(/\(\d+\)/)).not.toBeInTheDocument();
  });

  it("displays count of zero", () => {
    render(<ComplaintStatusBadge status="pending_cadet" count={0} />);
    expect(screen.getByText("(0)")).toBeInTheDocument();
  });

  it("falls back gracefully for unknown status", () => {
    render(
      <ComplaintStatusBadge status={"unknown_status" as ComplaintStatus} />,
    );
    expect(screen.getByText("unknown_status")).toBeInTheDocument();
  });
});
