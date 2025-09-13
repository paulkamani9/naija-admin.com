"use client";

import React, { useEffect, useMemo, useState } from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { createPlanAction, getHospitalsAction, getHmosAction } from "@/actions";
import type { InsurancePlan, Hospital, Hmo } from "@/db/types";
import { Textarea } from "@/components/ui/textarea";

// Form schema aligned with user requirements and backend validation
const planFormSchema = z
  .object({
    name: z
      .string()
      .min(2, "Plan name must be at least 2 characters")
      .max(255, "Plan name is too long"),
    hospitalId: z.string().uuid("Please select a hospital"),
    hmoId: z.string().uuid("Please select an HMO"),
    planType: z.enum(["individual", "family", "enterprise"]),
    durationYears: z
      .number()
      .int()
      .min(1, "Duration must be at least 1 year")
      .max(10, "Duration cannot exceed 10 years"),
    monthlyPrice: z
      .number()
      .min(0, "Monthly price cannot be negative")
      .max(1000000, "Monthly price is too high"),
    yearlyPrice: z
      .number()
      .min(0, "Yearly price cannot be negative")
      .max(12000000, "Yearly price is too high"),
    deductible: z
      .number()
      .min(0, "Deductible cannot be negative")
      .max(1000000, "Deductible is too high"),
    annualOutOfPocketLimit: z
      .number()
      .min(0, "Out-of-pocket limit cannot be negative")
      .max(10000000, "Out-of-pocket limit is too high"),
    annualMaxBenefit: z
      .number()
      .min(0, "Max benefit cannot be negative")
      .max(100000000, "Max benefit is too high"),
    description: z
      .string()
      .max(2000, "Description too long")
      .optional()
      .or(z.literal("")),
  })
  .refine((data) => data.yearlyPrice >= data.monthlyPrice * 10, {
    message: "Yearly price should be at least 10 times the monthly price",
    path: ["yearlyPrice"],
  })
  .refine((data) => data.annualMaxBenefit >= data.annualOutOfPocketLimit, {
    message: "Annual max benefit must be at least equal to out-of-pocket limit",
    path: ["annualMaxBenefit"],
  });

type PlanFormValues = z.infer<typeof planFormSchema>;

interface PlanFormProps {
  onSuccess?: (plan: InsurancePlan) => void;
  onCancel?: () => void;
  hospitalsProp?: Hospital[];
  hmosProp?: Hmo[];
}

