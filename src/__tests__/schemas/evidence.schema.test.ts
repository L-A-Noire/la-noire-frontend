import {
  vehicleEvidenceSchema,
  testimonySchema,
  confirmTestimonySchema,
  biologicalEvidenceSchema,
} from "@/schemas/evidence.schema";

const baseEvidence = {
  title: "Crime scene item",
  description: "A detailed description of the evidence found at the scene",
  location: "Downtown LA",
  seen_at: "2024-06-15T10:30:00Z",
};

describe("vehicleEvidenceSchema", () => {
  const validWithPlate = {
    ...baseEvidence,
    vehicle_model: "1947 Buick Super",
    color: "Black",
    registration_plate_number: "4ABC123",
    serial_number: null,
  };

  const validWithSerial = {
    ...baseEvidence,
    vehicle_model: "1947 Buick Super",
    color: "Black",
    registration_plate_number: null,
    serial_number: "VIN-1234567890",
  };

  it("should accept vehicle with only plate number", () => {
    const result = vehicleEvidenceSchema.safeParse(validWithPlate);
    expect(result.success).toBe(true);
  });

  it("should accept vehicle with only serial number", () => {
    const result = vehicleEvidenceSchema.safeParse(validWithSerial);
    expect(result.success).toBe(true);
  });

  it("should reject vehicle with both plate and serial number", () => {
    const result = vehicleEvidenceSchema.safeParse({
      ...baseEvidence,
      vehicle_model: "1947 Buick Super",
      color: "Black",
      registration_plate_number: "4ABC123",
      serial_number: "VIN-1234567890",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      const refineError = result.error.issues.find((i) =>
        i.path.includes("registration_plate_number"),
      );
      expect(refineError?.message).toContain(
        "Either registration plate number or serial number",
      );
    }
  });

  it("should reject vehicle with neither plate nor serial number", () => {
    const result = vehicleEvidenceSchema.safeParse({
      ...baseEvidence,
      vehicle_model: "1947 Buick Super",
      color: "Black",
      registration_plate_number: null,
      serial_number: null,
    });
    expect(result.success).toBe(false);
  });

  it("should reject missing vehicle_model", () => {
    const { vehicle_model: _, ...rest } = validWithPlate;
    const result = vehicleEvidenceSchema.safeParse(rest);
    expect(result.success).toBe(false);
  });
});

describe("testimonySchema", () => {
  it("should validate a correct testimony", () => {
    const result = testimonySchema.safeParse({
      ...baseEvidence,
      transcription: "The witness reported seeing a suspicious vehicle at 10pm",
    });
    expect(result.success).toBe(true);
  });

  it("should reject transcription shorter than 10 characters", () => {
    const result = testimonySchema.safeParse({
      ...baseEvidence,
      transcription: "Short",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      const error = result.error.issues.find(
        (i) => i.path[0] === "transcription",
      );
      expect(error?.message).toBe(
        "Transcription must be at least 10 characters",
      );
    }
  });

  it("should reject title shorter than 3 characters", () => {
    const result = testimonySchema.safeParse({
      ...baseEvidence,
      title: "AB",
      transcription: "A long enough transcription text here",
    });
    expect(result.success).toBe(false);
  });
});

describe("confirmTestimonySchema", () => {
  it.each(["1", "2", "3", "4"])("should accept crime level %s", (level) => {
    const result = confirmTestimonySchema.safeParse({ crime_level: level });
    expect(result.success).toBe(true);
  });

  it("should reject invalid crime level", () => {
    const result = confirmTestimonySchema.safeParse({ crime_level: "5" });
    expect(result.success).toBe(false);
  });
});

describe("biologicalEvidenceSchema", () => {
  it("should require at least one image", () => {
    const result = biologicalEvidenceSchema.safeParse({
      ...baseEvidence,
      images: [],
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      const error = result.error.issues.find((i) => i.path[0] === "images");
      expect(error?.message).toBe("At least one image is required");
    }
  });

  it("should accept valid biological evidence with images", () => {
    const result = biologicalEvidenceSchema.safeParse({
      ...baseEvidence,
      images: [1, 2],
      result: "DNA match found",
      coronary: null,
    });
    expect(result.success).toBe(true);
  });
});
