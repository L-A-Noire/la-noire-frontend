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
import { useAuthStore } from "@/stores/auth.store";
import { useNavigate } from "react-router-dom";

interface TestimonyFormProps {
  onSuccess?: () => void;
}

export function TestimonyForm({ onSuccess }: TestimonyFormProps) {
  const navigate = useNavigate();
  const { session } = useAuthStore();
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
      case: 0, // Testimonies don't have a case initially
    },
  });

  const createMutation = useMutation({
    mutationFn: createTestimony,
    onSuccess: () => {
      toast.success("Testimony submitted successfully");
      reset();
      setUploadedAttachments([]);
      onSuccess?.();
      navigate("/testimonies");
    },
    onError: () => {
      toast.error("Failed to submit testimony");
    },
  });

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    setIsUploading(true);
    try {
      const uploadPromises = files.map((file) =>
        uploadAttachment({ file, provided_by: session?.user.id ?? 0 }),
      );
      const uploaded = await Promise.all(uploadPromises);
      setUploadedAttachments((prev) => [...prev, ...uploaded]);
      toast.success(`${files.length} file(s) uploaded successfully`);
    } catch {
      toast.error("Failed to upload files");
    } finally {
      setIsUploading(false);
    }
  };

  const removeAttachment = (index: number) => {
    setUploadedAttachments((prev) => prev.filter((_, i) => i !== index));
  };

  const onSubmit = (data: TestimonyFormData) => {
    if (!session?.user.id) {
      toast.error("You must be logged in to submit a testimony");
      return;
    }

    createMutation.mutate({
      ...data,
      case: 0, // Testimonies don't have a case initially
      attachments: uploadedAttachments.map((a) => a.id),
      created_by: session.user.id,
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Submit Witness Testimony</CardTitle>
        <CardDescription>
          As a witness, you can submit your testimony about an incident. Your
          testimony will be reviewed by law enforcement officers.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">
              Title <span className="text-red-500">*</span>
            </Label>
            <Input
              id="title"
              placeholder="Brief description of the testimony"
              {...register("title")}
            />
            {errors.title && (
              <p className="text-sm text-red-500">{errors.title.message}</p>
            )}
          </div>

          {/* Location */}
          <div className="space-y-2">
            <Label htmlFor="location">
              Location <span className="text-red-500">*</span>
            </Label>
            <Input
              id="location"
              placeholder="Where did the incident occur? (e.g., 123 Main St, Downtown)"
              {...register("location")}
            />
            {errors.location && (
              <p className="text-sm text-red-500">{errors.location.message}</p>
            )}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">
              Description <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="description"
              placeholder="Provide additional context and details about the incident"
              rows={3}
              {...register("description")}
            />
            {errors.description && (
              <p className="text-sm text-red-500">
                {errors.description.message}
              </p>
            )}
          </div>

          {/* Transcription */}
          <div className="space-y-2">
            <Label htmlFor="transcription">
              Testimony Transcription <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="transcription"
              placeholder="Write your full testimony here - what you saw, heard, and experienced"
              rows={6}
              {...register("transcription")}
            />
            {errors.transcription && (
              <p className="text-sm text-red-500">
                {errors.transcription.message}
              </p>
            )}
          </div>

          {/* Attachments */}
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
            <p className="text-xs text-muted-foreground">
              Upload any evidence like photos, videos, or audio recordings
              (optional)
            </p>

            {uploadedAttachments.length > 0 && (
              <div className="mt-2 space-y-2">
                <p className="text-sm font-medium">Uploaded files:</p>
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

          {/* Guidelines */}
          <div className="bg-blue-50 dark:bg-blue-950/20 p-4 rounded-lg border border-blue-200 dark:border-blue-900">
            <p className="text-xs font-semibold text-blue-900 dark:text-blue-300 mb-2">
              ℹ️ Testimony Guidelines
            </p>
            <ul className="text-xs text-blue-800 dark:text-blue-200 space-y-1">
              <li>• Be as detailed and specific as possible</li>
              <li>• Include dates, times, and locations if known</li>
              <li>• Describe what you saw, heard, and experienced</li>
              <li>• Mention any other witnesses if applicable</li>
              <li>• Your testimony will be reviewed by law enforcement</li>
            </ul>
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={createMutation.isPending || isUploading}
          >
            {createMutation.isPending
              ? "Submitting..."
              : isUploading
                ? "Uploading files..."
                : "Submit Testimony"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
