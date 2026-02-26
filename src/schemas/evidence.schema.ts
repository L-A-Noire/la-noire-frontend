import { z } from "zod";

// Base evidence schema
const baseEvidenceSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters").max(200),
  description: z.string().min(10, "Description must be at least 10 characters"),
  location: z.string().min(3, "Location is required"),
  seen_at: z.string().min(1, "Date and time are required"),
  case: z.number().nullable().optional(),
  created_at: z.string().optional(),
  created_by: z.number().optional(),
});

// Testimony schema
export const testimonySchema = baseEvidenceSchema.extend({
  transcription: z
    .string()
    .min(10, "Transcription must be at least 10 characters"),
  attachments: z.array(z.number()).optional(),
  attachment_files: z.array(z.instanceof(File)).optional(),
});

export type TestimonyFormData = z.infer<typeof testimonySchema>;

// Confirm testimony schema
export const confirmTestimonySchema = z.object({
  crime_level: z.enum(["1", "2", "3", "4"], {
    message: "Crime level is required",
  }),
});

export type ConfirmTestimonyFormData = z.infer<typeof confirmTestimonySchema>;

// Biological Evidence schema
export const biologicalEvidenceSchema = baseEvidenceSchema.extend({
  images: z.array(z.number()).min(1, "At least one image is required"),
  image_files: z.array(z.instanceof(File)).optional(),
  result: z.string().optional().nullable(),
  coronary: z.number().optional().nullable(),
});

export type BiologicalEvidenceFormData = z.infer<
  typeof biologicalEvidenceSchema
>;

// Vehicle Evidence schema
export const vehicleEvidenceSchema = baseEvidenceSchema
  .extend({
    vehicle_model: z.string().min(1, "Vehicle model is required"),
    color: z.string().min(1, "Color is required"),
    registration_plate_number: z.string().optional().nullable(),
    serial_number: z.string().optional().nullable(),
  })
  .refine(
    (data) => {
      const hasPlate =
        data.registration_plate_number &&
        data.registration_plate_number.length > 0;
      const hasSerial = data.serial_number && data.serial_number.length > 0;
      return (hasPlate && !hasSerial) || (!hasPlate && hasSerial);
    },
    {
      message:
        "Either registration plate number or serial number must be provided (not both)",
      path: ["registration_plate_number"],
    },
  );

export type VehicleEvidenceFormData = z.infer<typeof vehicleEvidenceSchema>;

// Identification Evidence schema
export const identificationEvidenceSchema = baseEvidenceSchema.extend({
  owner_first_name: z.string().min(1, "First name is required"),
  owner_last_name: z.string().min(1, "Last name is required"),
  information: z.record(z.string(), z.any()).optional(),
});

export type IdentificationEvidenceFormData = z.infer<
  typeof identificationEvidenceSchema
>;

// Other Evidence schema
export const otherEvidenceSchema = baseEvidenceSchema;

export type OtherEvidenceFormData = z.infer<typeof otherEvidenceSchema>;

// Image upload schema
export const imageUploadSchema = z.object({
  image: z.instanceof(File),
  uploaded_by: z.number().optional(),
});

export type ImageUploadFormData = z.infer<typeof imageUploadSchema>;

// Attachment upload schema
export const attachmentUploadSchema = z.object({
  file: z.instanceof(File),
  provided_by: z.number().optional(),
});

export type AttachmentUploadFormData = z.infer<typeof attachmentUploadSchema>;