export function PlanForm({
  onSuccess,
  onCancel,
  hospitalsProp,
  hmosProp,
}: PlanFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hospitals, setHospitals] = useState<Hospital[]>(hospitalsProp || []);
  const [hmos, setHmos] = useState<Hmo[]>(hmosProp || []);

  const form = useForm<PlanFormValues>({
    resolver: zodResolver(planFormSchema),
    defaultValues: {
      name: "",
      hospitalId: "",
      hmoId: "",
      planType: "individual" as const,
      durationYears: 1,
      monthlyPrice: 0,
      yearlyPrice: 0,
      deductible: 0,
      annualOutOfPocketLimit: 0,
      annualMaxBenefit: 0,
      description: "",
    },
  });

  // Load hospitals and HMOs initially if not provided
  useEffect(() => {
    const loadData = async () => {
      try {
        // Load hospitals if not provided
        if (!hospitalsProp || hospitalsProp.length === 0) {
          const hospitalsRes = await getHospitalsAction({}, { limit: 100 });
          if (hospitalsRes.success && hospitalsRes.data?.hospitals) {
            setHospitals(hospitalsRes.data.hospitals);
          }
        }

        // Load HMOs if not provided
        if (!hmosProp || hmosProp.length === 0) {
          const hmosRes = await getHmosAction({}, { limit: 100 });
          if (hmosRes.success && hmosRes.data?.hmos) {
            setHmos(hmosRes.data.hmos);
          }
        }
      } catch (error) {
        console.error("Error loading data:", error);
        toast.error("Failed to load hospitals and HMOs");
      }
    };

    loadData();
  }, [hospitalsProp, hmosProp]);

  // Update data when props change
  useEffect(() => {
    if (hospitalsProp && hospitalsProp.length) {
      setHospitals(hospitalsProp);
    }
  }, [hospitalsProp]);

  useEffect(() => {
    if (hmosProp && hmosProp.length) {
      setHmos(hmosProp);
    }
  }, [hmosProp]);

  const sortedHospitals = useMemo(
    () => [...hospitals].sort((a, b) => a.name.localeCompare(b.name)),
    [hospitals]
  );

  const sortedHmos = useMemo(
    () => [...hmos].sort((a, b) => a.name.localeCompare(b.name)),
    [hmos]
  );

  // Auto-calculate yearly price when monthly price changes
  const monthlyPrice = form.watch("monthlyPrice");
  useEffect(() => {
    if (monthlyPrice > 0) {
      const yearlyPrice = monthlyPrice * 12;
      form.setValue("yearlyPrice", yearlyPrice, { shouldValidate: true });
    }
  }, [monthlyPrice, form]);

  const onSubmit = async (values: PlanFormValues) => {
    setIsSubmitting(true);
    try {
      // Convert prices to cents for backend
      const planData = {
        name: values.name,
        hospitalId: values.hospitalId,
        hmoId: values.hmoId,
        planType: values.planType,
        durationYears: values.durationYears,
        monthlyCostCents: Math.round(values.monthlyPrice * 100),
        yearlyCostCents: Math.round(values.yearlyPrice * 100),
        deductibleCents: Math.round((values.deductible || 0) * 100),
        annualOutOfPocketLimitCents: Math.round(
          values.annualOutOfPocketLimit * 100
        ),
        annualMaxBenefitCents: Math.round(values.annualMaxBenefit * 100),
        description: values.description || undefined,
        isActive: true,
      };

      const result = await createPlanAction(planData);

      if (result.success && result.data) {
        toast.success("Plan has been added.");
        form.reset();
        onSuccess?.(result.data);
      } else if (result.errors) {
        // Map field errors into form
        result.errors.forEach((error) => {
          if (error.field) {
            // Map backend field names to form field names
            let fieldName = error.field;
            if (error.field === "monthlyCostCents") fieldName = "monthlyPrice";
            if (error.field === "yearlyCostCents") fieldName = "yearlyPrice";
            if (error.field === "deductibleCents") fieldName = "deductible";
            if (error.field === "annualOutOfPocketLimitCents")
              fieldName = "annualOutOfPocketLimit";
            if (error.field === "annualMaxBenefitCents")
              fieldName = "annualMaxBenefit";

            form.setError(fieldName as keyof PlanFormValues, {
              message: error.message,
            });
          } else {
            toast.error(error.message);
          }
        });
      } else {
        toast.error("Failed to create plan. Please try again.");
      }
    } catch (e) {
      console.error("Create plan error", e);
      toast.error("An unexpected error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-4">
          {/* Plan Name */}
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Plan Name *</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Enter plan name"
                    disabled={isSubmitting}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Hospital Select */}
            <FormField
              control={form.control}
              name="hospitalId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Hospital *</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    disabled={isSubmitting || sortedHospitals.length === 0}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue
                          placeholder={
                            sortedHospitals.length
                              ? "Select a hospital"
                              : "Loading hospitals..."
                          }
                        />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {sortedHospitals.map((hospital) => (
                        <SelectItem key={hospital.id} value={hospital.id}>
                          {hospital.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* HMO Select */}
            <FormField
              control={form.control}
              name="hmoId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>HMO *</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    disabled={isSubmitting || sortedHmos.length === 0}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue
                          placeholder={
                            sortedHmos.length
                              ? "Select an HMO"
                              : "Loading HMOs..."
                          }
                        />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {sortedHmos.map((hmo) => (
                        <SelectItem key={hmo.id} value={hmo.id}>
                          {hmo.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Plan Type */}
            <FormField
              control={form.control}
              name="planType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Plan Type *</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    disabled={isSubmitting}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select plan type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="individual">Individual</SelectItem>
                      <SelectItem value="family">Family</SelectItem>
                      <SelectItem value="enterprise">Enterprise</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Duration */}
            <FormField
              control={form.control}
              name="durationYears"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Duration (Years) *</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min="1"
                      max="10"
                      placeholder="1"
                      disabled={isSubmitting}
                      {...field}
                      onChange={(e) =>
                        field.onChange(parseInt(e.target.value) || 1)
                      }
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Monthly Price */}
            <FormField
              control={form.control}
              name="monthlyPrice"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Monthly Price (₦) *</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="0.00"
                      disabled={isSubmitting}
                      {...field}
                      onChange={(e) =>
                        field.onChange(parseFloat(e.target.value) || 0)
                      }
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Yearly Price */}
            <FormField
              control={form.control}
              name="yearlyPrice"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Yearly Price (₦) *</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="0.00"
                      disabled={isSubmitting}
                      {...field}
                      onChange={(e) =>
                        field.onChange(parseFloat(e.target.value) || 0)
                      }
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Deductible */}
            <FormField
              control={form.control}
              name="deductible"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Deductible (₦)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="0.00"
                      disabled={isSubmitting}
                      {...field}
                      onChange={(e) =>
                        field.onChange(parseFloat(e.target.value) || 0)
                      }
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Annual Out-of-Pocket Limit */}
            <FormField
              control={form.control}
              name="annualOutOfPocketLimit"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Annual Out-of-Pocket Limit (₦) *</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="0.00"
                      disabled={isSubmitting}
                      {...field}
                      onChange={(e) =>
                        field.onChange(parseFloat(e.target.value) || 0)
                      }
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Annual Max Benefit */}
            <FormField
              control={form.control}
              name="annualMaxBenefit"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Annual Max Benefit (₦) *</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="0.00"
                      disabled={isSubmitting}
                      {...field}
                      onChange={(e) =>
                        field.onChange(parseFloat(e.target.value) || 0)
                      }
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Coverage Description */}
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Coverage Description</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Describe what this plan covers..."
                    disabled={isSubmitting}
                    rows={4}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Actions */}
        <div className="flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 space-y-2 space-y-reverse sm:space-y-0">
          {onCancel && (
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isSubmitting}
              className="w-full sm:w-auto"
            >
              Cancel
            </Button>
          )}
          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full sm:w-auto"
          >
            {isSubmitting ? "Creating..." : "Create Plan"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
