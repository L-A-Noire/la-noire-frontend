import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createCase } from "@/api/cases";
import type { CreateCaseRequest } from "@/types/case.type";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useForm } from "react-hook-form";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowLeft01Icon, CheckSquare } from "@hugeicons/core-free-icons";

export const CaseCreatePage = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
  } = useForm<CreateCaseRequest>({
    defaultValues: {
      is_from_crime_scene: false,
    },
  });

  const isFromCrimeScene = watch("is_from_crime_scene");

  const createMutation = useMutation({
    mutationFn: createCase,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cases"] });
      toast.success("Case created successfully");
      navigate("/cases");
    },
    onError: (error) => {
      console.error(error);
      toast.error("Failed to create case. Please check your inputs.");
    },
  });

  const onSubmit = (data: CreateCaseRequest) => {
    createMutation.mutate(data);
  };

  return (
    <div className="container mx-auto py-8 max-w-2xl space-y-6">
      <Button
        variant="ghost"
        className="mb-2 pl-0 hover:bg-transparent hover:text-primary"
        onClick={() => navigate("/cases")}
      >
        <HugeiconsIcon icon={ArrowLeft01Icon} className="mr-2 h-4 w-4" />
        Back to Cases
      </Button>

      <Card>
        <CardHeader className="space-y-2">
          <CardTitle className="text-2xl">Open New Case</CardTitle>
          <CardDescription>
            File a new criminal case by providing the crime and detective
            information.
          </CardDescription>
        </CardHeader>

        <form onSubmit={handleSubmit(onSubmit)}>
          <CardContent className="space-y-6">
            {/* Case Information Section */}
            <div className="space-y-4">
              <h3 className="font-semibold text-sm">Case Information</h3>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="crime" className="flex items-center gap-1">
                    Crime ID <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="crime"
                    type="number"
                    placeholder="e.g., 123"
                    {...register("crime", {
                      required: "Crime ID is required",
                      valueAsNumber: true,
                      min: {
                        value: 1,
                        message: "Crime ID must be greater than 0",
                      },
                    })}
                    className={errors.crime ? "border-red-500" : ""}
                  />
                  {errors.crime && (
                    <p className="text-sm text-destructive flex items-center gap-1">
                      {errors.crime.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="detective"
                    className="flex items-center gap-1"
                  >
                    Detective ID <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="detective"
                    type="number"
                    placeholder="e.g., 45"
                    {...register("detective", {
                      required: "Detective ID is required",
                      valueAsNumber: true,
                      min: {
                        value: 1,
                        message: "Detective ID must be greater than 0",
                      },
                    })}
                    className={errors.detective ? "border-red-500" : ""}
                  />
                  {errors.detective && (
                    <p className="text-sm text-destructive flex items-center gap-1">
                      {errors.detective.message}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Case Details Section */}
            <div className="space-y-4">
              <h3 className="font-semibold text-sm">Case Details</h3>

              <div className="flex items-start space-x-3 p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                <Checkbox
                  id="is_from_crime_scene"
                  {...register("is_from_crime_scene")}
                  className="mt-1"
                />
                <div className="space-y-2 flex-1">
                  <Label
                    htmlFor="is_from_crime_scene"
                    className="cursor-pointer font-medium"
                  >
                    Crime Scene Case
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Check if this case originated from an active crime scene
                    investigation.
                  </p>
                  {isFromCrimeScene && (
                    <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400 mt-2">
                      <HugeiconsIcon icon={CheckSquare} className="h-4 w-4" />
                      Marked as crime scene case
                    </div>
                  )}
                </div>
              </div>
            </div>
          </CardContent>

          <CardFooter className="flex justify-between gap-3 border-t pt-6">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate("/cases")}
              disabled={isSubmitting || createMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || createMutation.isPending}
              className="gap-2"
            >
              {createMutation.isPending ? (
                <>
                  <span className="inline-block animate-spin">⏳</span>
                  Creating...
                </>
              ) : (
                <>
                  <HugeiconsIcon icon={CheckSquare} className="h-4 w-4" />
                  Create Case
                </>
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};
