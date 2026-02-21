import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getCases, closeCase } from "@/api/cases";
import { toast } from "react-toastify";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Delete02Icon,
  Add01Icon,
  TimelineEventIcon,
} from "@hugeicons/core-free-icons";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export const CasesListPage = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

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

  const openCases = cases?.filter((c) => !c.is_closed) || [];
  const closedCases = cases?.filter((c) => c.is_closed) || [];

  return (
    <div className="container mx-auto py-8 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Cases</h1>
          <p className="text-muted-foreground mt-1">
            Manage and track criminal cases.
          </p>
        </div>

        <Button onClick={() => navigate("/cases/new")}>
          <HugeiconsIcon icon={Add01Icon} className="mr-2 h-4 w-4" />
          Create Case
        </Button>
      </div>

      {/* Empty State */}
      {cases?.length === 0 && (
        <div className="text-center py-12 text-muted-foreground border rounded-lg border-dashed">
          No cases found. Create one to get started.
        </div>
      )}

      {/* Accordion */}
      <Accordion
        type="multiple"
        defaultValue={["close"]}
        className="w-full space-y-4"
      >
        {/* Open Cases */}
        <AccordionItem
          value="open"
          className="border rounded-lg overflow-hidden"
        >
          <AccordionTrigger className="px-4 py-3 hover:no-underline hover:bg-muted/50 transition">
            <div className="flex items-center justify-between w-full">
              <span className="font-semibold text-lg">Open Cases</span>

              <Badge
                className="ml-2 bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                variant="outline"
              >
                {openCases.length}
              </Badge>
            </div>
          </AccordionTrigger>

          <AccordionContent className="px-4 pb-4">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mt-4">
              {openCases.map((caseItem) => (
                <Card
                  key={caseItem.id}
                  className="relative overflow-hidden hover:shadow-md transition-shadow"
                >
                  <div className="absolute top-4 right-4">
                    <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                      Open
                    </Badge>
                  </div>

                  <CardHeader>
                    <CardTitle className="pr-12 truncate">
                      {caseItem.crime_title || `Case #${caseItem.id}`}
                    </CardTitle>
                    <CardDescription>
                      Created: {format(new Date(caseItem.created_at), "PPP")}
                    </CardDescription>
                  </CardHeader>

                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">
                          Detective:
                        </span>
                        <span className="font-medium">
                          {caseItem.detective_name || "Unassigned"}
                        </span>
                      </div>

                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">
                          Crime Scene:
                        </span>
                        <Badge
                          variant={
                            caseItem.is_from_crime_scene
                              ? "secondary"
                              : "outline"
                          }
                        >
                          {caseItem.is_from_crime_scene ? "Yes" : "No"}
                        </Badge>
                      </div>

                      <div className="pt-4 flex justify-end gap-2 border-t mt-4">
                        <Button variant="outline" size="sm" asChild>
                          <Link to={`/cases/${caseItem.id}/timeline`}>
                            <HugeiconsIcon
                              icon={TimelineEventIcon}
                              className="mr-2 h-4 w-4"
                            />
                            Timeline
                          </Link>
                        </Button>

                        <Button
                          variant="outline"
                          size="sm"
                          className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/20 border-red-200 dark:border-red-900"
                          onClick={() => {
                            if (
                              confirm(
                                "Are you sure you want to close this case?",
                              )
                            ) {
                              closeMutation.mutate(caseItem.id);
                            }
                          }}
                          disabled={closeMutation.isPending}
                        >
                          <HugeiconsIcon
                            icon={Delete02Icon}
                            className="mr-2 h-4 w-4"
                          />
                          Close
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Closed Cases */}
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
                <Card key={caseItem.id} className="relative opacity-80">
                  <div className="absolute top-4 right-4">
                    <Badge variant="destructive">Closed</Badge>
                  </div>

                  <CardHeader>
                    <CardTitle className="pr-12 truncate">
                      {caseItem.crime_title || `Case #${caseItem.id}`}
                    </CardTitle>
                    <CardDescription>
                      Created: {format(new Date(caseItem.created_at), "PPP")}
                    </CardDescription>
                  </CardHeader>

                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">
                          Detective:
                        </span>
                        <span className="font-medium">
                          {caseItem.detective_name || "Unassigned"}
                        </span>
                      </div>

                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">
                          Crime Scene:
                        </span>
                        <Badge
                          variant={
                            caseItem.is_from_crime_scene
                              ? "secondary"
                              : "outline"
                          }
                        >
                          {caseItem.is_from_crime_scene ? "Yes" : "No"}
                        </Badge>
                      </div>

                      <div className="pt-4 flex justify-end gap-2 border-t mt-4">
                        <Button variant="outline" size="sm" asChild>
                          <Link to={`/cases/${caseItem.id}/timeline`}>
                            Timeline
                          </Link>
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
};
