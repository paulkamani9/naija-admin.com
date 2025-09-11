# Naija Admin Backend Pattern

## Overview

This backend implementation provides a comprehensive, type-safe layer between your PostgreSQL database and Next.js frontend using Drizzle ORM, Zod validation, and Next.js Server Actions.

## Architecture Components

- **Database Schema**: Extended with `hospitals`, `hmos`, and `insurance_plans` tables
- **Type Safety**: Full TypeScript coverage with Drizzle-generated types
- **Validation**: Zod schemas for all inputs with custom business rules
- **Query Layer**: Class-based query methods for each entity
- **Server Actions**: Authenticated CRUD operations with proper error handling
- **Currency Handling**: Integer cents storage with formatting utilities

## Database Schema

### Key Design Decisions

1. **Money as Integer Cents**: All monetary fields store cents to avoid floating-point precision issues
2. **Proper Indexing**: Indexes on frequently queried fields (name, adminId, hmoId, etc.)
3. **Cascade Deletes**: Proper foreign key relationships with cascade behavior
4. **Timestamps**: All tables have `createdAt` and `updatedAt` with auto-update

### Tables Added

- `hospitals`: Healthcare facilities with admin ownership
- `hmos`: Health Maintenance Organizations linked to hospitals
- `insurance_plans`: Specific insurance products with comprehensive pricing fields

## Server Actions Usage Examples

### Example A: Using Server Actions with Forms (Recommended)

```tsx
// components/CreateHospitalForm.tsx
"use client";

import { createHospitalAction } from "@/actions/hospitals";
import { useState } from "react";

export function CreateHospitalForm() {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(formData: FormData) {
    setIsLoading(true);
    setErrors({});

    const input = {
      name: formData.get("name") as string,
      address: formData.get("address") as string,
      phone: formData.get("phone") as string,
      email: formData.get("email") as string,
      state: formData.get("state") as string,
      localGovernment: formData.get("localGovernment") as string,
    };

    const result = await createHospitalAction(input);

    if (result.success) {
      // Handle success - redirect or show success message
      console.log("Hospital created:", result.data);
    } else {
      // Map errors to form fields
      const fieldErrors: Record<string, string> = {};
      result.errors?.forEach((error) => {
        if (error.field) {
          fieldErrors[error.field] = error.message;
        }
      });
      setErrors(fieldErrors);
    }

    setIsLoading(false);
  }

  return (
    <form action={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="name">Hospital Name</label>
        <input
          type="text"
          id="name"
          name="name"
          required
          className={errors.name ? "border-red-500" : ""}
        />
        {errors.name && <p className="text-red-500 text-sm">{errors.name}</p>}
      </div>

      <div>
        <label htmlFor="address">Address</label>
        <input type="text" id="address" name="address" />
        {errors.address && (
          <p className="text-red-500 text-sm">{errors.address}</p>
        )}
      </div>

      <button type="submit" disabled={isLoading}>
        {isLoading ? "Creating..." : "Create Hospital"}
      </button>
    </form>
  );
}
```

### Example B: Using Server Actions with API Route Fallback

```tsx
// Alternative: Using fetch for more control (optional)
export async function createHospitalWithFetch(input: CreateHospitalInput) {
  const response = await fetch("/api/hospitals", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });

  const result: ServerActionResult<Hospital> = await response.json();

  if (!result.success) {
    // Handle errors
    console.error("Validation errors:", result.errors);
    return { success: false, errors: result.errors };
  }

  return { success: true, data: result.data };
}

// app/api/hospitals/route.ts (optional API route)
import { createHospitalAction } from "@/actions/hospitals";
import { NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  const input = await request.json();
  const result = await createHospitalAction(input);
  return Response.json(result);
}
```

### Handling Field-Level Errors

```tsx
// Utility to extract field errors from ServerActionResult
function getFieldError(
  errors: { field?: string; message: string }[] | undefined,
  fieldName: string
): string | undefined {
  return errors?.find((error) => error.field === fieldName)?.message;
}

// Usage in components
const nameError = getFieldError(result.errors, "name");
const emailError = getFieldError(result.errors, "email");
```

## Currency Handling

All monetary values are stored as integer cents in the database:

