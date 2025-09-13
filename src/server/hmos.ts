"use server";

import { auth } from "@/lib/auth";
import { HmoQueries } from "@/db/queries";
import { createHmoSchema, updateHmoSchema } from "@/db/validation";
import type {
  ServerActionResult,
  Hmo,
  CreateHmoInput,
  UpdateHmoInput,
  HmoWithRelations,
} from "@/db/types";
import { headers } from "next/headers";

/**
 * Helper function to get the current authenticated user
 */
async function getCurrentUser() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  return session.user;
}

/**
 * Create a new HMO
 */
export async function createHmoAction(
  input: CreateHmoInput
): Promise<ServerActionResult<Hmo>> {
  try {
    // Validate authentication
    const user = await getCurrentUser();

    // Validate input
    const validatedInput = createHmoSchema.parse(input);

    // Check if HMO code is unique (if provided)
    if (validatedInput.code) {
      const existingHmo = await HmoQueries.findByCode(validatedInput.code);
      if (existingHmo) {
        return {
          success: false,
          errors: [{ field: "code", message: "HMO code already exists" }],
        };
      }
    }

    // Create HMO with current user as creator
    const hmo = await HmoQueries.create(validatedInput, user.id);

    return {
      success: true,
      data: hmo,
    };
  } catch (error: any) {
    console.error("Create HMO error:", error);

    // Handle Zod validation errors
    if (error.name === "ZodError") {
      return {
        success: false,
        errors: error.errors.map((err: any) => ({
          field: err.path.join("."),
          message: err.message,
        })),
      };
    }

    // Handle authentication errors
    if (error.message === "Unauthorized") {
      return {
        success: false,
        errors: [{ message: "You must be logged in to create an HMO" }],
      };
    }

    // Handle database errors (like foreign key constraints)
    if (error.code === "23503") {
      // PostgreSQL foreign key violation
      return {
        success: false,
        errors: [
          { field: "hospitalId", message: "Selected hospital does not exist" },
        ],
      };
    }

    return {
      success: false,
      errors: [{ message: "Failed to create HMO. Please try again." }],
    };
  }
}

/**
 * Get HMO by ID with relations
 */
export async function getHmoAction(
  id: string
): Promise<ServerActionResult<HmoWithRelations>> {
  try {
    // Validate authentication
    await getCurrentUser();

    const hmo = await HmoQueries.findByIdWithRelations(id);

    if (!hmo) {
      return {
        success: false,
        errors: [{ message: "HMO not found" }],
      };
    }

    return {
      success: true,
      data: hmo,
    };
  } catch (error: any) {
    console.error("Get HMO error:", error);

    if (error.message === "Unauthorized") {
      return {
        success: false,
        errors: [{ message: "You must be logged in to view HMO details" }],
      };
    }

    return {
      success: false,
      errors: [{ message: "Failed to fetch HMO details" }],
    };
  }
}

/**
 * Get HMOs list with filtering and pagination
 */
export async function getHmosAction(
  filters: { hospitalId?: string; createdBy?: string } = {},
  pagination: { limit?: number; offset?: number } = {}
): Promise<ServerActionResult<{ hmos: Hmo[]; total: number }>> {
  try {
    // Validate authentication
    await getCurrentUser();

    const { data: hmos, total } = await HmoQueries.findMany(filters, {
      limit: pagination.limit || 10,
      offset: pagination.offset || 0,
    });

    return {
      success: true,
      data: { hmos, total },
    };
  } catch (error: any) {
    console.error("Get HMOs error:", error);

    if (error.message === "Unauthorized") {
      return {
        success: false,
        errors: [{ message: "You must be logged in to view HMOs" }],
      };
    }

    return {
      success: false,
      errors: [{ message: "Failed to fetch HMOs" }],
    };
  }
}

/**
 * Update an HMO
 * Only the creator can update it (or system admins)
 */
