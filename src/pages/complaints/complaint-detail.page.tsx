import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getComplaintById,
  reviewComplaintAsCadet,
  reviewComplaintAsOfficer,
  createCaseFromComplaint,
} from "@/api/complaints";
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
import { HugeiconsIcon } from "@hugeicons/react";
import {
  ArrowLeft01Icon,
  CheckSquare,
  Delete02Icon,
} from "@hugeicons/core-free-icons";
import { format } from "date-fns";
import { toast } from "react-toastify";
import { ComplaintStatusBadge } from "@/components/complaints/complaint-status-badge";
import { useAuthStore } from "@/stores/auth.store";
import type { ComplaintReviewRequest } from "@/types/complaint.type";

interface ReviewFormData {
  is_confirmed: boolean;
  rejection_reason?: string;
}

export const ComplaintDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { session } = useAuthStore();
  const complaintId = Number(id);

  const {
    data: complaint,
    isLoading,
    isError,
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

  const isConfirmed = watch("is_confirmed");

  // Review as Cadet
  const reviewCadetMutation = useMutation({
    mutationFn: (data: ComplaintReviewRequest) =>
      reviewComplaintAsCadet(complaintId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["complaint", complaintId] });
      toast.success("Complaint reviewed successfully");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || "Failed to review complaint");
    },
  });

  // Review as Officer
  const reviewOfficerMutation = useMutation({
    mutationFn: (data: ComplaintReviewRequest) =>
      reviewComplaintAsOfficer(complaintId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["complaint", complaintId] });
      toast.success("Complaint reviewed successfully");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || "Failed to review complaint");
    },
  });

  // Create Case from Complaint
  const createCaseMutation = useMutation({
    mutationFn: () => createCaseFromComplaint(complaintId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["complaint", complaintId] });
      queryClient.invalidateQueries({ queryKey: ["cases"] });
      toast.success("Case created from complaint");
      navigate("/cases");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || "Failed to create case");
    },
  });

  const onSubmit = (data: ReviewFormData) => {
    const reviewData: ComplaintReviewRequest = {
      is_confirmed: data.is_confirmed,
      rejection_reason: data.rejection_reason,
    };

    if (session?.user.role_title === "Cadet") {
      reviewCadetMutation.mutate(reviewData);
    } else {
      reviewOfficerMutation.mutate(reviewData);
    }
  };

  const canReview =
    complaint &&
    ((session?.user.role_title === "Cadet" &&
      ["pending_cadet", "rejected_by_officer"].includes(complaint.status)) ||
      (session?.user.role_title === "Police/Patrol Officer" &&
        complaint.status === "pending_officer"));

  const canCreateCase =
    complaint &&
    complaint.status === "approved" &&
    session?.user.role_title === "Police/Patrol Officer";

  if (isLoading)
    return (
      <div className="p-8 text-center text-muted-foreground">
        Loading complaint...
      </div>
    );

  if (isError)
    return (
      <div className="p-8 text-center text-destructive">
        Error loading complaint
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
            <ComplaintStatusBadge status={complaint.status} />
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Complaint Description */}
          <div>
            <h3 className="font-semibold mb-2">Description</h3>
            <p className="text-foreground bg-muted/50 p-4 rounded-lg whitespace-pre-wrap">
              {complaint.description}
            </p>
          </div>

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
          {complaint.cadet_rejection_reason && (
            <div className="bg-red-50 dark:bg-red-950/20 p-4 rounded border border-red-200 dark:border-red-900">
              <p className="text-sm font-semibold text-red-900 dark:text-red-300 mb-2">
                Cadet Rejection Reason
              </p>
              <p className="text-sm text-red-800 dark:text-red-200">
                {complaint.cadet_rejection_reason}
              </p>
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
              {session?.user.role_title === "Cadet"
                ? "Cadet Review"
                : "Officer Review"}
            </CardTitle>
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
                  <Label htmlFor="reason">
                    Reason for Rejection <span className="text-red-500">*</span>
                  </Label>
                  <Textarea
                    id="reason"
                    placeholder="Explain why you are rejecting this complaint..."
                    className="min-h-[100px]"
                    {...register("rejection_reason", {
                      validate: (value) => {
                        if (!isConfirmed && !value) {
                          return "Rejection reason is required";
                        }
                        return true;
                      },
                    })}
                  />
                  {errors.rejection_reason && (
                    <p className="text-sm text-destructive">
                      {errors.rejection_reason.message}
                    </p>
                  )}
                </div>
              )}
            </CardContent>

            <div className="border-t p-6 flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate("/complaints")}
                disabled={isSubmitting}
              >
                Back
              </Button>
              <Button
                type="submit"
                disabled={
                  isSubmitting ||
                  reviewCadetMutation.isPending ||
                  reviewOfficerMutation.isPending
                }
              >
                {reviewCadetMutation.isPending ||
                reviewOfficerMutation.isPending
                  ? "Submitting..."
                  : "Submit Review"}
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* Create Case Button - For Officer when approved */}
      {canCreateCase && (
        <Card className="border-green-200 dark:border-green-900 bg-green-50 dark:bg-green-950/20">
          <CardHeader>
            <CardTitle className="text-lg">Complaint Approved</CardTitle>
            <CardDescription>
              Create a case from this approved complaint
            </CardDescription>
          </CardHeader>

          <div className="p-6 flex gap-2 justify-end border-t">
            <Button
              variant="outline"
              onClick={() => navigate("/complaints")}
              disabled={createCaseMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              onClick={() => createCaseMutation.mutate()}
              disabled={createCaseMutation.isPending}
            >
              {createCaseMutation.isPending ? "Creating..." : "Create Case"}
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
};
