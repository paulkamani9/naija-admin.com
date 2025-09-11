import { eq, and, desc, sql, count } from "drizzle-orm";
import { db } from "./index";
import { hospitals, hmos, insurancePlans, user } from "./schema";
import type {
  Hospital,
  Hmo,
  InsurancePlan,
  HospitalWithAdmin,
  HmoWithRelations,
  PlanWithRelations,
  CreateHospitalInput,
  UpdateHospitalInput,
  CreateHmoInput,
  UpdateHmoInput,
  CreatePlanInput,
  UpdatePlanInput,
  HospitalFilters,
  HmoFilters,
  PlanFilters,
  PaginationOptions,
} from "./types";

/**
 * User Queries - Basic user operations for authentication context
 */
export class UserQueries {
  static async findById(id: string) {
    const result = await db.select().from(user).where(eq(user.id, id)).limit(1);
    return result[0] || null;
  }

  static async findByEmail(email: string) {
    const result = await db
      .select()
      .from(user)
      .where(eq(user.email, email))
      .limit(1);
    return result[0] || null;
  }
}

/**
 * Hospital Queries - CRUD operations for healthcare facilities
 */
export class HospitalQueries {
  static async create(
    input: CreateHospitalInput,
    adminId: string
  ): Promise<Hospital> {
    const [hospital] = await db
      .insert(hospitals)
      .values({
        ...input,
        adminId,
      })
      .returning();
    return hospital;
  }

  static async findById(id: string): Promise<Hospital | null> {
    const result = await db
      .select()
      .from(hospitals)
      .where(eq(hospitals.id, id))
      .limit(1);
    return result[0] || null;
  }

  static async findByIdWithAdmin(
    id: string
  ): Promise<HospitalWithAdmin | null> {
    const result = await db
      .select({
        id: hospitals.id,
        name: hospitals.name,
        address: hospitals.address,
        phone: hospitals.phone,
        email: hospitals.email,
        state: hospitals.state,
        localGovernment: hospitals.localGovernment,
        adminId: hospitals.adminId,
        createdAt: hospitals.createdAt,
        updatedAt: hospitals.updatedAt,
        admin: {
          id: user.id,
          name: user.name,
          email: user.email,
        },
      })
      .from(hospitals)
      .innerJoin(user, eq(hospitals.adminId, user.id))
      .where(eq(hospitals.id, id))
      .limit(1);

    return result[0] || null;
  }

  static async findMany(
    filters: HospitalFilters = {},
    pagination: PaginationOptions = { limit: 10, offset: 0 }
  ) {
    let query = db.select().from(hospitals);

    // Build WHERE conditions
    const conditions = [];
    if (filters.state) conditions.push(eq(hospitals.state, filters.state));
    if (filters.localGovernment)
      conditions.push(eq(hospitals.localGovernment, filters.localGovernment));
    if (filters.adminId)
      conditions.push(eq(hospitals.adminId, filters.adminId));

    if (conditions.length > 0) {
      query = query.where(and(...conditions)) as typeof query;
    }

    const results = await query
      .orderBy(desc(hospitals.createdAt))
      .limit(pagination.limit!)
      .offset(pagination.offset!);

    // Get total count for pagination
    let countQuery = db.select({ count: count() }).from(hospitals);
    if (conditions.length > 0) {
      countQuery = countQuery.where(and(...conditions)) as typeof countQuery;
    }
    const [{ count: total }] = await countQuery;

    return { data: results, total };
  }

  static async update(
    id: string,
    input: UpdateHospitalInput
  ): Promise<Hospital | null> {
    const [hospital] = await db
      .update(hospitals)
      .set(input)
      .where(eq(hospitals.id, id))
      .returning();
    return hospital || null;
  }

  static async delete(id: string): Promise<boolean> {
    const result = await db.delete(hospitals).where(eq(hospitals.id, id));
    return result.rowCount > 0;
  }

