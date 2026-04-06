import { z } from "zod";

/** HTML forms / `JSON.stringify` often send `""` for empty fields; treat as omitted. */
function emptyStringToUndefined(value: unknown): unknown {
  if (value === "") return undefined;
  return value;
}

export const SUBLEASE_STATUSES = [
  "active",
  "closed",
  "expired",
  "removed",
] as const;

export const subleaseStatusSchema = z.enum(SUBLEASE_STATUSES);
export type SubleaseStatus = z.infer<typeof subleaseStatusSchema>;

const VALID_STATUS_TRANSITIONS: Record<string, SubleaseStatus[]> = {
  active: ["closed", "removed"],
  closed: ["active"],
  expired: [],
  removed: [],
};

export function isValidStatusTransition(
  from: string,
  to: SubleaseStatus,
): boolean {
  return VALID_STATUS_TRANSITIONS[from]?.includes(to) ?? false;
}

export const createSubleaseSchema = z
  .object({
    title: z.string().min(1, "Title is required").max(200),
    description: z.string().min(1, "Description is required").max(5000),
    apartmentName: z.string().min(1, "Apartment name is required").max(200),
    address: z.string().min(1, "Address is required").max(500),
    latitude: z.preprocess(
      emptyStringToUndefined,
      z.coerce.number().min(-90).max(90).nullable().optional(),
    ),
    longitude: z.preprocess(
      emptyStringToUndefined,
      z.coerce.number().min(-180).max(180).nullable().optional(),
    ),
    neighborhood: z.preprocess(
      emptyStringToUndefined,
      z.string().nullable().optional(),
    ),
    bedrooms: z.coerce.number().int().min(0).max(10),
    bathrooms: z.coerce.number().min(0).max(10),
    sqft: z.preprocess(
      emptyStringToUndefined,
      z.coerce.number().int().positive().nullable().optional(),
    ),
    monthlyRent: z.coerce.number().int().min(1).max(50000),
    deposit: z.preprocess(
      emptyStringToUndefined,
      z.coerce.number().int().min(0).nullable().optional(),
    ),
    leaseStart: z.coerce.date(),
    leaseEnd: z.coerce.date(),
    availableDate: z.coerce.date(),
    furnished: z.boolean().default(false),
    utilitiesIncluded: z.boolean().default(false),
    parkingIncluded: z.boolean().default(false),
    petFriendly: z.boolean().default(false),
    imageUrls: z.array(z.string().url()).max(20).default([]),
    contactEmail: z.preprocess(
      emptyStringToUndefined,
      z.string().email().nullable().optional(),
    ),
    contactPhone: z.preprocess(
      emptyStringToUndefined,
      z.string().max(20).nullable().optional(),
    ),
  })
  .refine((data) => data.leaseEnd > data.leaseStart, {
    message: "Lease end must be after lease start",
    path: ["leaseEnd"],
  });

export const updateSubleaseSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  description: z.string().min(1).max(5000).optional(),
  monthlyRent: z.coerce.number().int().min(1).max(50000).optional(),
  status: subleaseStatusSchema.optional(),
  availableDate: z.coerce.date().optional(),
});

export const roommateProfileSchema = z
  .object({
    name: z.string().min(1, "Name is required").max(100),
    age: z.preprocess(
      emptyStringToUndefined,
      z.coerce.number().int().min(16).max(100).nullable().optional(),
    ),
    gender: z.preprocess(
      emptyStringToUndefined,
      z.string().max(50).nullable().optional(),
    ),
    major: z.preprocess(
      emptyStringToUndefined,
      z.string().max(200).nullable().optional(),
    ),
    gradYear: z.preprocess(
      emptyStringToUndefined,
      z.coerce.number().int().min(2020).max(2035).nullable().optional(),
    ),
    bio: z.preprocess(
      emptyStringToUndefined,
      z.string().max(2000).nullable().optional(),
    ),
    budgetMin: z.preprocess(
      emptyStringToUndefined,
      z.coerce
        .number()
        .int()
        .min(0)
        .max(50000)
        .nullable()
        .optional(),
    ),
    budgetMax: z.preprocess(
      emptyStringToUndefined,
      z.coerce
        .number()
        .int()
        .min(0)
        .max(50000)
        .nullable()
        .optional(),
    ),
    moveInDate: z.preprocess(
      emptyStringToUndefined,
      z.coerce.date().nullable().optional(),
    ),
    preferredNeighborhoods: z.array(z.string()).default([]),
    sleepSchedule: z.preprocess(
      emptyStringToUndefined,
      z
        .enum(["early-bird", "night-owl", "flexible"])
        .nullable()
        .optional(),
    ),
    noiseLevel: z.preprocess(
      emptyStringToUndefined,
      z.enum(["quiet", "moderate", "social"]).nullable().optional(),
    ),
    cleanliness: z.preprocess(
      emptyStringToUndefined,
      z
        .enum(["very-clean", "clean", "relaxed"])
        .nullable()
        .optional(),
    ),
    guests: z.preprocess(
      emptyStringToUndefined,
      z.enum(["rarely", "sometimes", "often"]).nullable().optional(),
    ),
    smoking: z.boolean().default(false),
    pets: z.boolean().default(false),
  })
  .refine(
    (data) => {
      if (data.budgetMin != null && data.budgetMax != null) {
        return data.budgetMax >= data.budgetMin;
      }
      return true;
    },
    {
      message: "Maximum budget must be >= minimum budget",
      path: ["budgetMax"],
    },
  );

export const favoriteSchema = z.object({
  apartmentId: z.string().min(1, "apartmentId is required"),
});
