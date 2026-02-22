import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowLeft01Icon } from "@hugeicons/core-free-icons";
import { createEvidence } from "@/api/evidence";
import type {
  CreateEvidenceRequest,
  EvidenceType,
  ForensicSubType,
} from "@/types/evidence.type";

const evidenceTypes: {
  value: EvidenceType;
  label: string;
  description: string;
}[] = [
  {
    value: "witness_testimony",
    label: "Witness Testimony",
    description: "Statements from witnesses or local residents",
  },
  {
    value: "forensic",
    label: "Forensic Evidence",
    description: "Biological & medical evidence (DNA, blood, hair)",
  },
  {
    value: "vehicle",
    label: "Vehicle Evidence",
    description: "Information about vehicles related to the crime",
  },
  {
    value: "identification",
    label: "Identification",
    description: "Suspect identification documents found at scene",
  },
  { value: "other", label: "Other", description: "Other types of evidence" },
];

const forensicTypes: { value: ForensicSubType; label: string }[] = [
  { value: "blood", label: "Blood Sample" },
  { value: "hair", label: "Hair Sample" },
  { value: "fingerprint", label: "Fingerprint" },
  { value: "dna", label: "DNA Sample" },
  { value: "fibers", label: "Fibers/Fabrics" },
  { value: "toxicology", label: "Toxicology" },
];

