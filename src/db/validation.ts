import { z } from "zod";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { hospitals, hmos, insurancePlans } from "./schema";

// Base schemas generated from Drizzle tables
export const insertHospitalSchema = createInsertSchema(hospitals);
export const selectHospitalSchema = createSelectSchema(hospitals);
export const insertHmoSchema = createInsertSchema(hmos);
export const selectHmoSchema = createSelectSchema(hmos);
export const insertInsurancePlanSchema = createInsertSchema(insurancePlans);
export const selectInsurancePlanSchema = createSelectSchema(insurancePlans);

// Custom validation schemas for API inputs
export const createHospitalSchema = z.object({
  name: z
    .string()
    .min(2, "Hospital name must be at least 2 characters")
    .max(255),
  address: z.string().max(255).optional(),
  phone: z.string().max(32).optional(),
  email: z.string().email("Invalid email format").max(255).optional(),
  state: z.string().max(255).optional(),
  localGovernment: z.string().max(255).optional(),
});

export const updateHospitalSchema = createHospitalSchema.partial();

export const createHmoSchema = z.object({
  name: z.string().min(2, "HMO name must be at least 2 characters").max(255),
  code: z.string().max(50).optional(),
  hospitalId: z.string().uuid("Invalid hospital ID").optional(),
  logoUrl: z.string().url("Invalid URL").max(2048).optional(),
});

export const updateHmoSchema = createHmoSchema.partial();

export const createPlanSchema = z
  .object({
    hmoId: z.string().uuid("Invalid HMO ID"),
    hospitalId: z.string().uuid("Invalid hospital ID"),
    name: z.string().min(2, "Plan name must be at least 2 characters").max(255),
    planType: z.enum(["family", "individual", "enterprise"]),
    durationYears: z
      .number()
      .int()
      .min(1, "Duration must be at least 1 year")
      .max(10, "Duration cannot exceed 10 years"),
    monthlyCostCents: z
      .number()
      .int()
      .min(0, "Monthly cost cannot be negative"),
    yearlyCostCents: z.number().int().min(0, "Yearly cost cannot be negative"),
    deductibleCents: z
      .number()
      .int()
      .min(0, "Deductible cannot be negative")
      .optional()
      .default(0),
    annualOutOfPocketLimitCents: z
      .number()
      .int()
      .min(0, "Out-of-pocket limit cannot be negative"),
    annualMaxBenefitCents: z
      .number()
      .int()
      .min(0, "Max benefit cannot be negative"),
    description: z.string().max(2000, "Description too long").optional(),
    isActive: z.boolean().optional().default(true),
  })
  .refine(
    (data) => data.yearlyCostCents >= data.monthlyCostCents * 10, // Yearly should be at least 10 months worth
    {
      message: "Yearly cost should be at least 10 times the monthly cost",
      path: ["yearlyCostCents"],
    }
  )
  .refine(
    (data) => data.annualMaxBenefitCents >= data.annualOutOfPocketLimitCents,
    {
      message:
        "Annual max benefit must be at least equal to out-of-pocket limit",
      path: ["annualMaxBenefitCents"],
    }
  );

export const updatePlanSchema = createPlanSchema
  .omit({ hmoId: true, hospitalId: true })
  .partial();

// Query validation schemas
export const hospitalFiltersSchema = z.object({
  state: z.string().optional(),
  localGovernment: z.string().optional(),
  adminId: z.string().uuid().optional(),
});

export const hmoFiltersSchema = z.object({
  hospitalId: z.string().uuid().optional(),
  createdBy: z.string().uuid().optional(),
});

export const planFiltersSchema = z.object({
  hmoId: z.string().uuid().optional(),
  hospitalId: z.string().uuid().optional(),
  planType: z.enum(["family", "individual", "enterprise"]).optional(),
  isActive: z.boolean().optional(),
});

export const paginationSchema = z.object({
  limit: z.number().int().min(1).max(100).default(10),
  offset: z.number().int().min(0).default(0),
});

// Type exports for use in server actions
export type CreateHospitalInput = z.infer<typeof createHospitalSchema>;
export type UpdateHospitalInput = z.infer<typeof updateHospitalSchema>;
export type CreateHmoInput = z.infer<typeof createHmoSchema>;
export type UpdateHmoInput = z.infer<typeof updateHmoSchema>;
export type CreatePlanInput = z.infer<typeof createPlanSchema>;
export type UpdatePlanInput = z.infer<typeof updatePlanSchema>;
export type HospitalFilters = z.infer<typeof hospitalFiltersSchema>;
export type HmoFilters = z.infer<typeof hmoFiltersSchema>;
export type PlanFilters = z.infer<typeof planFiltersSchema>;
export type PaginationOptions = z.infer<typeof paginationSchema>;
