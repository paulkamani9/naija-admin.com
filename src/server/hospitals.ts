"use server";

import { auth } from "@/lib/auth";
import { HospitalQueries } from "@/db/queries";
import { createHospitalSchema, updateHospitalSchema } from "@/db/validation";
import type {
  ServerActionResult,
  Hospital,
  CreateHospitalInput,
  UpdateHospitalInput,
  HospitalWithAdmin,
} from "@/db/types";
import { headers } from "next/headers";

/**
 * Helper function to get the current authenticated user
 * Adapt this based on your Better Auth setup
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
 * Create a new hospital
 */
export async function createHospitalAction(
  input: CreateHospitalInput
): Promise<ServerActionResult<Hospital>> {
  try {
    // Validate authentication
    const user = await getCurrentUser();

    // Validate input
    const validatedInput = createHospitalSchema.parse(input);

    // Create hospital with current user as admin
    const hospital = await HospitalQueries.create(validatedInput, user.id);

    return {
      success: true,
      data: hospital,
    };
  } catch (error: any) {
    console.error("Create hospital error:", error);

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
        errors: [{ message: "You must be logged in to create a hospital" }],
      };
    }

    // Handle other errors
    return {
      success: false,
      errors: [{ message: "Failed to create hospital. Please try again." }],
    };
  }
}

/**
 * Get hospital by ID with admin details
 */
export async function getHospitalAction(
  id: string
): Promise<ServerActionResult<HospitalWithAdmin>> {
  try {
    // Validate authentication
    await getCurrentUser();

    const hospital = await HospitalQueries.findByIdWithAdmin(id);

    if (!hospital) {
      return {
        success: false,
        errors: [{ message: "Hospital not found" }],
      };
    }

    return {
      success: true,
      data: hospital,
    };
  } catch (error: any) {
    console.error("Get hospital error:", error);

    if (error.message === "Unauthorized") {
      return {
        success: false,
        errors: [{ message: "You must be logged in to view hospital details" }],
      };
    }

    return {
      success: false,
      errors: [{ message: "Failed to fetch hospital details" }],
    };
  }
}

/**
 * Get hospitals list with filtering and pagination
 */
export async function getHospitalsAction(
  filters: { state?: string; localGovernment?: string } = {},
  pagination: { limit?: number; offset?: number } = {}
): Promise<ServerActionResult<{ hospitals: Hospital[]; total: number }>> {
  try {
    // Validate authentication
    const user = await getCurrentUser();

    const { data: hospitals, total } = await HospitalQueries.findMany(filters, {
      limit: pagination.limit || 10,
      offset: pagination.offset || 0,
    });

    return {
      success: true,
      data: { hospitals, total },
    };
  } catch (error: any) {
    console.error("Get hospitals error:", error);

    if (error.message === "Unauthorized") {
      return {
        success: false,
        errors: [{ message: "You must be logged in to view hospitals" }],
      };
    }

    return {
      success: false,
      errors: [{ message: "Failed to fetch hospitals" }],
    };
  }
}

/**
 * Update a hospital
 * Only the admin who created it can update it (or system admins)
 */
export async function updateHospitalAction(
  id: string,
  input: UpdateHospitalInput
): Promise<ServerActionResult<Hospital>> {
  try {
    // Validate authentication
    const user = await getCurrentUser();

    // Check if hospital exists and user has permission
    const existingHospital = await HospitalQueries.findById(id);
    if (!existingHospital) {
      return {
        success: false,
        errors: [{ message: "Hospital not found" }],
      };
    }

    // Check ownership (adapt role checking based on your auth setup)
    if (existingHospital.adminId !== user.id) {
      // You might want to add a role check here for system admins
      // if (user.role !== 'admin') {
      return {
        success: false,
        errors: [
          { message: "You don't have permission to update this hospital" },
        ],
      };
      // }
    }

    // Validate input
    const validatedInput = updateHospitalSchema.parse(input);

    // Update hospital
    const updatedHospital = await HospitalQueries.update(id, validatedInput);

    if (!updatedHospital) {
      return {
        success: false,
        errors: [{ message: "Failed to update hospital" }],
      };
    }

    return {
      success: true,
      data: updatedHospital,
    };
  } catch (error: any) {
    console.error("Update hospital error:", error);

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
        errors: [{ message: "You must be logged in to update hospitals" }],
      };
    }

    return {
      success: false,
      errors: [{ message: "Failed to update hospital. Please try again." }],
    };
  }
}

/**
 * Delete a hospital
 * Only the admin who created it can delete it (or system admins)
 */
export async function deleteHospitalAction(
  id: string
): Promise<ServerActionResult<void>> {
  try {
    // Validate authentication
    const user = await getCurrentUser();

    // Check if hospital exists and user has permission
    const existingHospital = await HospitalQueries.findById(id);
    if (!existingHospital) {
      return {
        success: false,
        errors: [{ message: "Hospital not found" }],
      };
    }

    // Check ownership
    if (existingHospital.adminId !== user.id) {
      return {
        success: false,
        errors: [
          { message: "You don't have permission to delete this hospital" },
        ],
      };
    }

    // Delete hospital
    const success = await HospitalQueries.delete(id);

    if (!success) {
      return {
        success: false,
        errors: [{ message: "Failed to delete hospital" }],
      };
    }

    return {
      success: true,
    };
  } catch (error: any) {
    console.error("Delete hospital error:", error);

    if (error.message === "Unauthorized") {
      return {
        success: false,
        errors: [{ message: "You must be logged in to delete hospitals" }],
      };
    }

    return {
      success: false,
      errors: [{ message: "Failed to delete hospital. Please try again." }],
    };
  }
}

/**
 * Get hospitals for the current user (admin)
 */
export async function getMyHospitalsAction(): Promise<
  ServerActionResult<Hospital[]>
> {
  try {
    const user = await getCurrentUser();

    const hospitals = await HospitalQueries.findByAdmin(user.id);

    return {
      success: true,
      data: hospitals,
    };
  } catch (error: any) {
    console.error("Get my hospitals error:", error);

    if (error.message === "Unauthorized") {
      return {
        success: false,
        errors: [{ message: "You must be logged in to view your hospitals" }],
      };
    }

    return {
      success: false,
      errors: [{ message: "Failed to fetch your hospitals" }],
    };
  }
}
