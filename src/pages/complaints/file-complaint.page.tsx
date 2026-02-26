import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createComplaint } from "@/api/complaints";
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
import { Textarea } from "@/components/ui/textarea";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowLeft01Icon } from "@hugeicons/core-free-icons";
import { toast } from "react-toastify";
import type { CreateComplaintRequest } from "@/types/complaint.type";
import { useAuthStore } from "@/stores/auth.store";

interface FormData {
  description: string;
}

export const FileComplaintPage = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { session } = useAuthStore();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    defaultValues: {
      description: "",
    },
  });

  const createMutation = useMutation({
    mutationFn: (data: CreateComplaintRequest) => createComplaint(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["complaints"] });
      toast.success("Complaint filed successfully. Await cadet review.");
      navigate("/complaints");
    },
    onError: () => {
      toast.error("Failed to file complaint. Please try again.");
    },
  });

  const onSubmit = (data: FormData) => {
    if (!session?.user.id) {
      toast.error("Session expired. Please login again.");
      return;
    }

    createMutation.mutate({
      description: data.description,
      complainant_ids: [session.user.id],
    });
  };

  return (
    <div className="container mx-auto py-8 max-w-2xl space-y-6">
      <Button
        variant="ghost"
        className="pl-0 hover:bg-transparent hover:text-primary"
        onClick={() => navigate("/complaints")}
      >
        <HugeiconsIcon icon={ArrowLeft01Icon} className="mr-2 h-4 w-4" />
        Back to Complaints
      </Button>

      <Card>
        <CardHeader className="space-y-2">
          <CardTitle className="text-2xl">File a Complaint</CardTitle>
          <CardDescription>
            Submit a detailed complaint about a criminal incident. Your
            complaint will be reviewed first by a cadet, then by a police
            officer.
          </CardDescription>
        </CardHeader>

        <form onSubmit={handleSubmit(onSubmit)}>
          <CardContent className="space-y-6">
            {/* Information Section */}
            <div className="bg-muted/50 p-4 rounded-lg space-y-3 text-sm">
              <div>
                <p className="text-muted-foreground">Your Information</p>
                <p className="font-semibold">{session?.user.username}</p>
              </div>

              <div className="border-t pt-3">
                <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">
                  Review Process
                </p>
                <ol className="space-y-2 text-xs">
                  <li className="flex gap-3">
                    <span className="font-bold text-primary">1.</span>
                    <span>
                      Your complaint is submitted and assigned to a cadet for
                      initial review
                    </span>
                  </li>
                  <li className="flex gap-3">
                    <span className="font-bold text-primary">2.</span>
                    <span>
                      If approved by cadet, forwarded to a police officer for
                      final verification
                    </span>
                  </li>
                  <li className="flex gap-3">
                    <span className="font-bold text-primary">3.</span>
                    <span>Once approved, a case is created automatically</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="font-bold text-destructive">⚠️</span>
                    <span>
                      If rejected 3 times, your complaint becomes invalid
                    </span>
                  </li>
                </ol>
              </div>
            </div>

            {/* Complaint Description */}
            <div className="space-y-2">
              <Label htmlFor="description" className="flex items-center gap-1">
                Complaint Details <span className="text-red-500">*</span>
              </Label>
              <Textarea
                id="description"
                placeholder="Describe the incident in detail. Include what happened, when, where, and any relevant information..."
                className="min-h-[180px] resize-none"
                {...register("description", {
                  required: "Description is required",
                  minLength: {
                    value: 20,
                    message: "Description must be at least 20 characters",
                  },
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
                ℹ️ Guidelines for Your Complaint
              </p>
              <ul className="text-xs text-blue-800 dark:text-blue-200 space-y-1">
                <li>• Be specific and factual</li>
                <li>• Include dates, times, and locations if known</li>
                <li>• Describe any injuries or damage</li>
                <li>• Mention witnesses if applicable</li>
                <li>• Avoid unverified accusations</li>
              </ul>
            </div>
          </CardContent>

          <CardFooter className="flex justify-between gap-3 border-t pt-6">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate("/complaints")}
              disabled={isSubmitting || createMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || createMutation.isPending}
            >
              {createMutation.isPending ? "Submitting..." : "Submit Complaint"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};