  static async findByAdmin(adminId: string) {
    return await db
      .select()
      .from(hospitals)
      .where(eq(hospitals.adminId, adminId));
  }
}

/**
 * HMO Queries - CRUD operations for Health Maintenance Organizations
 */
export class HmoQueries {
  static async create(input: CreateHmoInput, createdBy: string): Promise<Hmo> {
    const [hmo] = await db
      .insert(hmos)
      .values({
        ...input,
        createdBy,
      })
      .returning();
    return hmo;
  }

  static async findById(id: string): Promise<Hmo | null> {
    const result = await db.select().from(hmos).where(eq(hmos.id, id)).limit(1);
    return result[0] || null;
  }

  static async findByIdWithRelations(
    id: string
  ): Promise<HmoWithRelations | null> {
    const result = await db
      .select({
        id: hmos.id,
        name: hmos.name,
        code: hmos.code,
        hospitalId: hmos.hospitalId,
        createdBy: hmos.createdBy,
        createdAt: hmos.createdAt,
        updatedAt: hmos.updatedAt,
        hospital: hospitals,
        creator: {
          id: user.id,
          name: user.name,
          email: user.email,
        },
      })
      .from(hmos)
      .leftJoin(hospitals, eq(hmos.hospitalId, hospitals.id))
      .innerJoin(user, eq(hmos.createdBy, user.id))
      .where(eq(hmos.id, id))
      .limit(1);

    const row = result[0];
    if (!row) return null;

    return {
      ...row,
      hospital: row.hospital
        ? {
            id: row.hospital.id,
            name: row.hospital.name,
            state: row.hospital.state,
          }
        : undefined,
    };
  }

  static async findMany(
    filters: HmoFilters = {},
    pagination: PaginationOptions = { limit: 10, offset: 0 }
  ) {
    let query = db.select().from(hmos);

    const conditions = [];
    if (filters.hospitalId)
      conditions.push(eq(hmos.hospitalId, filters.hospitalId));
    if (filters.createdBy)
      conditions.push(eq(hmos.createdBy, filters.createdBy));

    if (conditions.length > 0) {
      query = query.where(and(...conditions)) as typeof query;
    }

    const results = await query
      .orderBy(desc(hmos.createdAt))
      .limit(pagination.limit!)
      .offset(pagination.offset!);

    let countQuery = db.select({ count: count() }).from(hmos);
    if (conditions.length > 0) {
      countQuery = countQuery.where(and(...conditions)) as typeof countQuery;
    }
    const [{ count: total }] = await countQuery;

    return { data: results, total };
  }

  static async update(id: string, input: UpdateHmoInput): Promise<Hmo | null> {
    const [hmo] = await db
      .update(hmos)
      .set(input)
      .where(eq(hmos.id, id))
      .returning();
    return hmo || null;
  }

  static async delete(id: string): Promise<boolean> {
    // Use transaction to delete HMO and cascade to related insurance plans
    return await db.transaction(async (tx) => {
      // Delete related insurance plans first
      await tx.delete(insurancePlans).where(eq(insurancePlans.hmoId, id));

      // Delete the HMO
      const result = await tx.delete(hmos).where(eq(hmos.id, id));
      return result.rowCount > 0;
    });
  }

  static async findByHospital(hospitalId: string) {
    return await db.select().from(hmos).where(eq(hmos.hospitalId, hospitalId));
  }

  static async findByCode(code: string): Promise<Hmo | null> {
    const result = await db
      .select()
      .from(hmos)
      .where(eq(hmos.code, code))
      .limit(1);
    return result[0] || null;
  }
}

/**
 * Insurance Plan Queries - CRUD operations for insurance plans
 */
export class PlanQueries {
  static async create(input: CreatePlanInput): Promise<InsurancePlan> {
    const [plan] = await db.insert(insurancePlans).values(input).returning();
    return plan;
  }

  static async findById(id: string): Promise<InsurancePlan | null> {
    const result = await db
      .select()
      .from(insurancePlans)
      .where(eq(insurancePlans.id, id))
      .limit(1);
    return result[0] || null;
  }

