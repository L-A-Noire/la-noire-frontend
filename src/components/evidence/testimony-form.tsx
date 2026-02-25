// import { useState } from "react";
// import { useForm } from "react-hook-form";
// import { zodResolver } from "@hookform/resolvers/zod";
// import { useMutation } from "@tanstack/react-query";
// import { toast } from "react-toastify";
// import { Button } from "@/components/ui/button";
// import {
//   Card,
//   CardContent,
//   CardDescription,
//   CardHeader,
//   CardTitle,
// } from "@/components/ui/card";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import { Textarea } from "@/components/ui/textarea";
// import {
//   testimonySchema,
//   type TestimonyFormData,
// } from "@/schemas/evidence.schema";
// import { createTestimony, uploadAttachment } from "@/api/evidence";
// import type { Attachment } from "@/types/evidence.type";
// import { useAuthStore } from "@/stores/auth.store";
// import { useParams } from "react-router-dom";

// interface TestimonyFormProps {
//   onSuccess?: () => void;
// }

// export function TestimonyForm({ onSuccess }: TestimonyFormProps) {
//   const { caseId } = useParams<{ caseId: string }>();
//   const { session } = useAuthStore();
//   const [uploadedAttachments, setUploadedAttachments] = useState<Attachment[]>(
//     [],
//   );
//   const [isUploading, setIsUploading] = useState(false);

//   const {
//     register,
//     handleSubmit,
//     formState: { errors },
//     reset,
//   } = useForm<TestimonyFormData>({
//     resolver: zodResolver(testimonySchema),
//     defaultValues: {
//       attachments: [],
//       case: caseId ? parseInt(caseId) : 0,
//     },
//   });

//   const createMutation = useMutation({
//     mutationFn: createTestimony,
//     onSuccess: () => {
//       toast.success("Testimony recorded successfully");
//       reset();
//       setUploadedAttachments([]);
//       onSuccess?.();
//     },
//     onError: (error: any) => {
//       toast.error(
//         error.response?.data?.message || "Failed to record testimony",
//       );
//     },
//   });

//   const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
//     const files = Array.from(e.target.files || []);
//     if (files.length === 0) return;

//     setIsUploading(true);
//     try {
//       const uploadPromises = files.map((file) => uploadAttachment(file));
//       const uploaded = await Promise.all(uploadPromises);
//       setUploadedAttachments((prev) => [...prev, ...uploaded]);
//       toast.success(`${files.length} file(s) uploaded successfully`);
//     } catch (error) {
//       toast.error("Failed to upload files");
//     } finally {
//       setIsUploading(false);
//     }
//   };

//   const removeAttachment = (index: number) => {
//     setUploadedAttachments((prev) => prev.filter((_, i) => i !== index));
//   };

//   const onSubmit = (data: TestimonyFormData) => {
//     if (!session?.user.id) {
//       toast.error("You must be logged in to record evidence");
//       return;
//     }

//     if (!caseId) {
//       toast.error("Case ID is missing");
//       return;
//     }

//     createMutation.mutate({
//       ...data,
//       case: parseInt(caseId),
//       attachments: uploadedAttachments.map((a) => a.id),
//       created_at: new Date().toISOString(),
//       created_by: session.user.id,
//     });
//   };

//   return (
//     <Card>
//       <CardHeader>
//         <CardTitle>Witness Testimony</CardTitle>
//         <CardDescription>
//           Record witness statements and local resident testimonies with
//           supporting media files
//         </CardDescription>
//       </CardHeader>
//       <CardContent>
//         <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
//           <div className="space-y-2">
//             <Label htmlFor="title">Title</Label>
//             <Input
//               id="title"
//               placeholder="Brief description of the testimony"
//               {...register("title")}
//             />
//             {errors.title && (
//               <p className="text-sm text-red-500">{errors.title.message}</p>
//             )}
//           </div>

//           <div className="space-y-2">
//             <Label htmlFor="description">Description</Label>
//             <Textarea
//               id="description"
//               placeholder="Additional context and details"
//               rows={3}
//               {...register("description")}
//             />
//             {errors.description && (
//               <p className="text-sm text-red-500">
//                 {errors.description.message}
//               </p>
//             )}
//           </div>

//           <div className="space-y-2">
//             <Label htmlFor="transcription">Transcription</Label>
//             <Textarea
//               id="transcription"
//               placeholder="Full transcription of the witness statement"
//               rows={6}
//               {...register("transcription")}
//             />
//             {errors.transcription && (
//               <p className="text-sm text-red-500">
//                 {errors.transcription.message}
//               </p>
//             )}
//           </div>

