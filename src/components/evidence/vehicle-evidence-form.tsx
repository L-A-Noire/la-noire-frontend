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
  vehicleEvidenceSchema,
  type VehicleEvidenceFormData,
} from "@/schemas/evidence.schema";
import { createVehicleEvidence } from "@/api/evidence";
import { useAuthStore } from "@/stores/auth.store";
import { useNavigate, useParams } from "react-router-dom";

interface VehicleEvidenceFormProps {
  onSuccess?: () => void;
  initialCaseId?: number | null;
}

export function VehicleEvidenceForm({
  onSuccess,
  initialCaseId,
}: VehicleEvidenceFormProps) {
  const navigate = useNavigate();
  const { caseId: urlCaseId } = useParams<{ caseId: string }>();
  const { session } = useAuthStore();
  const [identificationType, setIdentificationType] = useState<
    "plate" | "serial"
  >("plate");

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
  } = useForm<VehicleEvidenceFormData>({
    resolver: zodResolver(vehicleEvidenceSchema),
    defaultValues: {
      case: effectiveCaseId,
    },
  });

  const createMutation = useMutation({
    mutationFn: createVehicleEvidence,
    onSuccess: (data) => {
      const message = data.case
        ? "Vehicle evidence added to case successfully."
        : "Vehicle evidence recorded successfully.";

      toast.success(message);
      reset();
      setIdentificationType("plate");

      if (onSuccess) {
        onSuccess();
      } else if (effectiveCaseId) {
        navigate(`/cases/${effectiveCaseId}/evidence`);
      } else {
        navigate(-1);
      }
    },
    onError: () => {
      toast.error("Failed to record vehicle evidence");
    },
  });

  const handleIdentificationTypeChange = (type: "plate" | "serial") => {
    setIdentificationType(type);
    if (type === "plate") {
      setValue("serial_number", null);
    } else {
      setValue("registration_plate_number", null);
    }
  };

  const onSubmit = (data: VehicleEvidenceFormData) => {
    if (!session?.user.id) {
      toast.error("You must be logged in to record evidence");
      return;
    }

    if (!effectiveCaseId) {
      toast.error("Case ID is missing");
      return;
    }

    // Validate required fields
    if (
      !data.title ||
      !data.description ||
      !data.location ||
      !data.seen_at ||
      !data.vehicle_model ||
      !data.color
    ) {
      toast.error("Please fill in all required fields");
      return;
    }

    // Validate that either plate or serial is provided
    const hasPlate =
      data.registration_plate_number &&
      data.registration_plate_number.trim().length > 0;
    const hasSerial =
      data.serial_number && data.serial_number.trim().length > 0;

    if (!hasPlate && !hasSerial) {
      toast.error("Either plate number or serial number must be provided");
      return;
    }

    if (hasPlate && hasSerial) {
      toast.error("Only one of plate number or serial number can be provided");
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
          {effectiveCaseId
            ? "Add Vehicle Evidence to Case"
            : "Vehicle Evidence"}
        </CardTitle>
        <CardDescription>
          {effectiveCaseId ? (
            <>Record vehicle evidence and add it to Case #{effectiveCaseId}</>
          ) : (
            <>
              Record information about vehicles found at or related to the crime
              scene
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
              placeholder="e.g., Suspect's vehicle"
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
              placeholder="Where was this vehicle found?"
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
              placeholder="Detailed description and circumstances of discovery"
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="vehicle_model">
                Vehicle Model <span className="text-red-500">*</span>
              </Label>
              <Input
                id="vehicle_model"
                placeholder="e.g., Toyota Camry 2020"
                {...register("vehicle_model")}
                className={errors.vehicle_model ? "border-red-500" : ""}
              />
              {errors.vehicle_model && (
                <p className="text-sm text-red-500">
                  {errors.vehicle_model.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="color">
                Color <span className="text-red-500">*</span>
              </Label>
              <Input
                id="color"
                placeholder="e.g., Black, Silver"
                {...register("color")}
                className={errors.color ? "border-red-500" : ""}
              />
              {errors.color && (
                <p className="text-sm text-red-500">{errors.color.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-4">
            <Label>
              Vehicle Identification <span className="text-red-500">*</span>
            </Label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="identificationType"
                  checked={identificationType === "plate"}
                  onChange={() => handleIdentificationTypeChange("plate")}
                  className="w-4 h-4"
                />
                <span className="text-sm">Plate Number</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="identificationType"
                  checked={identificationType === "serial"}
                  onChange={() => handleIdentificationTypeChange("serial")}
                  className="w-4 h-4"
                />
                <span className="text-sm">Serial Number (VIN)</span>
              </label>
            </div>

            {identificationType === "plate" ? (
              <div className="space-y-2">
                <Label htmlFor="registration_plate_number">Plate Number</Label>
                <Input
                  id="registration_plate_number"
                  placeholder="e.g., ABC-1234"
                  {...register("registration_plate_number")}
                  className={
                    errors.registration_plate_number ? "border-red-500" : ""
                  }
                />
                {errors.registration_plate_number && (
                  <p className="text-sm text-red-500">
                    {errors.registration_plate_number.message}
                  </p>
                )}
              </div>
            ) : (
              <div className="space-y-2">
                <Label htmlFor="serial_number">Serial Number (VIN)</Label>
                <Input
                  id="serial_number"
                  placeholder="e.g., 1HGBH41JXMN109186"
                  {...register("serial_number")}
                  className={errors.serial_number ? "border-red-500" : ""}
                />
                {errors.serial_number && (
                  <p className="text-sm text-red-500">
                    {errors.serial_number.message}
                  </p>
                )}
              </div>
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
                : "Record Vehicle Evidence"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
