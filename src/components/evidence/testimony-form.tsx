import { useState } from "react";
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
  testimonySchema,
  type TestimonyFormData,
} from "@/schemas/evidence.schema";
import { createTestimony, uploadAttachment } from "@/api/evidence";
import type { Attachment } from "@/types/evidence.type";

interface TestimonyFormProps {
  onSuccess?: () => void;
}

export function TestimonyForm({ onSuccess }: TestimonyFormProps) {
  const [uploadedAttachments, setUploadedAttachments] = useState<Attachment[]>(
    [],
  );
  const [isUploading, setIsUploading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<TestimonyFormData>({
    resolver: zodResolver(testimonySchema),
    defaultValues: {
      attachments: [],
    },
  });

  const createMutation = useMutation({
    mutationFn: createTestimony,
    onSuccess: () => {
      toast.success("Testimony recorded successfully");
      reset();
      setUploadedAttachments([]);
      onSuccess?.();
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.message || "Failed to record testimony",
      );
    },
  });

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    setIsUploading(true);
    try {
      const uploadPromises = files.map((file) => uploadAttachment(file));
      const uploaded = await Promise.all(uploadPromises);
      setUploadedAttachments((prev) => [...prev, ...uploaded]);
      toast.success(`${files.length} file(s) uploaded successfully`);
    } catch (error) {
      toast.error("Failed to upload files");
    } finally {
      setIsUploading(false);
    }
  };

  const removeAttachment = (index: number) => {
    setUploadedAttachments((prev) => prev.filter((_, i) => i !== index));
  };

  const onSubmit = (data: TestimonyFormData) => {
    createMutation.mutate({
      ...data,
      attachments: uploadedAttachments.map((a) => a.id),
      created_at: new Date().toISOString(),
      created_by: 0, // Will be set by backend
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Witness Testimony</CardTitle>
        <CardDescription>
          Record witness statements and local resident testimonies with
          supporting media files
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              placeholder="Brief description of the testimony"
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
              placeholder="Additional context and details"
              rows={3}
              {...register("description")}
            />
            {errors.description && (
              <p className="text-sm text-red-500">
                {errors.description.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="transcription">Transcription</Label>
            <Textarea
              id="transcription"
              placeholder="Full transcription of the witness statement"
              rows={6}
              {...register("transcription")}
            />
            {errors.transcription && (
              <p className="text-sm text-red-500">
                {errors.transcription.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="attachments">
              Attachments (Images, Videos, Audio)
            </Label>
            <Input
              id="attachments"
              type="file"
              multiple
              accept="image/*,video/*,audio/*"
              onChange={handleFileChange}
              disabled={isUploading}
            />
            {uploadedAttachments.length > 0 && (
              <div className="mt-2 space-y-2">
                {uploadedAttachments.map((attachment, index) => (
                  <div
                    key={attachment.id}
                    className="flex items-center justify-between rounded-md border p-2"
                  >
                    <span className="text-sm truncate flex-1">
                      {attachment.file.split("/").pop()}
                    </span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeAttachment(index)}
                    >
                      Remove
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={createMutation.isPending || isUploading}
          >
            {createMutation.isPending ? "Recording..." : "Record Testimony"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
