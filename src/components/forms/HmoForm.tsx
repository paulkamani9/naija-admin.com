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

import { createHmoAction, updateHmoAction } from "@/server";
import { getHospitalsAction } from "@/server";
import type { Hmo, Hospital } from "@/db/types";

// Form schema aligned with backend validation (name required, code optional, hospital optional, logoUrl optional)
const hmoFormSchema = z.object({
  name: z
    .string()
    .min(2, "HMO name must be at least 2 characters")
    .max(255, "HMO name is too long"),
  hospitalId: z
    .string()
    .uuid("Invalid hospital")
    .optional()
    .or(z.literal(""))
    .or(z.literal("none")),
  code: z.string().max(50, "Code is too long").optional().or(z.literal("")),
  logoUrl: z.string().url("Invalid logo URL").optional().or(z.literal("")),
});

type HmoFormValues = z.infer<typeof hmoFormSchema>;

interface HmoFormProps {
  hmo?: Hmo; // For editing existing HMO
  onSuccess?: (hmo: Hmo) => void;
  onCancel?: () => void;
  // Allow parent to pass a newly created hospital to reflect immediately in dropdown
  hospitalsProp?: Hospital[];
}

export function HmoForm({
  hmo,
  onSuccess,
  onCancel,
  hospitalsProp,
}: HmoFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(
    hmo?.logoUrl || null
  );
  const [hospitals, setHospitals] = useState<Hospital[]>(hospitalsProp || []);
  const isEditing = !!hmo;

  const form = useForm<HmoFormValues>({
    resolver: zodResolver(hmoFormSchema),
    defaultValues: {
      name: hmo?.name || "",
      code: hmo?.code || "",
      hospitalId: hmo?.hospitalId || "none",
      logoUrl: hmo?.logoUrl || "",
    },
  });

  // Load hospitals initially if not provided, and refresh when a new hospital is added upstream
  useEffect(() => {
    if (!hospitalsProp || hospitalsProp.length === 0) {
      (async () => {
        const res = await getHospitalsAction({}, { limit: 100 });
        if (res.success && res.data?.hospitals) {
          setHospitals(res.data.hospitals);
        }
      })();
    }
  }, [hospitalsProp]);

  useEffect(() => {
    if (hospitalsProp && hospitalsProp.length) {
      setHospitals(hospitalsProp);
    }
  }, [hospitalsProp]);

  // Update form when hmo prop changes (for editing)
  useEffect(() => {
    if (hmo) {
      form.reset({
        name: hmo.name,
        code: hmo.code || "",
        hospitalId: hmo.hospitalId || "none",
        logoUrl: hmo.logoUrl || "",
      });
      setImagePreview(hmo.logoUrl || null);
    }
  }, [hmo, form]);

  const sortedHospitals = useMemo(
    () => [...hospitals].sort((a, b) => a.name.localeCompare(b.name)),
    [hospitals]
  );

  const handleUpload = async (file: File) => {
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/upload/cloudinary", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Upload failed");
      }

      const result: { url: string; publicId: string } = await response.json();
      form.setValue("logoUrl", result.url, { shouldValidate: true });
      setImagePreview(result.url);
      toast.success("Logo uploaded successfully");
    } catch (e) {
      console.error("Upload error:", e);
      toast.error(e instanceof Error ? e.message : "Logo upload failed");
    } finally {
      setIsUploading(false);
    }
  };

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("File too large. Max size is 5MB");
      return;
    }
    // Show local preview immediately
    const reader = new FileReader();
    reader.onload = () => setImagePreview(reader.result as string);
    reader.readAsDataURL(file);
    void handleUpload(file);
  };

  const onSubmit = async (values: HmoFormValues) => {
    setIsSubmitting(true);
    try {
      const clean = {
        name: values.name,
        code: values.code || undefined,
        hospitalId:
          values.hospitalId && values.hospitalId !== "none"
            ? values.hospitalId
            : undefined,
        logoUrl: values.logoUrl || undefined,
      };

      const result = isEditing
        ? await updateHmoAction(hmo!.id, clean)
        : await createHmoAction(clean);

      if (result.success && result.data) {
        toast.success(
          isEditing ? "HMO has been updated." : "HMO has been added."
        );
        if (!isEditing) {
          form.reset();
          setImagePreview(null);
        }
        onSuccess?.(result.data);
      } else if (result.errors) {
        // map field errors into form
        result.errors.forEach((error) => {
          if (error.field) {
            form.setError(error.field as keyof HmoFormValues, {
              message: error.message,
            });
          } else {
            toast.error(error.message);
          }
        });
      } else {
        toast.error(
          `Failed to ${isEditing ? "update" : "create"} HMO. Please try again.`
        );
      }
    } catch (e) {
      console.error(`${isEditing ? "Update" : "Create"} HMO error`, e);
      toast.error("An unexpected error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-4">
          {/* HMO Name */}
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>HMO Name *</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Enter HMO name"
                    disabled={isSubmitting}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* HMO Code (optional) */}
          <FormField
            control={form.control}
            name="code"
            render={({ field }) => (
              <FormItem>
                <FormLabel>HMO Code</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Optional short code"
                    disabled={isSubmitting}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Hospital select (optional) */}
          <FormField
            control={form.control}
            name="hospitalId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Default Hospital</FormLabel>
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
                            ? "Select a hospital (optional)"
                            : "Loading hospitals..."
                        }
                      />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    {sortedHospitals.map((h) => (
                      <SelectItem key={h.id} value={h.id}>
                        {h.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Logo upload */}
          <FormField
            control={form.control}
            name="logoUrl"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Logo</FormLabel>
                <div className="space-y-3">
                  <div className="flex items-center gap-4">
                    {/* Preview */}
                    <div className="w-16 h-16 rounded-lg border-2 border-dashed border-muted-foreground/25 flex items-center justify-center overflow-hidden bg-muted/50">
                      {imagePreview || field.value ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={
                            imagePreview ||
                            field.value ||
                            "/hmo-placeholder.svg"
                          }
                          alt="Logo preview"
                          className="w-full h-full object-contain"
                        />
                      ) : (
                        <div className="text-muted-foreground">
                          <svg
                            className="w-6 h-6"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                            />
                          </svg>
                        </div>
                      )}
                    </div>

                    {/* Upload button */}
                    <div className="flex-1">
                      <label className="cursor-pointer">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={onFileChange}
                          disabled={isSubmitting || isUploading}
                          className="sr-only"
                        />
                        <div className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed dark:border-gray-600 dark:text-gray-300 dark:bg-gray-800 dark:hover:bg-gray-700">
                          {isUploading ? (
                            <>
                              <svg
                                className="animate-spin -ml-1 mr-2 h-4 w-4"
                                fill="none"
                                viewBox="0 0 24 24"
                              >
                                <circle
                                  cx="12"
                                  cy="12"
                                  r="10"
                                  stroke="currentColor"
                                  strokeWidth="4"
                                  className="opacity-25"
                                ></circle>
                                <path
                                  fill="currentColor"
                                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                  className="opacity-75"
                                ></path>
                              </svg>
                              Uploading...
                            </>
                          ) : (
                            <>
                              <svg
                                className="-ml-1 mr-2 h-4 w-4"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                                />
                              </svg>
                              {field.value ? "Change Logo" : "Upload Logo"}
                            </>
                          )}
                        </div>
                      </label>
                    </div>
                  </div>

                  {/* Clear button */}
                  {(imagePreview || field.value) && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        form.setValue("logoUrl", "", { shouldValidate: true });
                        setImagePreview(null);
                      }}
                      disabled={isSubmitting || isUploading}
                      className="text-xs"
                    >
                      Remove Logo
                    </Button>
                  )}

                  <p className="text-xs text-muted-foreground">
                    Upload a PNG, JPG, or GIF up to 5MB. Recommended size:
                    200x200px
                  </p>
                </div>
                {/* Keep an input to hold the URL for form state */}
                <input
                  type="hidden"
                  value={field.value || ""}
                  onChange={field.onChange}
                />
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
              disabled={isSubmitting || isUploading}
              className="w-full sm:w-auto"
            >
              Cancel
            </Button>
          )}
          <Button
            type="submit"
            disabled={isSubmitting || isUploading}
            className="w-full sm:w-auto"
          >
            {isSubmitting
              ? isEditing
                ? "Updating..."
                : "Creating..."
              : isEditing
              ? "Update HMO"
              : "Create HMO"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
