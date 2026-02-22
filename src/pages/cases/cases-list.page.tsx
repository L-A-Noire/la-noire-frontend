import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getCases, closeCase } from "@/api/cases";
import { toast } from "react-toastify";
import { useState, useMemo } from "react";
import { CaseCard } from "@/components/cases/case-card";
import { CaseHeader } from "@/components/cases/case-header";
import { CaseFilters } from "@/components/cases/case-filters";
import { CaseEmptyState } from "@/components/cases/case-empty-state";
import { Badge } from "@/components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export const CasesListPage = () => {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "open" | "closed">(
    "all",
  );

  const {
    data: cases,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["cases"],
    queryFn: getCases,
  });

  const closeMutation = useMutation({
    mutationFn: closeCase,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cases"] });
      toast.success("Case closed successfully");
    },
    onError: () => {
      toast.error("Failed to close case");
    },
  });

  // Filter cases based on search and status
  const filteredCases = useMemo(() => {
    if (!cases) return { open: [], closed: [] };

    let filtered = cases;

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (c) =>
          (c.crime_title?.toLowerCase() || "").includes(
            searchTerm.toLowerCase(),
          ) ||
          (c.detective_name?.toLowerCase() || "").includes(
            searchTerm.toLowerCase(),
          ) ||
          `case #${c.id}`.includes(searchTerm.toLowerCase()),
      );
    }

    // Apply status filter
    if (statusFilter === "open") {
      filtered = filtered.filter((c) => !c.is_closed);
    } else if (statusFilter === "closed") {
      filtered = filtered.filter((c) => c.is_closed);
    }

    return {
      open: filtered.filter((c) => !c.is_closed),
      closed: filtered.filter((c) => c.is_closed),
    };
  }, [cases, searchTerm, statusFilter]);

  if (isLoading)
    return (
      <div className="p-8 text-center text-muted-foreground">
        Loading cases...
      </div>
    );

  if (isError)
    return (
      <div className="p-8 text-center text-destructive">
        Error loading cases
      </div>
    );

  const openCases = filteredCases.open;
  const closedCases = filteredCases.closed;
  const hasResults = openCases.length > 0 || closedCases.length > 0;

  return (
    <div className="container mx-auto py-8 space-y-8">
      {/* Header */}
      <CaseHeader
        title="Crime Cases Management"
        description="Manage and track criminal cases from your investigations."
      />

      {/* Filters */}
      {cases && cases.length > 0 && (
        <CaseFilters
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          statusFilter={statusFilter}
          onStatusChange={setStatusFilter}
        />
      )}

      {/* Empty State */}
      {!hasResults && cases && cases.length === 0 && <CaseEmptyState />}

      {/* No results for current filters */}
      {!hasResults && cases && cases.length > 0 && (
        <CaseEmptyState message="No cases match your search filters." />
      )}

      {/* Cases Accordion */}
      {hasResults && (
        <Accordion
          type="multiple"
          defaultValue={["open"]}
          className="w-full space-y-4"
        >
          {/* Open Cases Section */}
          {openCases.length > 0 && (
            <AccordionItem
              value="open"
              className="border rounded-lg overflow-hidden"
            >
              <AccordionTrigger className="px-4 py-3 hover:no-underline hover:bg-muted/50 transition">
                <div className="flex items-center justify-between w-full">
                  <span className="font-semibold text-lg">Open Cases</span>
                  <Badge className="ml-2 bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                    {openCases.length}
                  </Badge>
                </div>
              </AccordionTrigger>

              <AccordionContent className="px-4 pb-4">
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mt-4">
                  {openCases.map((caseItem) => (
                    <CaseCard
                      key={caseItem.id}
                      caseItem={caseItem}
                      onClose={(id) => closeMutation.mutate(id)}
                      isClosing={closeMutation.isPending}
                    />
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>
          )}

          {/* Closed Cases Section */}
          {closedCases.length > 0 && (
            <AccordionItem
              value="closed"
              className="border rounded-lg overflow-hidden"
            >
              <AccordionTrigger className="px-4 py-3 hover:no-underline hover:bg-muted/50 transition">
                <div className="flex items-center justify-between w-full">
                  <span className="font-semibold text-lg">Closed Cases</span>
                  <Badge variant="destructive">{closedCases.length}</Badge>
                </div>
              </AccordionTrigger>

              <AccordionContent className="px-4 pb-4">
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mt-4">
                  {closedCases.map((caseItem) => (
                    <CaseCard key={caseItem.id} caseItem={caseItem} />
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>
          )}
        </Accordion>
      )}
    </div>
  );
};
