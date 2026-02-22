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

interface OtherEvidenceFormProps {
  onSuccess?: () => void;
}

export function OtherEvidenceForm({ onSuccess }: OtherEvidenceFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<OtherEvidenceFormData>({
    resolver: zodResolver(otherEvidenceSchema),
  });

  const createMutation = useMutation({
    mutationFn: createOtherEvidence,
    onSuccess: () => {
      toast.success("Evidence recorded successfully");
      reset();
      onSuccess?.();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to record evidence");
    },
  });

  const onSubmit = (data: OtherEvidenceFormData) => {
    createMutation.mutate({
      ...data,
      created_at: new Date().toISOString(),
      created_by: 0, // Will be set by backend
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Other Evidence</CardTitle>
        <CardDescription>
          Record any other type of evidence that doesn't fit into the other
          categories
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              placeholder="Brief description of the evidence"
              {...register("title")}
            />
            {errors.title && (
              <p className="text-sm text-red-500">{errors.title.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Detailed description of the evidence, including where and how it was found, its condition, and any relevant observations"
              rows={8}
              {...register("description")}
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
            {createMutation.isPending ? "Recording..." : "Record Evidence"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