export const RecordEvidencePage = () => {
  const navigate = useNavigate();
  const { caseId } = useParams<{ caseId: string }>();
  const [selectedType, setSelectedType] = useState<EvidenceType | "">(``);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateEvidenceRequest>({
    defaultValues: {
      case: caseId ? parseInt(caseId) : 0,
      evidence_type: "witness_testimony",
      recorded_at: new Date().toISOString(),
      test_status: "pending",
      info_type: "plate",
    },
  });

  const mutation = useMutation({
    mutationFn: createEvidence,
    onSuccess: () => {
      toast.success("Evidence recorded successfully!");
      reset();
      navigate(`/cases/${caseId}`);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || "Failed to record evidence");
    },
  });

  const onSubmit = (data: CreateEvidenceRequest) => {
    if (!selectedType) {
      toast.error("Please select evidence type");
      return;
    }
    mutation.mutate({ ...data, evidence_type: selectedType });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">Record Evidence</h1>
          <p className="text-sm text-muted-foreground">Case #{caseId}</p>
        </div>
        <Button
          variant="ghost"
          onClick={() => navigate(`/cases/${caseId}`)}
          className="gap-2"
        >
          <HugeiconsIcon icon={ArrowLeft01Icon} className="h-4 w-4" />
          Back to Case
        </Button>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Step 1: Select Evidence Type */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">
              Step 1: Select Evidence Type
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {evidenceTypes.map((type) => (
                <button
                  key={type.value}
                  type="button"
                  onClick={() => {
                    setSelectedType(type.value);
                  }}
                  className={`p-4 rounded-lg border-2 transition-all text-left ${
                    selectedType === type.value
                      ? "border-primary bg-primary/5"
                      : "border-muted hover:border-muted-foreground/50"
                  }`}
                >
                  <h3 className="font-semibold">{type.label}</h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    {type.description}
                  </p>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Step 2: Basic Information */}
        {selectedType && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">
                Step 2: Basic Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  placeholder="Brief title for this evidence"
                  {...register("title", { required: "Title is required" })}
                  className={errors.title ? "border-destructive" : ""}
                />
                {errors.title && (
                  <p className="text-xs text-destructive mt-1">
                    {errors.title.message}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  placeholder="Detailed description of the evidence"
                  {...register("description", {
                    required: "Description is required",
                    minLength: { value: 20, message: "At least 20 characters" },
                  })}
                  className={errors.description ? "border-destructive" : ""}
                  rows={4}
                />
                {errors.description && (
                  <p className="text-xs text-destructive mt-1">
                    {errors.description.message}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="recorded_at">Recorded Date & Time *</Label>
                <Input
                  id="recorded_at"
                  type="datetime-local"
                  {...register("recorded_at", { required: "Date is required" })}
                  className={errors.recorded_at ? "border-destructive" : ""}
                />
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 3: Type-Specific Information */}
        {selectedType === "witness_testimony" && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Witness Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="witness_name">Witness Name</Label>
                <Input
                  id="witness_name"
                  placeholder="Full name of the witness"
                  {...register("witness_name")}
                />
              </div>

              <div>
                <Label htmlFor="witness_contact">Contact Information</Label>
                <Input
                  id="witness_contact"
                  placeholder="Phone or email"
                  {...register("witness_contact")}
                />
              </div>

              <div>
                <Label htmlFor="statement">Statement *</Label>
                <Textarea
                  id="statement"
                  placeholder="Witness statement or testimony"
                  {...register("statement", {
                    required: "Statement is required",
                  })}
                  rows={5}
                  className={errors.statement ? "border-destructive" : ""}
                />
              </div>

              <div>
                <Label>Media Files (Optional)</Label>
                <Input
                  type="file"
                  multiple
                  accept="image/*,video/*,audio/*"
                  className="cursor-pointer"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Upload images, videos, or audio recordings
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {selectedType === "forensic" && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Forensic Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="forensic_type">Forensic Type *</Label>
                <Select
                  {...register("forensic_type", {
                    required: "Type is required",
                  })}
                  defaultValue=""
                >
                  <option value="">Select type...</option>
                  {forensicTypes.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </Select>
              </div>

              <div>
                <Label htmlFor="collection_location">Collection Location</Label>
                <Input
                  id="collection_location"
                  placeholder="Where evidence was collected"
                  {...register("collection_location")}
                />
              </div>

              <div>
                <Label htmlFor="test_status">Test Status</Label>
                <Select {...register("test_status")}>
                  <option value="pending">Pending</option>
                  <option value="in_progress">In Progress</option>
                  <option value="completed">Completed</option>
                  <option value="error">Error</option>
                </Select>
              </div>
            </CardContent>
          </Card>
        )}

        {selectedType === "vehicle" && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Vehicle Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="vehicle_model">Vehicle Model</Label>
                  <Input
                    id="vehicle_model"
                    placeholder="e.g., Toyota Camry"
                    {...register("vehicle_model")}
                  />
                </div>
                <div>
                  <Label htmlFor="vehicle_color">Color</Label>
                  <Input
                    id="vehicle_color"
                    placeholder="e.g., Black"
                    {...register("vehicle_color")}
                  />
                </div>
              </div>

              <div>
                <Label>Identification Type</Label>
                <div className="flex gap-4 mt-2">
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      value="plate"
                      {...register("info_type")}
                      defaultChecked
                    />
                    <span className="text-sm">Plate Number</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      value="serial"
                      {...register("info_type")}
                    />
                    <span className="text-sm">Serial Number</span>
                  </label>
                </div>
              </div>

              <div>
                <Label htmlFor="plate_number">Plate Number</Label>
                <Input
                  id="plate_number"
                  placeholder="License plate"
                  {...register("plate_number")}
                />
              </div>

              <div>
                <Label htmlFor="serial_number">Serial Number</Label>
                <Input
                  id="serial_number"
                  placeholder="VIN or serial number"
                  {...register("serial_number")}
                />
              </div>
            </CardContent>
          </Card>
        )}

        {selectedType === "identification" && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">
                Identification Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="discovered_person_name">Person Name</Label>
                <Input
                  id="discovered_person_name"
                  placeholder="Full name from ID"
                  {...register("discovered_person_name")}
                />
              </div>

              <div className="p-3 bg-muted/50 rounded border border-dashed">
                <p className="text-xs font-semibold text-muted-foreground mb-2">
                  Additional Details (Key-Value)
                </p>
                <p className="text-xs text-muted-foreground">
                  Add any additional information from the document
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Guidelines */}
        <Card className="border-l-4 border-l-blue-500">
          <CardHeader>
            <CardTitle className="text-sm">
              Evidence Documentation Guidelines
            </CardTitle>
          </CardHeader>
          <CardContent className="text-xs space-y-2 text-muted-foreground">
            <p>
              • All evidence must have a clear title and detailed description
            </p>
            <p>
              • Record the exact date and time evidence was found or collected
            </p>
            <p>• For forensic evidence, note why testing is needed</p>
            <p>• For witness testimony, capture complete statements</p>
            <p>• For vehicle evidence, ensure legal information is complete</p>
            <p>
              • Attach supporting media files (images, videos, audio) when
              available
            </p>
          </CardContent>
        </Card>

        {/* Submit */}
        <div className="flex justify-between pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate(`/cases/${caseId}`)}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={!selectedType || mutation.isPending}
            className="px-8"
          >
            {mutation.isPending ? "Recording..." : "Record Evidence"}
          </Button>
        </div>
      </form>
    </div>
  );
};
