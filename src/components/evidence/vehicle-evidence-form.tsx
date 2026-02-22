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

interface VehicleEvidenceFormProps {
  onSuccess?: () => void;
}

export function VehicleEvidenceForm({ onSuccess }: VehicleEvidenceFormProps) {
  const [identificationType, setIdentificationType] = useState<
    "plate" | "serial"
  >("plate");

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm<VehicleEvidenceFormData>({
    resolver: zodResolver(vehicleEvidenceSchema),
  });

  const createMutation = useMutation({
    mutationFn: createVehicleEvidence,
    onSuccess: () => {
      toast.success("Vehicle evidence recorded successfully");
      reset();
      setIdentificationType("plate");
      onSuccess?.();
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.message || "Failed to record vehicle evidence",
      );
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
    createMutation.mutate({
      ...data,
      created_at: new Date().toISOString(),
      created_by: 0, // Will be set by backend
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Vehicle Evidence</CardTitle>
        <CardDescription>
          Record information about vehicles found at or related to the crime
          scene
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              placeholder="e.g., Suspect's vehicle"
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
              placeholder="Detailed description and circumstances of discovery"
              rows={3}
              {...register("description")}
            />
            {errors.description && (
              <p className="text-sm text-red-500">
                {errors.description.message}
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="vehicle_model">Vehicle Model</Label>
              <Input
                id="vehicle_model"
                placeholder="e.g., Toyota Camry 2020"
                {...register("vehicle_model")}
              />
              {errors.vehicle_model && (
                <p className="text-sm text-red-500">
                  {errors.vehicle_model.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="color">Color</Label>
              <Input
                id="color"
                placeholder="e.g., Black, Silver"
                {...register("color")}
              />
              {errors.color && (
                <p className="text-sm text-red-500">{errors.color.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-4">
            <Label>Vehicle Identification</Label>
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
                <span className="text-sm">Serial Number</span>
              </label>
            </div>

            {identificationType === "plate" ? (
              <div className="space-y-2">
                <Label htmlFor="registration_plate_number">Plate Number</Label>
                <Input
                  id="registration_plate_number"
                  placeholder="e.g., ABC-1234"
                  {...register("registration_plate_number")}
                />
              </div>
            ) : (
              <div className="space-y-2">
                <Label htmlFor="serial_number">Serial Number (VIN)</Label>
                <Input
                  id="serial_number"
                  placeholder="e.g., 1HGBH41JXMN109186"
                  {...register("serial_number")}
                />
              </div>
            )}
            {errors.registration_plate_number && (
              <p className="text-sm text-red-500">
                {errors.registration_plate_number.message}
              </p>
            )}
            {errors.serial_number && (
              <p className="text-sm text-red-500">
                {errors.serial_number.message}
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
              : "Record Vehicle Evidence"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
