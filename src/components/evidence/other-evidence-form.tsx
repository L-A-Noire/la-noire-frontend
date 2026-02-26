import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  otherEvidenceSchema,
  type OtherEvidenceFormData,
} from "@/schemas/evidence.schema";
import { createOtherEvidence } from "@/api/evidence";
import { useAuthStore } from "@/stores/auth.store";
import { useNavigate, useParams } from "react-router-dom";

interface OtherEvidenceFormProps {
  onSuccess?: () => void;
  initialCaseId?: number | null;
}

export function OtherEvidenceForm({
  onSuccess,
  initialCaseId,
}: OtherEvidenceFormProps) {
  const navigate = useNavigate();
  const { caseId: urlCaseId } = useParams<{ caseId: string }>();
  const { session } = useAuthStore();

  // Determine the case ID - from props (if provided) or from URL params
  const effectiveCaseId =
    initialCaseId !== undefined
      ? initialCaseId
      : urlCaseId
        ? parseInt(urlCaseId)
        : null;

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<OtherEvidenceFormData>({
    resolver: zodResolver(otherEvidenceSchema),
    defaultValues: {
      case: effectiveCaseId,
    },
  });

  const createMutation = useMutation({
    mutationFn: createOtherEvidence,
    onSuccess: (data) => {
      const message = data.case
        ? "Evidence added to case successfully."
        : "Evidence recorded successfully.";

      toast.success(message);
      reset();

      if (onSuccess) {
        onSuccess();
      } else if (effectiveCaseId) {
        navigate(`/cases/${effectiveCaseId}/evidence`);
      } else {
        navigate(-1);
      }
    },
    onError: () => {
      toast.error("Failed to record evidence");
    },
  });

  const onSubmit = (data: OtherEvidenceFormData) => {
    if (!session?.user.id) {
      toast.error("You must be logged in to record evidence");
      return;
    }

    if (!effectiveCaseId) {
      toast.error("Case ID is missing");
      return;
    }

    // Validate required fields
    if (!data.title || !data.description || !data.location || !data.seen_at) {
      toast.error("Please fill in all required fields");
      return;
    }

    createMutation.mutate({
      ...data,
      case: effectiveCaseId,
      seen_at: new Date(data.seen_at).toISOString(),
      created_by: session.user.id,
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {effectiveCaseId ? "Add Evidence to Case" : "Other Evidence"}
        </CardTitle>
        <CardDescription>
          {effectiveCaseId ? (
            <>Record other evidence and add it to Case #{effectiveCaseId}</>
          ) : (
            <>
              Record any other type of evidence that doesn't fit into the other
              categories
            </>
          )}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title">
              Title <span className="text-red-500">*</span>
            </Label>
            <Input
              id="title"
              placeholder="Brief description of the evidence"
              {...register("title")}
              className={errors.title ? "border-red-500" : ""}
            />
            {errors.title && (
              <p className="text-sm text-red-500">{errors.title.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="location">
              Location <span className="text-red-500">*</span>
            </Label>
            <Input
              id="location"
              placeholder="Where was this evidence found?"
              {...register("location")}
              className={errors.location ? "border-red-500" : ""}
            />
            {errors.location && (
              <p className="text-sm text-red-500">{errors.location.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="seen_at">
              Date & Time of Discovery <span className="text-red-500">*</span>
            </Label>
            <Input
              id="seen_at"
              type="datetime-local"
              {...register("seen_at")}
              className={errors.seen_at ? "border-red-500" : ""}
            />
            {errors.seen_at && (
              <p className="text-sm text-red-500">{errors.seen_at.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">
              Description <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="description"
              placeholder="Detailed description of the evidence, including where and how it was found, its condition, and any relevant observations"
              rows={8}
              {...register("description")}
              className={errors.description ? "border-red-500" : ""}
            />
            {errors.description && (
              <p className="text-sm text-red-500">
                {errors.description.message}
              </p>
            )}
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={createMutation.isPending}
          >
            {createMutation.isPending
              ? "Recording..."
              : effectiveCaseId
                ? "Add to Case"
                : "Record Evidence"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
