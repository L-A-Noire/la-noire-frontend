import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createCrimeScene } from "@/api/crime-scenes";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowLeft01Icon } from "@hugeicons/core-free-icons";
import { toast } from "react-toastify";
import type { CreateCrimeSceneRequest } from "@/types/crime-scene.type";
import { useAuthStore } from "@/stores/auth.store";

interface FormData {
  location?: string;
  description?: string;
  seen_at: string;
  witness_count: number;
}

export const ReportCrimeScenePage = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { session } = useAuthStore();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    defaultValues: {
      location: "",
      description: "",
      seen_at: new Date().toISOString().slice(0, 16),
      witness_count: 0,
    },
  });

  const createMutation = useMutation({
    mutationFn: (data: CreateCrimeSceneRequest) => createCrimeScene(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["crime-scenes"] });
      toast.success("Crime scene reported successfully");
      navigate("/crime-scenes");
    },
    onError: () => {
      toast.error("Failed to report crime scene");
    },
  });

  const onSubmit = (data: FormData) => {
    if (!session?.user.id) {
      toast.error("Session expired. Please login again.");
      return;
    }

    createMutation.mutate({
      viewer: session.user.id,
      location: data.location,
      description: data.description,
      seen_at: new Date(data.seen_at).toISOString(),
      witness_ids: [],
    });
  };

  return (
    <div className="container mx-auto py-8 max-w-2xl space-y-6">
      <Button
        variant="ghost"
        className="pl-0 hover:bg-transparent hover:text-primary"
        onClick={() => navigate("/crime-scenes")}
      >
        <HugeiconsIcon icon={ArrowLeft01Icon} className="mr-2 h-4 w-4" />
        Back to Crime Scenes
      </Button>

      <Card>
        <CardHeader className="space-y-2">
          <CardTitle className="text-2xl">Report Crime Scene</CardTitle>
          <CardDescription>
            Document a crime scene investigation. This report will be reviewed
            and confirmed by a senior officer.
          </CardDescription>
        </CardHeader>

        <form onSubmit={handleSubmit(onSubmit)}>
          <CardContent className="space-y-6">
            {/* Information Section */}
            <div className="bg-muted/50 p-4 rounded-lg space-y-2 text-sm">
              <p className="text-muted-foreground">Reported By</p>
              <p className="font-semibold">{session?.user.username}</p>
            </div>

            {/* Scene Time */}
            <div className="space-y-2">
              <Label htmlFor="seen_at" className="flex items-center gap-1">
                Date & Time of Observation{" "}
                <span className="text-red-500">*</span>
              </Label>
              <Input
                id="seen_at"
                type="datetime-local"
                {...register("seen_at", {
                  required: "Date and time are required",
                })}
              />
              {errors.seen_at && (
                <p className="text-sm text-destructive">
                  {errors.seen_at.message}
                </p>
              )}
            </div>

            {/* Location */}
            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                placeholder="Street address, area, district, etc."
                {...register("location", {
                  maxLength: {
                    value: 500,
                    message: "Location cannot exceed 500 characters",
                  },
                })}
              />
              {errors.location && (
                <p className="text-sm text-destructive">
                  {errors.location.message}
                </p>
              )}
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Describe the crime scene in detail. Include observations about evidence, injuries, damage, etc."
                className="min-h-[150px] resize-none"
                {...register("description", {
                  maxLength: {
                    value: 2000,
                    message: "Description cannot exceed 2000 characters",
                  },
                })}
              />
              {errors.description && (
                <p className="text-sm text-destructive">
                  {errors.description.message}
                </p>
              )}
            </div>

            {/* Guidelines */}
            <div className="bg-blue-50 dark:bg-blue-950/20 p-4 rounded-lg border border-blue-200 dark:border-blue-900">
              <p className="text-xs font-semibold text-blue-900 dark:text-blue-300 mb-2">
                Documentation Guidelines
              </p>
              <ul className="text-xs text-blue-800 dark:text-blue-200 space-y-1">
                <li>• Be objective and factual</li>
                <li>• Document evidence and their locations</li>
                <li>• Note any hazardous conditions</li>
                <li>• Record weather conditions if relevant</li>
                <li>• Include witness information when available</li>
              </ul>
            </div>
          </CardContent>

          <CardFooter className="flex justify-between gap-3 border-t pt-6">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate("/crime-scenes")}
              disabled={isSubmitting || createMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || createMutation.isPending}
            >
              {createMutation.isPending ? "Submitting..." : "Report Scene"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};
