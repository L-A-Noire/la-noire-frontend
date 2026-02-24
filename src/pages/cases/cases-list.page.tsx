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
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

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

  const openCases = filteredCases?.open || [];
  const closedCases = filteredCases?.closed || [];
  const hasResults = openCases.length > 0 || closedCases.length > 0;

  return (
    <div className="container mx-auto py-8 space-y-8">
      {/* Header */}
      <CaseHeader
        title="Crime Cases Management"
        description="Manage and track criminal cases from your investigations."
      />

      {isLoading ? (
        <div className="space-y-8 animate-in fade-in-50">
          <div className="flex flex-col sm:flex-row gap-4">
            <Skeleton className="h-10 w-full sm:w-[300px]" />
            <Skeleton className="h-10 w-[180px]" />
          </div>

          <div className="border rounded-lg overflow-hidden">
            <div className="px-4 py-3 border-b bg-muted/5 flex items-center justify-between">
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-6 w-12 rounded-full" />
            </div>
            <div className="p-4 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <Card key={i} className="overflow-hidden">
                  <CardHeader className="space-y-2">
                    <div className="flex justify-between items-start">
                      <Skeleton className="h-5 w-2/3" />
                    </div>
                    <Skeleton className="h-4 w-1/3" />
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-5/6" />
                    </div>
                    <div className="flex items-center gap-2 pt-4">
                      <Skeleton className="h-8 w-16" />
                      <Skeleton className="h-8 w-16" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      ) : isError ? (
        <div className="p-8 text-center text-destructive">
          Error loading cases
        </div>
      ) : (
        <>
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
                      <span className="font-semibold text-lg">
                        Closed Cases
                      </span>
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
        </>
      )}
    </div>
  );
};