//           <div className="space-y-2">
//             <Label htmlFor="attachments">
//               Attachments (Images, Videos, Audio)
//             </Label>
//             <Input
//               id="attachments"
//               type="file"
//               multiple
//               accept="image/*,video/*,audio/*"
//               onChange={handleFileChange}
//               disabled={isUploading}
//             />
//             {uploadedAttachments.length > 0 && (
//               <div className="mt-2 space-y-2">
//                 {uploadedAttachments.map((attachment, index) => (
//                   <div
//                     key={attachment.id}
//                     className="flex items-center justify-between rounded-md border p-2"
//                   >
//                     <span className="text-sm truncate flex-1">
//                       {attachment.file.split("/").pop()}
//                     </span>
//                     <Button
//                       type="button"
//                       variant="ghost"
//                       size="sm"
//                       onClick={() => removeAttachment(index)}
//                     >
//                       Remove
//                     </Button>
//                   </div>
//                 ))}
//               </div>
//             )}
//           </div>

//           <Button
//             type="submit"
//             className="w-full"
//             disabled={createMutation.isPending || isUploading}
//           >
//             {createMutation.isPending ? "Recording..." : "Record Testimony"}
//           </Button>
//         </form>
//       </CardContent>
//     </Card>
//   );
// }


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
  const [uploadProgress, setUploadProgress] = useState<{ [key: string]: boolean }>({});

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
      case: null,
      seen_at: new Date().toISOString().slice(0, 16),
    },
  });

  const createMutation = useMutation({
    mutationFn: createTestimony,
    onSuccess: () => {
      toast.success("Testimony submitted successfully. Awaiting police review.");
      reset();
      setUploadedAttachments([]);
      if (onSuccess) {
        onSuccess();
      } else {
        navigate("/testimonies");
      }
    },
    onError: (error: any) => {
      console.error("Create testimony error:", error);
      toast.error(
        error.response?.data?.message ||
        error.response?.data?.detail ||
        "Failed to submit testimony"
      );
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
        // Track individual file upload
        setUploadProgress(prev => ({ ...prev, [file.name]: true }));

        try {
          const uploaded = await uploadAttachment({
            file: file,
            provided_by: session.user.id,
          });
          setUploadProgress(prev => ({ ...prev, [file.name]: false }));
          return uploaded;
        } catch (error) {
          setUploadProgress(prev => ({ ...prev, [file.name]: false }));
          throw error;
        }
      });

      const uploaded = await Promise.all(uploadPromises);

      // Filter out any failed uploads (should be caught by Promise.all)
      const successfulUploads = uploaded.filter(Boolean);

      setUploadedAttachments((prev) => [...prev, ...successfulUploads]);

      // Update form attachments array
      setValue(
        "attachments",
        [...uploadedAttachments, ...successfulUploads].map((a) => a.id)
      );

      toast.success(`${successfulUploads.length} file(s) uploaded successfully`);
    } catch (error: any) {
      console.error("Upload error:", error);
      toast.error(
        error.response?.data?.message ||
        error.response?.data?.detail ||
        "Failed to upload files"
      );
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
      newAttachments.map((a) => a.id)
    );
  };

  const onSubmit = (data: TestimonyFormData) => {
    if (!session?.user.id) {
      toast.error("You must be logged in to submit a testimony");
      return;
    }

    // Validate that we have at least the required fields
    if (!data.title || !data.description || !data.transcription || !data.location || !data.seen_at) {
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
      case: null,
      attachments: uploadedAttachments.map((a) => a.id),
    };

    console.log("Submitting testimony:", submissionData);
    createMutation.mutate(submissionData);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Submit Witness Testimony</CardTitle>
        <CardDescription>
          Anyone can submit a witness testimony about a crime. After submission,
          police officers will review and may create a crime scene.
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
            <Label htmlFor="attachments">Attachments (Images, Videos, Audio)</Label>
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
            {Object.keys(uploadProgress).some(key => uploadProgress[key]) && (
              <div className="text-sm text-blue-600">
                Uploading files...
              </div>
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
            {createMutation.isPending ? (
              "Submitting..."
            ) : isUploading ? (
              "Uploading files..."
            ) : (
              "Submit Testimony"
            )}
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