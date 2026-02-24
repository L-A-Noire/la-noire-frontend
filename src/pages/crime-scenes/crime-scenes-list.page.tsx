import { useQuery } from "@tanstack/react-query";
import { getCrimeScenes } from "@/api/crime-scenes";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { HugeiconsIcon } from "@hugeicons/react";
import { Add01Icon, MapPinIcon, ClockIcon } from "@hugeicons/core-free-icons";
import { format } from "date-fns";

export const CrimeScenesListPage = () => {
  const navigate = useNavigate();
  const {
    data: scenes,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["crime-scenes"],
    queryFn: getCrimeScenes,
  });

  const confirmedScenes = scenes?.filter((s) => s.is_confirmed) || [];
  const pendingScenes = scenes?.filter((s) => !s.is_confirmed) || [];

  return (
    <div className="container mx-auto py-8 space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Crime Scenes</h1>
          <p className="text-muted-foreground mt-1">
            Report and manage crime scene investigations.
          </p>
        </div>
        <Button onClick={() => navigate("/crime-scenes/new")}>
          <HugeiconsIcon icon={Add01Icon} className="mr-2 h-4 w-4" />
          Report Scene
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-8 animate-in fade-in-50">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="p-4 border rounded-lg space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-8 w-16" />
              </div>
            ))}
          </div>

          <div className="space-y-4">
            <Skeleton className="h-8 w-48 mb-4" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <Card key={i} className="overflow-hidden">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <Skeleton className="h-5 w-32" />
                      <Skeleton className="h-5 w-20 rounded-full" />
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Skeleton className="h-4 w-4" />
                      <Skeleton className="h-4 w-48" />
                    </div>
                    <div className="flex items-center gap-2">
                      <Skeleton className="h-4 w-4" />
                      <Skeleton className="h-4 w-32" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      ) : isError ? (
        <div className="p-8 text-center text-destructive">
          Error loading crime scenes
        </div>
      ) : (
        <>
          {/* Stats */}
          {scenes && scenes.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 border rounded-lg">
                <p className="text-sm text-muted-foreground">Total Scenes</p>
                <p className="text-2xl font-bold mt-1">{scenes.length}</p>
              </div>
              <div className="p-4 border rounded-lg">
                <p className="text-sm text-muted-foreground">Confirmed</p>
                <p className="text-2xl font-bold mt-1 text-green-600">
                  {confirmedScenes.length}
                </p>
              </div>
              <div className="p-4 border rounded-lg">
                <p className="text-sm text-muted-foreground">Pending</p>
                <p className="text-2xl font-bold mt-1 text-amber-600">
                  {pendingScenes.length}
                </p>
              </div>
            </div>
          )}

          {/* Empty State */}
          {!scenes || scenes.length === 0 ? (
            <div className="text-center py-12 border rounded-lg border-dashed">
              <p className="text-muted-foreground">No crime scenes reported.</p>
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => navigate("/crime-scenes/new")}
              >
                Report a Crime Scene
              </Button>
            </div>
          ) : (
            <>
              {/* Confirmed Scenes */}
              {confirmedScenes.length > 0 && (
                <div className="space-y-4">
                  <div>
                    <h2 className="text-xl font-bold mb-4">Confirmed Scenes</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {confirmedScenes.map((scene) => (
                        <Card
                          key={scene.id}
                          className="cursor-pointer hover:shadow-md transition-shadow"
                          onClick={() => navigate(`/crime-scenes/${scene.id}`)}
                        >
                          <CardHeader>
                            <div className="flex items-start justify-between">
                              <CardTitle className="text-base">
                                Scene #{scene.id}
                              </CardTitle>
                              <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                                Confirmed
                              </Badge>
                            </div>
                          </CardHeader>
                          <CardContent className="space-y-3">
                            {scene.location && (
                              <div className="flex items-start gap-2">
                                <HugeiconsIcon
                                  icon={MapPinIcon}
                                  className="h-4 w-4 text-muted-foreground mt-0.5"
                                />
                                <span className="text-sm truncate">
                                  {scene.location}
                                </span>
                              </div>
                            )}
                            <div className="flex items-start gap-2">
                              <HugeiconsIcon
                                icon={ClockIcon}
                                className="h-4 w-4 text-muted-foreground mt-0.5"
                              />
                              <span className="text-sm">
                                {format(new Date(scene.seen_at), "PPP p")}
                              </span>
                            </div>
                            {scene.witnesses_details && (
                              <div>
                                <p className="text-xs text-muted-foreground mb-2">
                                  Witnesses: {scene.witnesses.length}
                                </p>
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Pending Scenes */}
              {pendingScenes.length > 0 && (
                <div className="space-y-4">
                  <div>
                    <h2 className="text-xl font-bold mb-4">
                      Pending Confirmation
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {pendingScenes.map((scene) => (
                        <Card
                          key={scene.id}
                          className="cursor-pointer hover:shadow-md transition-shadow border-amber-200"
                          onClick={() => navigate(`/crime-scenes/${scene.id}`)}
                        >
                          <CardHeader>
                            <div className="flex items-start justify-between">
                              <CardTitle className="text-base">
                                Scene #{scene.id}
                              </CardTitle>
                              <Badge
                                variant="outline"
                                className="border-amber-300"
                              >
                                Pending
                              </Badge>
                            </div>
                          </CardHeader>
                          <CardContent className="space-y-3">
                            {scene.location && (
                              <div className="flex items-start gap-2">
                                <HugeiconsIcon
                                  icon={MapPinIcon}
                                  className="h-4 w-4 text-muted-foreground mt-0.5"
                                />
                                <span className="text-sm truncate">
                                  {scene.location}
                                </span>
                              </div>
                            )}
                            <div className="flex items-start gap-2">
                              <HugeiconsIcon
                                icon={ClockIcon}
                                className="h-4 w-4 text-muted-foreground mt-0.5"
                              />
                              <span className="text-sm">
                                {format(new Date(scene.seen_at), "PPP p")}
                              </span>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </>
      )}
    </div>
  );
};
