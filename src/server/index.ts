/**
 * Central exports for all server actions
 * This allows for clean imports: import { createHospitalAction, createHmoAction } from '@/actions'
 */

// Hospital actions
export {
  createHospitalAction,
  getHospitalAction,
  getHospitalsAction,
  updateHospitalAction,
  deleteHospitalAction,
  getMyHospitalsAction,
} from "./hospitals";

// HMO actions
export {
  createHmoAction,
  getHmoAction,
  getHmosAction,
  updateHmoAction,
  deleteHmoAction,
  getHmosByHospitalAction,
} from "./hmos";

// Insurance Plan actions
export {
  createPlanAction,
  getPlanAction,
  getPlansAction,
  updatePlanAction,
  deletePlanAction,
  togglePlanActiveAction,
  getPlansByHmoAction,
  getPlansByHospitalAction,
} from "./plans";

// Re-export types for convenience
export type {
  ServerActionResult,
  Hospital,
  Hmo,
  InsurancePlan,
  CreateHospitalInput,
  UpdateHospitalInput,
  CreateHmoInput,
  UpdateHmoInput,
  CreatePlanInput,
  UpdatePlanInput,
  HospitalWithAdmin,
  HmoWithRelations,
  PlanWithRelations,
} from "@/db/types";
