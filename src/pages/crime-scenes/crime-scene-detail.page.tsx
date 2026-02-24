import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getCrimeSceneById,
  confirmCrimeScene,
  deleteCrimeScene,
} from "@/api/crime-scenes";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  ArrowLeft01Icon,
  MapPinIcon,
  ClockIcon,
  UserIcon,
  CheckmarkCircle01Icon,
  Delete01Icon,
  FileAttachmentIcon,
} from "@hugeicons/core-free-icons";
import { format } from "date-fns";

export const CrimeSceneDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const {
    data: scene,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["crime-scene", id],
    queryFn: () => getCrimeSceneById(Number(id)),
    enabled: !!id,
  });

  const confirmMutation = useMutation({
    mutationFn: () => confirmCrimeScene(Number(id)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["crime-scene", id] });
      queryClient.invalidateQueries({ queryKey: ["crime-scenes"] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => deleteCrimeScene(Number(id)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["crime-scenes"] });
      navigate("/crime-scenes");
    },
  });

  if (isLoading)
    return (
      <div className="p-8 text-center text-muted-foreground">
        Loading crime scene details...
      </div>
    );

  if (isError || !scene)
    return (
      <div className="p-8 text-center text-destructive">
        Error loading crime scene
      </div>
    );

  return (
    <div className="container mx-auto py-8 space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="icon"
            onClick={() => navigate("/crime-scenes")}
          >
            <HugeiconsIcon icon={ArrowLeft01Icon} className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Crime Scene #{scene.id}
            </h1>
            <p className="text-muted-foreground mt-1">
              {scene.location || "No location specified"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {!scene.is_confirmed && (
            <Button
              onClick={() => confirmMutation.mutate()}
              disabled={confirmMutation.isPending}
            >
              <HugeiconsIcon
                icon={CheckmarkCircle01Icon}
                className="mr-2 h-4 w-4"
              />
              Confirm Scene
            </Button>
          )}
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive">
                <HugeiconsIcon icon={Delete01Icon} className="mr-2 h-4 w-4" />
                Delete
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete Crime Scene</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to delete this crime scene? This action
                  cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => deleteMutation.mutate()}
                  disabled={deleteMutation.isPending}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      {/* Status Badge */}
      <div>
        <Badge
          className={
            scene.is_confirmed
              ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
              : "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400"
          }
        >
          {scene.is_confirmed ? "Confirmed" : "Pending Confirmation"}
        </Badge>
      </div>

      {/* Crime Scene Details */}
      <Card>
        <CardHeader>
          <CardTitle>Scene Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <div className="flex items-start gap-2">
                <HugeiconsIcon
                  icon={MapPinIcon}
                  className="h-5 w-5 text-muted-foreground mt-0.5"
                />
                <div className="flex-1 space-y-1">
                  <p className="text-sm font-medium">Location</p>
                  <p className="text-sm text-muted-foreground">
                    {scene.location || "Not specified"}
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-start gap-2">
                <HugeiconsIcon
                  icon={ClockIcon}
                  className="h-5 w-5 text-muted-foreground mt-0.5"
                />
                <div className="flex-1 space-y-1">
                  <p className="text-sm font-medium">Time Observed</p>
                  <p className="text-sm text-muted-foreground">
                    {format(new Date(scene.seen_at), "PPP p")}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {scene.description && (
            <>
              <Separator />
              <div className="space-y-2">
                <p className="text-sm font-medium">Description</p>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                  {scene.description}
                </p>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Personnel */}
      <Card>
        <CardHeader>
          <CardTitle>Personnel</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <div className="flex items-start gap-2">
                <HugeiconsIcon
                  icon={UserIcon}
                  className="h-5 w-5 text-muted-foreground mt-0.5"
                />
                <div className="flex-1 space-y-1">
                  <p className="text-sm font-medium">Scene Viewer</p>
                  <p className="text-sm text-muted-foreground">
                    {scene.viewer_details?.username || "Unknown"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {scene.viewer_details?.role_title || "N/A"}
                  </p>
                </div>
              </div>
            </div>

            {scene.examiner_details && (
              <div className="space-y-2">
                <div className="flex items-start gap-2">
                  <HugeiconsIcon
                    icon={UserIcon}
                    className="h-5 w-5 text-muted-foreground mt-0.5"
                  />
                  <div className="flex-1 space-y-1">
                    <p className="text-sm font-medium">Examiner</p>
                    <p className="text-sm text-muted-foreground">
                      {scene.examiner_details.username}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {scene.examiner_details.role_title}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Witnesses */}
      {scene.witnesses_details && scene.witnesses_details.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Witnesses ({scene.witnesses_details.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {scene.witnesses_details.map((witness) => (
                <div
                  key={witness.id}
                  className="flex items-start gap-3 p-3 border rounded-lg"
                >
                  <HugeiconsIcon
                    icon={UserIcon}
                    className="h-5 w-5 text-muted-foreground mt-0.5"
                  />
                  <div className="flex-1 space-y-1">
                    <p className="font-medium text-sm">
                      {witness.first_name && witness.last_name
                        ? `${witness.first_name} ${witness.last_name}`
                        : witness.username || "Unknown"}
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs text-muted-foreground">
                      {witness.email && (
                        <p>
                          <span className="font-medium">Email:</span>{" "}
                          {witness.email}
                        </p>
                      )}
                      {witness.phone && (
                        <p>
                          <span className="font-medium">Phone:</span>{" "}
                          {witness.phone}
                        </p>
                      )}
                      {witness.national_id && (
                        <p>
                          <span className="font-medium">National ID:</span>{" "}
                          {witness.national_id}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Case Report Link */}
      {scene.case_report && (
        <Card>
          <CardHeader>
            <CardTitle>Associated Case</CardTitle>
          </CardHeader>
          <CardContent>
            <Button
              variant="outline"
              onClick={() => navigate(`/cases/${scene.case_report}`)}
            >
              <HugeiconsIcon
                icon={FileAttachmentIcon}
                className="mr-2 h-4 w-4"
              />
              View Case #{scene.case_report}
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