  static async findByIdWithRelations(
    id: string
  ): Promise<PlanWithRelations | null> {
    const result = await db
      .select({
        id: insurancePlans.id,
        hmoId: insurancePlans.hmoId,
        hospitalId: insurancePlans.hospitalId,
        name: insurancePlans.name,
        planType: insurancePlans.planType,
        durationYears: insurancePlans.durationYears,
        monthlyCostCents: insurancePlans.monthlyCostCents,
        yearlyCostCents: insurancePlans.yearlyCostCents,
        deductibleCents: insurancePlans.deductibleCents,
        annualOutOfPocketLimitCents: insurancePlans.annualOutOfPocketLimitCents,
        annualMaxBenefitCents: insurancePlans.annualMaxBenefitCents,
        description: insurancePlans.description,
        isActive: insurancePlans.isActive,
        createdAt: insurancePlans.createdAt,
        updatedAt: insurancePlans.updatedAt,
        hmo: {
          id: hmos.id,
          name: hmos.name,
          code: hmos.code,
        },
        hospital: {
          id: hospitals.id,
          name: hospitals.name,
          state: hospitals.state,
        },
      })
      .from(insurancePlans)
      .innerJoin(hmos, eq(insurancePlans.hmoId, hmos.id))
      .innerJoin(hospitals, eq(insurancePlans.hospitalId, hospitals.id))
      .where(eq(insurancePlans.id, id))
      .limit(1);

    return result[0] || null;
  }

  static async findMany(
    filters: PlanFilters = {},
    pagination: PaginationOptions = { limit: 10, offset: 0 }
  ) {
    let query = db.select().from(insurancePlans);

    const conditions = [];
    if (filters.hmoId) conditions.push(eq(insurancePlans.hmoId, filters.hmoId));
    if (filters.hospitalId)
      conditions.push(eq(insurancePlans.hospitalId, filters.hospitalId));
    if (filters.planType)
      conditions.push(eq(insurancePlans.planType, filters.planType));
    if (typeof filters.isActive === "boolean")
      conditions.push(eq(insurancePlans.isActive, filters.isActive));

    if (conditions.length > 0) {
      query = query.where(and(...conditions)) as typeof query;
    }

    const results = await query
      .orderBy(desc(insurancePlans.createdAt))
      .limit(pagination.limit!)
      .offset(pagination.offset!);

    let countQuery = db.select({ count: count() }).from(insurancePlans);
    if (conditions.length > 0) {
      countQuery = countQuery.where(and(...conditions)) as typeof countQuery;
    }
    const [{ count: total }] = await countQuery;

    return { data: results, total };
  }

  static async findByHmo(hmoId: string) {
    return await db
      .select()
      .from(insurancePlans)
      .where(eq(insurancePlans.hmoId, hmoId))
      .orderBy(desc(insurancePlans.createdAt));
  }

  static async findByHospital(hospitalId: string) {
    return await db
      .select()
      .from(insurancePlans)
      .where(eq(insurancePlans.hospitalId, hospitalId))
      .orderBy(desc(insurancePlans.createdAt));
  }

  static async update(
    id: string,
    input: UpdatePlanInput
  ): Promise<InsurancePlan | null> {
    const [plan] = await db
      .update(insurancePlans)
      .set(input)
      .where(eq(insurancePlans.id, id))
      .returning();
    return plan || null;
  }

  static async delete(id: string): Promise<boolean> {
    const result = await db
      .delete(insurancePlans)
      .where(eq(insurancePlans.id, id));
    return result.rowCount > 0;
  }

  static async toggleActive(id: string): Promise<InsurancePlan | null> {
    // Toggle the isActive status
    const [plan] = await db
      .update(insurancePlans)
      .set({
        isActive: sql`NOT ${insurancePlans.isActive}`,
      })
      .where(eq(insurancePlans.id, id))
      .returning();
    return plan || null;
  }
}
