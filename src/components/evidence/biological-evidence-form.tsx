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
  biologicalEvidenceSchema,
  type BiologicalEvidenceFormData,
} from "@/schemas/evidence.schema";
import { createBiologicalEvidence, uploadImage } from "@/api/evidence";
import type { Image } from "@/types/evidence.type";
import { useAuthStore } from "@/stores/auth.store";
import { useParams } from "react-router-dom";

interface BiologicalEvidenceFormProps {
  onSuccess?: () => void;
}

export function BiologicalEvidenceForm({
  onSuccess,
}: BiologicalEvidenceFormProps) {
  const { caseId } = useParams<{ caseId: string }>();
  const { session } = useAuthStore();
  const [uploadedImages, setUploadedImages] = useState<Image[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm<BiologicalEvidenceFormData>({
    resolver: zodResolver(biologicalEvidenceSchema),
    defaultValues: {
      case: caseId ? parseInt(caseId) : 0,
    },
  });

  const createMutation = useMutation({
    mutationFn: createBiologicalEvidence,
    onSuccess: () => {
      toast.success("Biological evidence recorded successfully");
      reset();
      setUploadedImages([]);
      onSuccess?.();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to record evidence");
    },
  });

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    if (!session?.user.id) {
      toast.error("You must be logged in to upload images");
      return;
    }

    setIsUploading(true);
    try {
      const uploadPromises = files.map((file) =>
        uploadImage({
          image: file,
          uploaded_by: session.user.id,
        }),
      );
      const uploaded = await Promise.all(uploadPromises);
      const newImages = [...uploadedImages, ...uploaded];
      setUploadedImages(newImages);
      setValue(
        "images",
        newImages.map((img) => img.id),
      );
      toast.success(`${files.length} image(s) uploaded successfully`);
    } catch (error: any) {
      console.error("Upload error:", error);
      toast.error(error.response?.data?.message || "Failed to upload images");
    } finally {
      setIsUploading(false);
    }
  };

  const removeImage = (index: number) => {
    const newImages = uploadedImages.filter((_, i) => i !== index);
    setUploadedImages(newImages);
    setValue(
      "images",
      newImages.map((img) => img.id),
    );
  };

  const onSubmit = (data: BiologicalEvidenceFormData) => {
    if (!session?.user.id) {
      toast.error("You must be logged in to record evidence");
      return;
    }

    if (!caseId) {
      toast.error("Case ID is missing");
      return;
    }

    if (uploadedImages.length === 0) {
      toast.error("At least one image is required");
      return;
    }

    createMutation.mutate({
      ...data,
      case: parseInt(caseId),
      images: uploadedImages.map((img) => img.id),
      created_at: new Date().toISOString(),
      created_by: session.user.id,
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Biological & Medical Evidence</CardTitle>
        <CardDescription>
          Record biological samples (blood, hair, fingerprints) requiring
          forensic analysis
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              placeholder="e.g., Blood sample from crime scene"
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
              placeholder="Detailed description of the evidence and where it was found"
              rows={4}
              {...register("description")}
            />
            {errors.description && (
              <p className="text-sm text-red-500">
                {errors.description.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="images">Evidence Images (Required)</Label>
            <Input
              id="images"
              type="file"
              multiple
              accept="image/*"
              onChange={handleImageChange}
              disabled={isUploading || !session?.user.id}
            />
            {errors.images && (
              <p className="text-sm text-red-500">{errors.images.message}</p>
            )}
            {uploadedImages.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-3">
                {uploadedImages.map((image, index) => (
                  <div key={image.id} className="relative group">
                    <img
                      src={image.image}
                      alt={`Evidence ${index + 1}`}
                      className="w-full h-32 object-cover rounded-md border"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => removeImage(index)}
                    >
                      Remove
                    </Button>
                  </div>
                ))}
              </div>
            )}
            {isUploading && (
              <p className="text-sm text-blue-500">Uploading images...</p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="result">Analysis Result (Optional)</Label>
              <Textarea
                id="result"
                placeholder="Results from forensic analysis"
                rows={3}
                {...register("result")}
              />
              <p className="text-xs text-gray-500">
                Can be filled in later after analysis
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="coronary">Coronary (Optional)</Label>
              <Input
                id="coronary"
                type="number"
                placeholder="Coronary value"
                {...register("coronary", { valueAsNumber: true })}
              />
              <p className="text-xs text-gray-500">
                Can be filled in later after examination
              </p>
            </div>
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={
              createMutation.isPending ||
              isUploading ||
              uploadedImages.length === 0
            }
          >
            {createMutation.isPending
              ? "Recording..."
              : "Record Biological Evidence"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
