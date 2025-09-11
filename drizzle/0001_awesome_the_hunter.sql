CREATE TYPE "public"."plan_type" AS ENUM('family', 'individual', 'enterprise');--> statement-breakpoint
CREATE TABLE "hmos" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255) NOT NULL,
	"code" varchar(50),
	"hospital_id" uuid,
	"created_by" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "hmos_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "hospitals" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255) NOT NULL,
	"address" varchar(255),
	"phone" varchar(32),
	"email" varchar(255),
	"state" varchar(255),
	"local_government" varchar(255),
	"admin_id" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "insurance_plans" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"hmo_id" uuid NOT NULL,
	"hospital_id" uuid NOT NULL,
	"name" varchar(255) NOT NULL,
	"plan_type" "plan_type" NOT NULL,
	"duration_years" integer DEFAULT 1 NOT NULL,
	"monthly_cost_cents" integer NOT NULL,
	"yearly_cost_cents" integer NOT NULL,
	"deductible_cents" integer DEFAULT 0 NOT NULL,
	"annual_out_of_pocket_limit_cents" integer NOT NULL,
	"annual_max_benefit_cents" integer NOT NULL,
	"description" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "hmos" ADD CONSTRAINT "hmos_hospital_id_hospitals_id_fk" FOREIGN KEY ("hospital_id") REFERENCES "public"."hospitals"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hmos" ADD CONSTRAINT "hmos_created_by_user_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hospitals" ADD CONSTRAINT "hospitals_admin_id_user_id_fk" FOREIGN KEY ("admin_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "insurance_plans" ADD CONSTRAINT "insurance_plans_hmo_id_hmos_id_fk" FOREIGN KEY ("hmo_id") REFERENCES "public"."hmos"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "insurance_plans" ADD CONSTRAINT "insurance_plans_hospital_id_hospitals_id_fk" FOREIGN KEY ("hospital_id") REFERENCES "public"."hospitals"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "hmos_name_idx" ON "hmos" USING btree ("name");--> statement-breakpoint
CREATE INDEX "hmos_hospital_id_idx" ON "hmos" USING btree ("hospital_id");--> statement-breakpoint
CREATE INDEX "hmos_created_by_idx" ON "hmos" USING btree ("created_by");--> statement-breakpoint
CREATE INDEX "hospitals_name_idx" ON "hospitals" USING btree ("name");--> statement-breakpoint
CREATE INDEX "hospitals_admin_id_idx" ON "hospitals" USING btree ("admin_id");--> statement-breakpoint
CREATE INDEX "insurance_plans_hmo_id_idx" ON "insurance_plans" USING btree ("hmo_id");--> statement-breakpoint
CREATE INDEX "insurance_plans_hospital_id_idx" ON "insurance_plans" USING btree ("hospital_id");--> statement-breakpoint
CREATE INDEX "insurance_plans_plan_type_idx" ON "insurance_plans" USING btree ("plan_type");--> statement-breakpoint
CREATE INDEX "insurance_plans_is_active_idx" ON "insurance_plans" USING btree ("is_active");