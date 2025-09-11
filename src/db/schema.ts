import {
  pgTable,
  text,
  timestamp,
  boolean,
  uuid,
  varchar,
  index,
  integer,
  pgEnum,
} from "drizzle-orm/pg-core";


export const user = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").default(false).notNull(),
  image: text("image"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
});

export const session = pgTable("session", {
  id: text("id").primaryKey(),
  expiresAt: timestamp("expires_at").notNull(),
  token: text("token").notNull().unique(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
});

export const account = pgTable("account", {
  id: text("id").primaryKey(),
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  idToken: text("id_token"),
  accessTokenExpiresAt: timestamp("access_token_expires_at"),
  refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
  scope: text("scope"),
  password: text("password"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
});

export const verification = pgTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
});

// Enum for insurance plan types
export const planTypeEnum = pgEnum("plan_type", [
  "family",
  "individual",
  "enterprise",
]);

// Hospitals table - healthcare facilities that can be associated with HMOs
export const hospitals = pgTable(
  "hospitals",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    name: varchar("name", { length: 255 }).notNull(),
    address: varchar("address", { length: 255 }),
    phone: varchar("phone", { length: 32 }),
    email: varchar("email", { length: 255 }),
    state: varchar("state", { length: 255 }),
    localGovernment: varchar("local_government", { length: 255 }),
    // Reference to the admin user who manages this hospital
    adminId: text("admin_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => ({
    nameIdx: index("hospitals_name_idx").on(table.name),
    adminIdIdx: index("hospitals_admin_id_idx").on(table.adminId),
  })
);

// HMOs table - Health Maintenance Organizations
export const hmos = pgTable(
  "hmos",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    name: varchar("name", { length: 255 }).notNull(),
    code: varchar("code", { length: 50 }).unique(), // Optional short identifier code
    // Default hospital association (can be nullable if HMO operates across multiple hospitals)
    hospitalId: uuid("hospital_id").references(() => hospitals.id, {
      onDelete: "cascade",
    }),
    createdBy: text("created_by")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => ({
    nameIdx: index("hmos_name_idx").on(table.name),
    hospitalIdIdx: index("hmos_hospital_id_idx").on(table.hospitalId),
    createdByIdx: index("hmos_created_by_idx").on(table.createdBy),
  })
);

// Insurance Plans table - specific insurance packages offered by HMOs
export const insurancePlans = pgTable(
  "insurance_plans",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    hmoId: uuid("hmo_id")
      .notNull()
      .references(() => hmos.id, { onDelete: "cascade" }),
    hospitalId: uuid("hospital_id")
      .notNull()
      .references(() => hospitals.id, { onDelete: "cascade" }),
    name: varchar("name", { length: 255 }).notNull(),
    planType: planTypeEnum("plan_type").notNull(),
    durationYears: integer("duration_years").notNull().default(1),

    // All monetary values stored as integer cents to avoid floating point precision issues
    // Example: $100.50 is stored as 10050 cents
    monthlyCostCents: integer("monthly_cost_cents").notNull(),
    yearlyCostCents: integer("yearly_cost_cents").notNull(),
    deductibleCents: integer("deductible_cents").notNull().default(0),
    annualOutOfPocketLimitCents: integer(
      "annual_out_of_pocket_limit_cents"
    ).notNull(),
    annualMaxBenefitCents: integer("annual_max_benefit_cents").notNull(),

    description: text("description"),
    isActive: boolean("is_active").notNull().default(true),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => ({
    hmoIdIdx: index("insurance_plans_hmo_id_idx").on(table.hmoId),
    hospitalIdIdx: index("insurance_plans_hospital_id_idx").on(
      table.hospitalId
    ),
    planTypeIdx: index("insurance_plans_plan_type_idx").on(table.planType),
    activeIdx: index("insurance_plans_is_active_idx").on(table.isActive),
  })
);
