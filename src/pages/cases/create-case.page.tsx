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
import { useForm } from "react-hook-form";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowLeft01Icon } from "@hugeicons/core-free-icons";

export const CaseCreatePage = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CreateCaseRequest>({
    defaultValues: {
      is_from_crime_scene: false,
      is_closed: false,
    },
  });

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
    <div className="container mx-auto py-8 max-w-2xl">
      <Button
        variant="ghost"
        className="mb-6 pl-0 hover:bg-transparent hover:text-primary"
        onClick={() => navigate("/cases")}
      >
        <HugeiconsIcon icon={ArrowLeft01Icon} /> Back to Cases
      </Button>

      <Card>
        <CardHeader>
          <CardTitle>Create New Case</CardTitle>
          <CardDescription>
            Fill in the details to verify and open a new criminal case.
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <CardContent className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="crime">Crime ID</Label>
                <Input
                  id="crime"
                  type="number"
                  placeholder="e.g., 123"
                  {...register("crime", {
                    required: "Crime ID is required",
                    valueAsNumber: true,
                  })}
                />
                {errors.crime && (
                  <p className="text-sm text-destructive">
                    {errors.crime.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="detective">Detective ID</Label>
                <Input
                  id="detective"
                  type="number"
                  placeholder="e.g., 45"
                  {...register("detective", {
                    required: "Detective ID is required",
                    valueAsNumber: true,
                  })}
                />
                {errors.detective && (
                  <p className="text-sm text-destructive">
                    {errors.detective.message}
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center space-x-3 p-4 border rounded-md">
              <input
                type="checkbox"
                id="is_from_crime_scene"
                className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                {...register("is_from_crime_scene")}
              />
              <div className="space-y-1">
                <Label htmlFor="is_from_crime_scene" className="cursor-pointer">
                  Is from crime scene?
                </Label>
                <p className="text-xs text-muted-foreground">
                  Check if the case originated from a crime scene investigation.
                </p>
              </div>
            </div>

            {/* We default is_closed to false, usually you don't create a closed case, but the API allows it if needed */}
          </CardContent>
          <CardFooter className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate("/cases")}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || createMutation.isPending}
            >
              {createMutation.isPending ? "Creating..." : "Create Case"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};
