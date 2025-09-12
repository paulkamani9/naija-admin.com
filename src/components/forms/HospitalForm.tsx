"use client";

import React, { useState, useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

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
import { createHospitalAction } from "@/actions/hospitals";
import { NIGERIAN_STATES, getLGAsForState } from "@/lib/nigerian-states";

// Form schema
const hospitalFormSchema = z.object({
  name: z
    .string()
    .min(2, "Hospital name must be at least 2 characters")
    .max(255, "Hospital name is too long"),
  address: z
    .string()
    .max(255, "Address is too long")
    .optional()
    .or(z.literal("")),
  phone: z
    .string()
    .max(32, "Phone number is too long")
    .optional()
    .or(z.literal("")),
  email: z
    .string()
    .email("Invalid email format")
    .max(255, "Email is too long")
    .optional()
    .or(z.literal("")),
  state: z.string().min(1, "Please select a state"),
  localGovernment: z.string().min(1, "Please select a local government"),
});

type HospitalFormValues = z.infer<typeof hospitalFormSchema>;

import type { Hospital } from "@/db/types";

interface HospitalFormProps {
  onSuccess?: (hospital: Hospital) => void;
  onCancel?: () => void;
}

export function HospitalForm({ onSuccess, onCancel }: HospitalFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [availableLGAs, setAvailableLGAs] = useState<string[]>([]);

  const form = useForm<HospitalFormValues>({
    resolver: zodResolver(hospitalFormSchema),
    defaultValues: {
      name: "",
      address: "",
      phone: "",
      email: "",
      state: "",
      localGovernment: "",
    },
  });

  const selectedState = form.watch("state");

  // Update LGAs when state changes
  useEffect(() => {
    if (selectedState) {
      const lgas = getLGAsForState(selectedState);
      setAvailableLGAs(lgas);
      // Reset local government when state changes
      form.setValue("localGovernment", "");
    } else {
      setAvailableLGAs([]);
      form.setValue("localGovernment", "");
    }
  }, [selectedState, form]);

  const onSubmit = async (values: HospitalFormValues) => {
    try {
      setIsSubmitting(true);

      // Filter out empty optional fields
      const cleanValues = {
        name: values.name,
        address: values.address || undefined,
        phone: values.phone || undefined,
        email: values.email || undefined,
        state: values.state,
        localGovernment: values.localGovernment,
      };

      const result = await createHospitalAction(cleanValues);

      if (result.success && result.data) {
        toast.success("Hospital has been added.");
        form.reset();
        onSuccess?.(result.data);
      } else {
        // Handle validation errors
        if (result.errors) {
          result.errors.forEach((error) => {
            if (error.field) {
              form.setError(error.field as keyof HospitalFormValues, {
                message: error.message,
              });
            } else {
              toast.error(error.message);
            }
          });
        } else {
          toast.error("Failed to create hospital. Please try again.");
        }
      }
    } catch (error) {
      console.error("Form submission error:", error);
      toast.error("An unexpected error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-4">
          {/* Hospital Name */}
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Hospital Name *</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Enter hospital name"
                    disabled={isSubmitting}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Address */}
          <FormField
            control={form.control}
            name="address"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Address</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Enter hospital address"
                    disabled={isSubmitting}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Phone */}
          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Phone Number</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Enter phone number"
                    disabled={isSubmitting}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Email */}
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input
                    type="email"
                    placeholder="Enter email address"
                    disabled={isSubmitting}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* State */}
          <FormField
            control={form.control}
            name="state"
            render={({ field }) => (
              <FormItem>
                <FormLabel>State *</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  disabled={isSubmitting}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a state" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {NIGERIAN_STATES.map((state) => (
                      <SelectItem key={state} value={state}>
                        {state}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Local Government */}
          <FormField
            control={form.control}
            name="localGovernment"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Local Government *</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  disabled={
                    isSubmitting || !selectedState || availableLGAs.length === 0
                  }
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue
                        placeholder={
                          !selectedState
                            ? "Select a state first"
                            : availableLGAs.length === 0
                            ? "Loading..."
                            : "Select a local government"
                        }
                      />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {availableLGAs.map((lga) => (
                      <SelectItem key={lga} value={lga}>
                        {lga}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Form Actions */}
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
            {isSubmitting ? "Creating..." : "Create Hospital"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
