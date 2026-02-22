interface CaseEmptyStateProps {
  message?: string;
}

export const CaseEmptyState = ({
  message = "No cases found. Create one to get started.",
}: CaseEmptyStateProps) => {
  return (
    <div className="text-center py-12 text-muted-foreground border rounded-lg border-dashed">
      {message}
    </div>
  );
};
