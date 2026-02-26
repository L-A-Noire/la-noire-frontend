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
import { useNavigate, useParams } from "react-router-dom";

interface TestimonyFormProps {
  onSuccess?: () => void;
  initialCaseId?: number | null; // Allow passing case ID as prop
}

export function TestimonyForm({
  onSuccess,
  initialCaseId,
}: TestimonyFormProps) {
  const navigate = useNavigate();
  const { caseId: urlCaseId } = useParams<{ caseId: string }>();
  const { session } = useAuthStore();
  const [uploadedAttachments, setUploadedAttachments] = useState<Attachment[]>(
    [],
  );
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<{
    [key: string]: boolean;
  }>({});

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
    setValue,
  } = useForm<TestimonyFormData>({
    resolver: zodResolver(testimonySchema),
    defaultValues: {
      attachments: [],
      case: effectiveCaseId, // Set the case ID from props or URL
      seen_at: new Date().toISOString().slice(0, 16),
    },
  });

  const createMutation = useMutation({
    mutationFn: createTestimony,
    onSuccess: (data) => {
      const message = data.case
        ? "Testimony added to case successfully."
        : "Testimony submitted successfully. Awaiting police review.";

      toast.success(message);
      reset();
      setUploadedAttachments([]);

      if (onSuccess) {
        onSuccess();
      } else if (effectiveCaseId) {
        // If we were in a case context, go back to case evidence page
        navigate(`/cases/${effectiveCaseId}/evidence`);
      } else {
        // Otherwise go to testimonies list
        navigate("/testimonies");
      }
    },
    onError: () => {
      toast.error("Failed to create testimony");
    },
  });

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    if (!session?.user.id) {
      toast.error("You must be logged in to upload files");
      return;
    }

    setIsUploading(true);

    try {
      const uploadPromises = files.map(async (file) => {
        setUploadProgress((prev) => ({ ...prev, [file.name]: true }));

        try {
          const uploaded = await uploadAttachment({
            file: file,
            provided_by: session.user.id,
          });
          setUploadProgress((prev) => ({ ...prev, [file.name]: false }));
          return uploaded;
        } catch (error) {
          setUploadProgress((prev) => ({ ...prev, [file.name]: false }));
          throw error;
        }
      });

      const uploaded = await Promise.all(uploadPromises);
      const successfulUploads = uploaded.filter(Boolean);

      setUploadedAttachments((prev) => [...prev, ...successfulUploads]);
      setValue(
        "attachments",
        [...uploadedAttachments, ...successfulUploads].map((a) => a.id),
      );

      toast.success(
        `${successfulUploads.length} file(s) uploaded successfully`,
      );
    } catch (error: unknown) {
      console.error("Upload error:", error);
      const msg =
        error instanceof Error ? error.message : "Failed to upload files";
      toast.error(msg);
    } finally {
      setIsUploading(false);
      setUploadProgress({});
    }
  };

  const removeAttachment = (index: number) => {
    const newAttachments = uploadedAttachments.filter((_, i) => i !== index);
    setUploadedAttachments(newAttachments);
    setValue(
      "attachments",
      newAttachments.map((a) => a.id),
    );
  };

  const onSubmit = (data: TestimonyFormData) => {
    if (!session?.user.id) {
      toast.error("You must be logged in to submit a testimony");
      return;
    }

    // Validate required fields
    if (
      !data.title ||
      !data.description ||
      !data.transcription ||
      !data.location ||
      !data.seen_at
    ) {
      toast.error("Please fill in all required fields");
      return;
    }

    const submissionData = {
      title: data.title,
      description: data.description,
      transcription: data.transcription,
      location: data.location,
      seen_at: new Date(data.seen_at).toISOString(),
      created_by: session.user.id,
      case: effectiveCaseId, // Use the effective case ID (could be null)
      attachments: uploadedAttachments.map((a) => a.id),
    };

    console.log("Submitting testimony:", submissionData);
    createMutation.mutate(submissionData);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {effectiveCaseId
            ? "Add Testimony to Case"
            : "Submit Witness Testimony"}
        </CardTitle>
        <CardDescription>
          {effectiveCaseId ? (
            <>
              Record a witness testimony and add it to Case #{effectiveCaseId}
            </>
          ) : (
            <>
              Anyone can submit a witness testimony about a crime. After
              submission, police officers will review and may create a crime
              scene.
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
              placeholder="Brief description of the testimony"
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
              placeholder="Where did this occur?"
              {...register("location")}
              className={errors.location ? "border-red-500" : ""}
            />
            {errors.location && (
              <p className="text-sm text-red-500">{errors.location.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="seen_at">
              Date & Time of Observation <span className="text-red-500">*</span>
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
              placeholder="Additional context and details about what was observed"
              rows={3}
              {...register("description")}
              className={errors.description ? "border-red-500" : ""}
            />
            {errors.description && (
              <p className="text-sm text-red-500">
                {errors.description.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="transcription">
              Full Testimony <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="transcription"
              placeholder="Full transcription of the witness statement"
              rows={6}
              {...register("transcription")}
              className={errors.transcription ? "border-red-500" : ""}
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
              disabled={isUploading || !session?.user.id}
              className="cursor-pointer"
            />

            {/* Upload Progress */}
            {Object.keys(uploadProgress).some((key) => uploadProgress[key]) && (
              <div className="text-sm text-blue-600">Uploading files...</div>
            )}

            {/* Uploaded Files List */}
            {uploadedAttachments.length > 0 && (
              <div className="mt-2 space-y-2">
                <p className="text-sm font-medium">Uploaded Files:</p>
                {uploadedAttachments.map((attachment, index) => (
                  <div
                    key={attachment.id}
                    className="flex items-center justify-between rounded-md border p-2 bg-muted/30"
                  >
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <span className="text-sm truncate">
                        {attachment.file.split("/").pop()}
                      </span>
                      <span className="text-xs text-green-600">✓ Uploaded</span>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeAttachment(index)}
                      className="ml-2 flex-shrink-0"
                    >
                      Remove
                    </Button>
                  </div>
                ))}
              </div>
            )}

            <p className="text-xs text-muted-foreground mt-1">
              Supported formats: Images, Videos, Audio files
            </p>
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
                : effectiveCaseId
                  ? "Add Testimony to Case"
                  : "Submit Testimony"}
          </Button>

          {/* Error Display */}
          {createMutation.isError && (
            <p className="text-sm text-red-500 text-center">
              Failed to submit testimony. Please try again.
            </p>
          )}
        </form>
      </CardContent>
    </Card>
  );
}
