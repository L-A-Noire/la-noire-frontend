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
  identificationEvidenceSchema,
  type IdentificationEvidenceFormData,
} from "@/schemas/evidence.schema";
import { createIdentificationEvidence } from "@/api/evidence";
import { useAuthStore } from "@/stores/auth.store";
import { useParams } from "react-router-dom";

interface IdentificationEvidenceFormProps {
  onSuccess?: () => void;
}

export function IdentificationEvidenceForm({
  onSuccess,
}: IdentificationEvidenceFormProps) {
  const { caseId } = useParams<{ caseId: string }>();
  const { session } = useAuthStore();
  const [additionalFields, setAdditionalFields] = useState<Record<string, any>>(
    {},
  );
  const [newFieldKey, setNewFieldKey] = useState("");
  const [newFieldValue, setNewFieldValue] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm<IdentificationEvidenceFormData>({
    resolver: zodResolver(identificationEvidenceSchema),
    defaultValues: {
      information: {},
      case: caseId ? parseInt(caseId) : 0,
    },
  });

  const createMutation = useMutation({
    mutationFn: createIdentificationEvidence,
    onSuccess: () => {
      toast.success("Identification evidence recorded successfully");
      reset();
      setAdditionalFields({});
      onSuccess?.();
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.message ||
          "Failed to record identification evidence",
      );
    },
  });

  const addField = () => {
    if (newFieldKey.trim() && newFieldValue.trim()) {
      const updated = { ...additionalFields, [newFieldKey]: newFieldValue };
      setAdditionalFields(updated);
      setValue("information", updated);
      setNewFieldKey("");
      setNewFieldValue("");
    }
  };

  const removeField = (key: string) => {
    const updated = { ...additionalFields };
    delete updated[key];
    setAdditionalFields(updated);
    setValue("information", updated);
  };

  const onSubmit = (data: IdentificationEvidenceFormData) => {
    if (!session?.user.id) {
      toast.error("You must be logged in to record evidence");
      return;
    }

    if (!caseId) {
      toast.error("Case ID is missing");
      return;
    }

    createMutation.mutate({
      ...data,
      case: parseInt(caseId),
      information:
        Object.keys(additionalFields).length > 0 ? additionalFields : undefined,
      created_at: new Date().toISOString(),
      created_by: session.user.id,
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Identification Documents</CardTitle>
        <CardDescription>
          Record identification documents or personal items found at the crime
          scene
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              placeholder="e.g., Driver's license, ID card"
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
              placeholder="Details about where and how the document was found"
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
              <Label htmlFor="owner_first_name">Owner's First Name</Label>
              <Input
                id="owner_first_name"
                placeholder="First name from document"
                {...register("owner_first_name")}
              />
              {errors.owner_first_name && (
                <p className="text-sm text-red-500">
                  {errors.owner_first_name.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="owner_last_name">Owner's Last Name</Label>
              <Input
                id="owner_last_name"
                placeholder="Last name from document"
                {...register("owner_last_name")}
              />
              {errors.owner_last_name && (
                <p className="text-sm text-red-500">
                  {errors.owner_last_name.message}
                </p>
              )}
            </div>
          </div>

          <div className="space-y-3">
            <Label>Additional Information (Optional)</Label>
            <p className="text-xs text-gray-500">
              Add any other details from the document as key-value pairs
            </p>

            {Object.keys(additionalFields).length > 0 && (
              <div className="space-y-2">
                {Object.entries(additionalFields).map(([key, value]) => (
                  <div
                    key={key}
                    className="flex items-center gap-2 p-2 bg-gray-50 rounded-md"
                  >
                    <div className="flex-1 grid grid-cols-2 gap-2">
                      <span className="text-sm font-medium">{key}:</span>
                      <span className="text-sm">{value}</span>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeField(key)}
                    >
                      Remove
                    </Button>
                  </div>
                ))}
              </div>
            )}

            <div className="flex gap-2">
              <Input
                placeholder="Field name (e.g., National ID, Address)"
                value={newFieldKey}
                onChange={(e) => setNewFieldKey(e.target.value)}
              />
              <Input
                placeholder="Value"
                value={newFieldValue}
                onChange={(e) => setNewFieldValue(e.target.value)}
              />
              <Button
                type="button"
                variant="outline"
                onClick={addField}
                disabled={!newFieldKey.trim() || !newFieldValue.trim()}
              >
                Add
              </Button>
            </div>
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={createMutation.isPending}
          >
            {createMutation.isPending
              ? "Recording..."
              : "Record Identification Evidence"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