```tsx
import {
  formatCurrency,
  dollarsToCents,
  formatPlanCosts,
} from "@/lib/currency";

// Converting user input to cents
const monthlyInput = 150.75; // ₦150.75
const monthlyCostCents = dollarsToCents(monthlyInput); // 15075

// Displaying currency from database
const plan = await PlanQueries.findById(planId);
const formatted = formatCurrency(plan.monthlyCostCents); // "₦150.75"

// Formatting all plan costs for display
const costs = formatPlanCosts(plan);
console.log(costs.monthly); // "₦150.75"
console.log(costs.yearly); // "₦1,800.00"
```

## Best Practices

### 1. Money Storage

- **Always store as integer cents** to avoid floating-point precision issues
- Use helper functions to convert between dollars and cents
- Validate reasonable ranges for Nigerian currency context

### 2. Indexing Strategy

```sql
-- Primary indexes (already created in schema)
CREATE INDEX hospitals_name_idx ON hospitals(name);
CREATE INDEX hospitals_admin_id_idx ON hospitals(admin_id);
CREATE INDEX hmos_hospital_id_idx ON hmos(hospital_id);
CREATE INDEX insurance_plans_hmo_id_idx ON insurance_plans(hmo_id);
CREATE INDEX insurance_plans_is_active_idx ON insurance_plans(is_active);

-- Consider adding composite indexes for common queries
CREATE INDEX insurance_plans_hospital_hmo_idx ON insurance_plans(hospital_id, hmo_id);
CREATE INDEX insurance_plans_type_active_idx ON insurance_plans(plan_type, is_active);
```

### 3. Transactions for Multi-Step Operations

```typescript
// Example: Creating a plan with audit trail
export async function createPlanWithAudit(
  input: CreatePlanInput,
  userId: string
) {
  return await db.transaction(async (tx) => {
    // Create the plan
    const [plan] = await tx.insert(insurancePlans).values(input).returning();

    // Create audit trail (if you have audit table)
    await tx.insert(auditLog).values({
      userId,
      action: "CREATE_PLAN",
      resourceId: plan.id,
      details: JSON.stringify(input),
    });

    return plan;
  });
}
```

### 4. RBAC (Role-Based Access Control)

Extend the permission checking in server actions:

```typescript
// Enhanced permission checking
async function checkPermissions(
  userId: string,
  resource: string,
  action: string
) {
  const user = await UserQueries.findById(userId);

  // Check system admin role
  if (user?.role === "system_admin") {
    return true;
  }

  // Check resource-specific permissions
  if (resource === "hospital" && action === "create") {
    return user?.role === "hospital_admin";
  }

  // Add more permission logic as needed
  return false;
}
```

### 5. Caching Strategy

For future optimization with React Query or SWR:

```typescript
// Suggested cache keys for React Query
export const queryKeys = {
  hospitals: {
    all: ["hospitals"] as const,
    lists: () => [...queryKeys.hospitals.all, "list"] as const,
    list: (filters: HospitalFilters) =>
      [...queryKeys.hospitals.lists(), { filters }] as const,
    details: () => [...queryKeys.hospitals.all, "detail"] as const,
    detail: (id: string) => [...queryKeys.hospitals.details(), id] as const,
  },
  // Similar patterns for HMOs and plans...
};
```

## DrizzleKit Migration Commands

```bash
# Generate migration files from schema changes
npm run db-generate

# Apply migrations to database
npm run db-migrate

# Push schema changes directly (development only)
npm run db-push

# Open Drizzle Studio for database inspection
npm run db-studio
```

## Testing Server Actions

```typescript
// Example test for hospital creation
import { createHospitalAction } from "@/actions/hospitals";

describe("Hospital Actions", () => {
  test("creates hospital with valid input", async () => {
    const input = {
      name: "Test Hospital",
      address: "123 Test St",
      state: "Lagos",
      email: "test@hospital.com",
    };

    const result = await createHospitalAction(input);

    expect(result.success).toBe(true);
    expect(result.data?.name).toBe("Test Hospital");
  });

  test("validates required fields", async () => {
    const input = { name: "" }; // Invalid input

    const result = await createHospitalAction(input);

    expect(result.success).toBe(false);
    expect(result.errors).toHaveLength(1);
    expect(result.errors?.[0]?.field).toBe("name");
  });
});
```


