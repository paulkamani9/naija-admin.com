import { z } from "zod";
import type { InferSelectModel, InferInsertModel } from "drizzle-orm";
import { hospitals, hmos, insurancePlans, user } from "./schema";

// Server Action Result type for consistent API responses
export type ServerActionResult<T = void> = {
  success: boolean;
  data?: T;
  errors?: Array<{
    field?: string;
    message: string;
  }>;
};

// Database model types (inferred from schema)
export type User = InferSelectModel<typeof user>;
export type Hospital = InferSelectModel<typeof hospitals>;
export type Hmo = InferSelectModel<typeof hmos>;
export type InsurancePlan = InferSelectModel<typeof insurancePlans>;

// Insert types for creating new records
export type NewHospital = InferInsertModel<typeof hospitals>;
export type NewHmo = InferInsertModel<typeof hmos>;
export type NewInsurancePlan = InferInsertModel<typeof insurancePlans>;

// Input types for API operations (these will be validated with Zod)
export type CreateHospitalInput = {
  name: string;
  address?: string;
  phone?: string;
  email?: string;
  state?: string;
  localGovernment?: string;
};

export type UpdateHospitalInput = Partial<CreateHospitalInput>;

export type CreateHmoInput = {
  name: string;
  code?: string;
  hospitalId?: string;
};

export type UpdateHmoInput = Partial<CreateHmoInput>;

export type CreatePlanInput = {
  hmoId: string;
  hospitalId: string;
  name: string;
  planType: "family" | "individual" | "enterprise";
  durationYears: number;
  monthlyCostCents: number;
  yearlyCostCents: number;
  deductibleCents?: number;
  annualOutOfPocketLimitCents: number;
  annualMaxBenefitCents: number;
  description?: string;
  isActive?: boolean;
};

export type UpdatePlanInput = Partial<
  Omit<CreatePlanInput, "hmoId" | "hospitalId">
>;

// Query filter types
export type HospitalFilters = {
  state?: string;
  localGovernment?: string;
  adminId?: string;
};

export type HmoFilters = {
  hospitalId?: string;
  createdBy?: string;
};

export type PlanFilters = {
  hmoId?: string;
  hospitalId?: string;
  planType?: "family" | "individual" | "enterprise";
  isActive?: boolean;
};

// Pagination type
export type PaginationOptions = {
  limit?: number;
  offset?: number;
};

// Extended types with relations for API responses
export type HospitalWithAdmin = Hospital & {
  admin: Pick<User, "id" | "name" | "email">;
};

export type HmoWithRelations = Hmo & {
  hospital?: Pick<Hospital, "id" | "name" | "state">;
  creator: Pick<User, "id" | "name" | "email">;
};

export type PlanWithRelations = InsurancePlan & {
  hmo: Pick<Hmo, "id" | "name" | "code">;
  hospital: Pick<Hospital, "id" | "name" | "state">;
};