export async function updateHmoAction(
  id: string,
  input: UpdateHmoInput
): Promise<ServerActionResult<Hmo>> {
  try {
    // Validate authentication
    const user = await getCurrentUser();

    // Check if HMO exists and user has permission
    const existingHmo = await HmoQueries.findById(id);
    if (!existingHmo) {
      return {
        success: false,
        errors: [{ message: "HMO not found" }],
      };
    }

    // Check ownership
    if (existingHmo.createdBy !== user.id) {
      return {
        success: false,
        errors: [{ message: "You don't have permission to update this HMO" }],
      };
    }

    // Validate input
    const validatedInput = updateHmoSchema.parse(input);

    // Check if new code is unique (if provided and different)
    if (validatedInput.code && validatedInput.code !== existingHmo.code) {
      const existingWithCode = await HmoQueries.findByCode(validatedInput.code);
      if (existingWithCode) {
        return {
          success: false,
          errors: [{ field: "code", message: "HMO code already exists" }],
        };
      }
    }

    // Update HMO
    const updatedHmo = await HmoQueries.update(id, validatedInput);

    if (!updatedHmo) {
      return {
        success: false,
        errors: [{ message: "Failed to update HMO" }],
      };
    }

    return {
      success: true,
      data: updatedHmo,
    };
  } catch (error: any) {
    console.error("Update HMO error:", error);

    // Handle Zod validation errors
    if (error.name === "ZodError") {
      return {
        success: false,
        errors: error.errors.map((err: any) => ({
          field: err.path.join("."),
          message: err.message,
        })),
      };
    }

    if (error.message === "Unauthorized") {
      return {
        success: false,
        errors: [{ message: "You must be logged in to update HMOs" }],
      };
    }

    // Handle database errors
    if (error.code === "23503") {
      return {
        success: false,
        errors: [
          { field: "hospitalId", message: "Selected hospital does not exist" },
        ],
      };
    }

    return {
      success: false,
      errors: [{ message: "Failed to update HMO. Please try again." }],
    };
  }
}

/**
 * Delete an HMO
 * Only the creator can delete it (or system admins)
 * This will cascade delete all related insurance plans
 */
export async function deleteHmoAction(
  id: string
): Promise<ServerActionResult<void>> {
  try {
    // Validate authentication
    const user = await getCurrentUser();

    // Check if HMO exists and user has permission
    const existingHmo = await HmoQueries.findById(id);
    if (!existingHmo) {
      return {
        success: false,
        errors: [{ message: "HMO not found" }],
      };
    }

    // Check ownership
    if (existingHmo.createdBy !== user.id) {
      return {
        success: false,
        errors: [{ message: "You don't have permission to delete this HMO" }],
      };
    }

    // Delete HMO (will cascade to related insurance plans)
    const success = await HmoQueries.delete(id);

    if (!success) {
      return {
        success: false,
        errors: [{ message: "Failed to delete HMO" }],
      };
    }

    return {
      success: true,
    };
  } catch (error: any) {
    console.error("Delete HMO error:", error);

    if (error.message === "Unauthorized") {
      return {
        success: false,
        errors: [{ message: "You must be logged in to delete HMOs" }],
      };
    }

    return {
      success: false,
      errors: [{ message: "Failed to delete HMO. Please try again." }],
    };
  }
}

/**
 * Get HMOs for a specific hospital
 */
export async function getHmosByHospitalAction(
  hospitalId: string
): Promise<ServerActionResult<Hmo[]>> {
  try {
    await getCurrentUser();

    const hmos = await HmoQueries.findByHospital(hospitalId);

    return {
      success: true,
      data: hmos,
    };
  } catch (error: any) {
    console.error("Get HMOs by hospital error:", error);

    if (error.message === "Unauthorized") {
      return {
        success: false,
        errors: [{ message: "You must be logged in to view HMOs" }],
      };
    }

    return {
      success: false,
      errors: [{ message: "Failed to fetch HMOs for hospital" }],
    };
  }
}
