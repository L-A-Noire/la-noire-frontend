import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getComplaintById,
  reviewComplaintAsCadet,
  reviewComplaintAsOfficer,
  updateComplaint,
} from "@/api/complaints";
import { createCase } from "@/api/cases";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  ArrowLeft01Icon,
  CheckSquare,
  Delete02Icon,
  PencilEdit01Icon,
} from "@hugeicons/core-free-icons";
import { format } from "date-fns";
import { toast } from "react-toastify";
import { ComplaintStatusBadge } from "@/components/complaints/complaint-status-badge";
import { useAuthStore } from "@/stores/auth.store";
import type { ComplaintReviewRequest } from "@/types/complaint.type";
import { useState, useEffect } from "react";
import http from "@/lib/http";

const CRIME_LEVELS = [
  { value: "1", label: "Level 3" },
  { value: "2", label: "Level 2" },
  { value: "3", label: "Level 1" },
  { value: "4", label: "Critical" },
];

interface ReviewFormData {
  is_confirmed: boolean;
  rejection_reason?: string;
}

interface CreateCaseFormData {
  crime_level: string;
  crime_location?: string;
  detective_id?: number;
}

interface EditFormData {
  description: string;
}

export const ComplaintDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { session } = useAuthStore();
  const complaintId = Number(id);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedCrimeLevel, setSelectedCrimeLevel] = useState<string>("");

  const {
    data: complaint,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["complaint", complaintId],
    queryFn: () => getComplaintById(complaintId),
    enabled: !isNaN(complaintId),
  });

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
    setValue,
  } = useForm<ReviewFormData>({
    defaultValues: {
      is_confirmed: false,
      rejection_reason: "",
    },
  });

  // Crime level selection form
  const { register: registerCase, getValues: getCaseValues } =
    useForm<CreateCaseFormData>({
      defaultValues: {
        crime_level: "",
        crime_location: "",
        detective_id: undefined,
      },
    });

  // Edit form
  const {
    register: registerEdit,
    handleSubmit: handleSubmitEdit,
    formState: { errors: editErrors, isSubmitting: isEditSubmitting },
    setValue: setEditValue,
  } = useForm<EditFormData>({
    defaultValues: {
      description: "",
    },
  });

  useEffect(() => {
    if (complaint) {
      setEditValue("description", complaint.description);
    }
  }, [complaint, setEditValue]);

  const isConfirmed = watch("is_confirmed");
  const isOfficer = session?.user.role_title === "Police/Patrol Officer";
  const isCadet = session?.user.role_title === "Cadet";

  // Reset crime level when approve is deselected
  useEffect(() => {
    if (!isConfirmed) {
      setSelectedCrimeLevel("");
    }
  }, [isConfirmed]);

  const updateComplaintMutation = useMutation({
    mutationFn: (data: EditFormData) => updateComplaint(complaintId, data),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ["complaint", complaintId] });
      queryClient.invalidateQueries({ queryKey: ["complaints"] });

      const newStatus = response?.status;
      console.log("Updated complaint status:", newStatus);

      if (newStatus === "pending_cadet") {
        toast.success("Complaint updated and sent for cadet review.");
      } else {
        toast.success("Complaint updated successfully.");
      }

      setIsEditing(false);

      setTimeout(() => {
        refetch();
      }, 100);
    },
    onError: () => {
      toast.error("Failed to update complaint");
    },
  });

  // Review as Cadet
  const reviewCadetMutation = useMutation({
    mutationFn: (data: ComplaintReviewRequest) =>
      reviewComplaintAsCadet(complaintId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["complaint", complaintId] });
      queryClient.invalidateQueries({ queryKey: ["complaints"] });
      toast.success("Complaint reviewed successfully");
      refetch();
    },
    onError: () => {
      toast.error("Failed to review complaint");
    },
  });

  // Create Crime and Case (for Officer approval)
  const createCrimeAndCaseMutation = useMutation({
    mutationFn: async (data: CreateCaseFormData) => {
      if (!complaint) throw new Error("Complaint not found");

      const crimeResponse = await http.post("/crime/crimes/", {
        title: `Case from Complaint #${complaint.id}`,
        description: complaint.description.substring(0, 200),
        level: data.crime_level,
        location: data.crime_location || "Unknown",
        committed_at: new Date().toISOString(),
      });

      const caseData = {
        crime: crimeResponse.data.id,
        detective: data.detective_id ? Number(data.detective_id) : 0,
        is_from_crime_scene: false,
      };

      const caseResponse = await createCase(caseData);

      await http.patch(`/crime/complaints/${complaintId}/`, {
        case: caseResponse.id,
      });

      return caseResponse;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["complaint", complaintId] });
      queryClient.invalidateQueries({ queryKey: ["complaints"] });
      queryClient.invalidateQueries({ queryKey: ["cases"] });
      toast.success("Case created successfully from complaint");
      navigate("/cases");
    },
    onError: () => {
      toast.error("Failed to create case");
    },
  });

  const onSubmit = async (data: ReviewFormData) => {
    const reviewData: ComplaintReviewRequest = {
      is_confirmed: data.is_confirmed,
      rejection_reason: data.rejection_reason,
    };

    if (isCadet) {
      reviewCadetMutation.mutate(reviewData);
    } else if (isOfficer) {
      if (data.is_confirmed) {
        if (!selectedCrimeLevel) {
          toast.error("Please select a crime level");
          return;
        }

        await reviewOfficerMutation.mutateAsync(reviewData);

        createCrimeAndCaseMutation.mutate({
          crime_level: selectedCrimeLevel,
          crime_location: getCaseValues("crime_location"),
          detective_id: getCaseValues("detective_id"),
        });
      } else {
        // Officer rejecting - just submit the review
        reviewOfficerMutation.mutate(reviewData);
      }
    }
  };

  const reviewOfficerMutation = useMutation({
    mutationFn: (data: ComplaintReviewRequest) =>
      reviewComplaintAsOfficer(complaintId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["complaint", complaintId] });
      queryClient.invalidateQueries({ queryKey: ["complaints"] });

      if (isConfirmed) {
        toast.success("Complaint approved");
      } else {
        toast.success("Complaint rejected successfully");
        refetch();
      }
    },
    onError: () => {
      toast.error("Failed to review complaint");
    },
  });

  const onEditSubmit = (data: EditFormData) => {
    if (data.description === complaint?.description) {
      toast.info("No changes made to the complaint.");
      setIsEditing(false);
      return;
    }

    updateComplaintMutation.mutate(data);
  };

  const isComplainant = complaint?.complainants.includes(session?.user.id || 0);

  const canReview = (() => {
    if (!complaint || !session) return false;

    if (isCadet) {
      return ["pending_cadet", "rejected_by_officer"].includes(
        complaint.status,
      );
    }

    if (isOfficer) {
      return complaint.status === "pending_officer";
    }

    return false;
  })();

  const canEdit =
    complaint && complaint.status === "rejected_by_cadet" && isComplainant;

  if (isLoading)
    return (
      <div className="p-8 text-center text-muted-foreground">
        Loading complaint...
      </div>
    );

  if (isError)
    return (
      <div className="p-8 text-center text-destructive">
        Complaint was transfered.
      </div>
    );

  if (!complaint)
    return (
      <div className="p-8 text-center text-muted-foreground">
        Complaint not found
      </div>
    );

  return (
    <div className="container mx-auto py-8 max-w-4xl space-y-6">
      <Button
        variant="ghost"
        className="pl-0 hover:bg-transparent hover:text-primary"
        onClick={() => navigate("/complaints")}
      >
        <HugeiconsIcon icon={ArrowLeft01Icon} className="mr-2 h-4 w-4" />
        Back to Complaints
      </Button>

      {/* Main Card */}
      <Card>
        <CardHeader className="space-y-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <CardTitle>Complaint #{complaint.id}</CardTitle>
              <CardDescription>
                Filed on {format(new Date(complaint.created_at), "PPP p")}
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              {canEdit && !isEditing && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setIsEditing(true);
                  }}
                  className="gap-2"
                >
                  <HugeiconsIcon icon={PencilEdit01Icon} className="h-4 w-4" />
                  Edit Complaint
                </Button>
              )}
              <ComplaintStatusBadge status={complaint.status} />
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Complaint Description - Show edit form or read-only */}
          {isEditing ? (
            <form
              onSubmit={handleSubmitEdit(onEditSubmit)}
              className="space-y-4"
            >
              <h3 className="font-semibold">Edit Your Complaint</h3>

              {/* Status change indicator */}
              <div className="bg-blue-50 dark:bg-blue-950/20 p-3 rounded border border-blue-200 dark:border-blue-900">
                <p className="text-xs text-blue-800 dark:text-blue-200">
                  After submitting your update, the complaint status will change
                  to <span className="font-bold">pending_cadet</span> and will
                  be reviewed again by a cadet.
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-description">Description</Label>
                <Textarea
                  id="edit-description"
                  className="min-h-[200px]"
                  placeholder="Update your complaint description..."
                  {...registerEdit("description", {
                    required: "Description is required",
                    minLength: {
                      value: 20,
                      message: "Description must be at least 20 characters",
                    },
                  })}
                />
                {editErrors.description && (
                  <p className="text-sm text-destructive">
                    {editErrors.description.message}
                  </p>
                )}
              </div>
              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsEditing(false)}
                  disabled={isEditSubmitting}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={
                    isEditSubmitting || updateComplaintMutation.isPending
                  }
                >
                  {updateComplaintMutation.isPending
                    ? "Updating..."
                    : "Submit Update"}
                </Button>
              </div>
            </form>
          ) : (
            <div>
              <h3 className="font-semibold mb-2">Description</h3>
              <p className="text-foreground bg-muted/50 p-4 rounded-lg whitespace-pre-wrap">
                {complaint.description}
              </p>
            </div>
          )}

          {/* Next step indicator for rejected complaints */}
          {complaint.status === "rejected_by_cadet" &&
            isComplainant &&
            !isEditing && (
              <div className="bg-green-50 dark:bg-green-950/20 p-4 rounded border border-green-200 dark:border-green-900">
                <p className="text-sm text-green-800 dark:text-green-200">
                  Click the "Edit Complaint" button to update your complaint
                  based on the feedback. After submitting, it will be sent back
                  to a cadet for review (status:{" "}
                  <span className="font-bold">pending_cadet</span>).
                </p>
              </div>
            )}

          {/* Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Complainants</p>
              <p className="font-semibold mt-1">
                {complaint.complainants.length}
              </p>
              {complaint.complainants_details && (
                <div className="mt-2 space-y-1">
                  {complaint.complainants_details.map((c) => (
                    <Badge key={c.id} variant="outline">
                      {c.first_name} {c.last_name}
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            <div>
              <p className="text-sm text-muted-foreground">Assigned Cadet</p>
              <p className="font-semibold mt-1">
                {complaint.cadet_details?.username || "N/A"}
              </p>
            </div>

            <div>
              <p className="text-sm text-muted-foreground">Police Officer</p>
              <p className="font-semibold mt-1">
                {complaint.officer_details?.username || "N/A"}
              </p>
            </div>

            <div>
              <p className="text-sm text-muted-foreground">Rejection Count</p>
              <p
                className={`font-semibold mt-1 ${
                  complaint.rejection_count >= 3 ? "text-destructive" : ""
                }`}
              >
                {complaint.rejection_count}/3
              </p>
            </div>
          </div>

          {/* Rejection Reasons */}
          {complaint.cadet_rejection_reason &&
            complaint.cadet_rejection_reason !== "Null" && (
              <div className="bg-red-50 dark:bg-red-950/20 p-4 rounded border border-red-200 dark:border-red-900">
                <p className="text-sm font-semibold text-red-900 dark:text-red-300 mb-2">
                  Cadet Rejection Reason
                </p>
                <p className="text-sm text-red-800 dark:text-red-200">
                  {complaint.cadet_rejection_reason}
                </p>
                {complaint.status === "rejected_by_cadet" &&
                  isComplainant &&
                  !isEditing && (
                    <p className="text-sm text-red-600 dark:text-red-400 mt-2">
                      Please edit your complaint based on the feedback above and
                      resubmit.
                    </p>
                  )}
              </div>
            )}

          {complaint.officer_rejection_reason && (
            <div className="bg-orange-50 dark:bg-orange-950/20 p-4 rounded border border-orange-200 dark:border-orange-900">
              <p className="text-sm font-semibold text-orange-900 dark:text-orange-300 mb-2">
                Officer Rejection Reason
              </p>
              <p className="text-sm text-orange-800 dark:text-orange-200">
                {complaint.officer_rejection_reason}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Review Form - For Cadet or Officer */}
      {canReview && (
        <Card className="border-blue-200 dark:border-blue-900 bg-blue-50 dark:bg-blue-950/20">
          <CardHeader>
            <CardTitle className="text-lg">
              {isCadet ? "Cadet Review" : "Officer Review"}
            </CardTitle>
            {isCadet && complaint.status === "rejected_by_officer" && (
              <CardDescription className="text-purple-600 dark:text-purple-400">
                This complaint was rejected by an officer. Please review it
                again.
              </CardDescription>
            )}
          </CardHeader>

          <form onSubmit={handleSubmit(onSubmit)}>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <Label>Decision</Label>
                <div className="flex gap-4">
                  <button
                    type="button"
                    className={`flex-1 p-4 border-2 rounded-lg transition-all ${
                      isConfirmed
                        ? "border-green-500 bg-green-50 dark:bg-green-950/20"
                        : "border-muted hover:border-green-300"
                    }`}
                    onClick={() => setValue("is_confirmed", true)}
                  >
                    <div className="flex items-center justify-center gap-2">
                      <HugeiconsIcon
                        icon={CheckSquare}
                        className="h-5 w-5 text-green-600"
                      />
                      <span className="font-semibold text-green-700 dark:text-green-300">
                        Approve
                      </span>
                    </div>
                  </button>

                  <button
                    type="button"
                    className={`flex-1 p-4 border-2 rounded-lg transition-all ${
                      !isConfirmed
                        ? "border-red-500 bg-red-50 dark:bg-red-950/20"
                        : "border-muted hover:border-red-300"
                    }`}
                    onClick={() => setValue("is_confirmed", false)}
                  >
                    <div className="flex items-center justify-center gap-2">
                      <HugeiconsIcon
                        icon={Delete02Icon}
                        className="h-5 w-5 text-red-600"
                      />
                      <span className="font-semibold text-red-700 dark:text-red-300">
                        Reject
                      </span>
                    </div>
                  </button>
                </div>
              </div>

              {!isConfirmed && (
                <div className="space-y-2">
                  <Label htmlFor="rejection_reason">
                    Reason for Rejection <span className="text-red-500">*</span>
                  </Label>
                  <Textarea
                    id="rejection_reason"
                    placeholder="Explain why you are rejecting this complaint..."
                    className="min-h-[100px]"
                    {...register("rejection_reason", {
                      required: !isConfirmed && "Rejection reason is required",
                    })}
                  />
                  {errors.rejection_reason && (
                    <p className="text-sm text-destructive">
                      {errors.rejection_reason.message}
                    </p>
                  )}
                </div>
              )}

              {/* Crime Level Selection - Only for Officers when approving */}
              {isConfirmed && isOfficer && (
                <div className="mt-6 p-4 border-2 border-green-200 dark:border-green-800 rounded-lg bg-green-50/50 dark:bg-green-950/10">
                  <h4 className="font-semibold text-green-700 dark:text-green-300 mb-3">
                    Case Details
                  </h4>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="crime_level">Crime Level *</Label>
                      <Select
                        onValueChange={(value) => setSelectedCrimeLevel(value)}
                        value={selectedCrimeLevel}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select crime level" />
                        </SelectTrigger>
                        <SelectContent>
                          {CRIME_LEVELS.map((level) => (
                            <SelectItem key={level.value} value={level.value}>
                              {level.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="crime_location">
                        Crime Location (Optional)
                      </Label>
                      <Input
                        id="crime_location"
                        placeholder="Enter crime location"
                        {...registerCase("crime_location")}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="detective_id">
                        Assign Detective ID (Optional)
                      </Label>
                      <Input
                        id="detective_id"
                        type="number"
                        placeholder="Enter detective ID"
                        {...registerCase("detective_id", {
                          valueAsNumber: true,
                        })}
                      />
                    </div>

                    <div className="bg-blue-50 dark:bg-blue-950/20 p-3 rounded border border-blue-200 dark:border-blue-900">
                      <p className="text-xs text-blue-800 dark:text-blue-200">
                        After approving, a case will be created with the
                        selected crime level.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>

            <div className="border-t p-6 flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate("/complaints")}
                disabled={
                  isSubmitting ||
                  reviewCadetMutation.isPending ||
                  reviewOfficerMutation.isPending ||
                  createCrimeAndCaseMutation.isPending
                }
              >
                Back
              </Button>
              <Button
                type="submit"
                disabled={
                  isSubmitting ||
                  reviewCadetMutation.isPending ||
                  reviewOfficerMutation.isPending ||
                  createCrimeAndCaseMutation.isPending ||
                  (isConfirmed && isOfficer && !selectedCrimeLevel)
                }
              >
                {reviewCadetMutation.isPending ||
                reviewOfficerMutation.isPending ||
                createCrimeAndCaseMutation.isPending
                  ? "Processing..."
                  : isConfirmed && isOfficer
                    ? "Approve & Create Case"
                    : "Submit Review"}
              </Button>
            </div>
          </form>
        </Card>
      )}
    </div>
  );
};
