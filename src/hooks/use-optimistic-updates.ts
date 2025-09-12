"use client";

import { useState, useCallback } from "react";
import { toast } from "sonner";

interface OptimisticState<T> {
  data: T[];
  isOptimistic: boolean;
}

interface UseOptimisticUpdatesOptions<T> {
  initialData: T[];
  onError?: (error: unknown) => void;
}

export function useOptimisticUpdates<T extends { id: string }>({
  initialData,
  onError,
}: UseOptimisticUpdatesOptions<T>) {
  const [state, setState] = useState<OptimisticState<T>>({
    data: initialData,
    isOptimistic: false,
  });

  const addOptimistic = useCallback(
    async (
      newItem: T,
      asyncAction: () => Promise<{
        success: boolean;
        data?: T;
        errors?: Array<{ field?: string; message: string }>;
      }>
    ) => {
      // Add item optimistically
      setState((prev) => ({
        data: [newItem, ...prev.data],
        isOptimistic: true,
      }));

      try {
        const result = await asyncAction();

        if (result.success && result.data) {
          // Replace optimistic item with real data
          setState((prev) => ({
            data: prev.data.map((item) =>
              item.id === newItem.id ? result.data! : item
            ),
            isOptimistic: false,
          }));
        } else {
          // Remove optimistic item on failure
          setState((prev) => ({
            data: prev.data.filter((item) => item.id !== newItem.id),
            isOptimistic: false,
          }));

          // Handle errors
          if (result.errors) {
            result.errors.forEach((error) => {
              toast.error(error.message || "An error occurred");
            });
          }
        }

        return result;
      } catch (error) {
        // Remove optimistic item on error
        setState((prev) => ({
          data: prev.data.filter((item) => item.id !== newItem.id),
          isOptimistic: false,
        }));

        onError?.(error);
        toast.error("An unexpected error occurred");

        return {
          success: false,
          errors: [{ message: "An unexpected error occurred" }],
        };
      }
    },
    [onError]
  );

  const updateOptimistic = useCallback(
    async (
      itemId: string,
      updatedItem: Partial<T>,
      asyncAction: () => Promise<{
        success: boolean;
        data?: T;
        errors?: Array<{ field?: string; message: string }>;
      }>
    ) => {
      // Store original item for rollback
      const originalData = state.data;

      // Update item optimistically
      setState((prev) => ({
        data: prev.data.map((item) =>
          item.id === itemId ? { ...item, ...updatedItem } : item
        ),
        isOptimistic: true,
      }));

      try {
        const result = await asyncAction();

        if (result.success && result.data) {
          // Replace optimistic item with real data
          setState((prev) => ({
            data: prev.data.map((item) =>
              item.id === itemId ? result.data! : item
            ),
            isOptimistic: false,
          }));
        } else {
          // Rollback on failure
          setState({
            data: originalData,
            isOptimistic: false,
          });

          // Handle errors
          if (result.errors) {
            result.errors.forEach((error) => {
              toast.error(error.message || "An error occurred");
            });
          }
        }

        return result;
      } catch (error) {
        // Rollback on error
        setState({
          data: originalData,
          isOptimistic: false,
        });

        onError?.(error);
        toast.error("An unexpected error occurred");

        return {
          success: false,
          errors: [{ message: "An unexpected error occurred" }],
        };
      }
    },
    [state.data, onError]
  );

  const removeOptimistic = useCallback(
    async (
      itemId: string,
      asyncAction: () => Promise<{
        success: boolean;
        errors?: Array<{ field?: string; message: string }>;
      }>
    ) => {
      // Store original item for rollback
      const originalData = state.data;

      // Remove item optimistically
      setState((prev) => ({
        data: prev.data.filter((item) => item.id !== itemId),
        isOptimistic: true,
      }));

      try {
        const result = await asyncAction();

        if (result.success) {
          setState((prev) => ({
            data: prev.data,
            isOptimistic: false,
          }));
        } else {
          // Rollback on failure
          setState({
            data: originalData,
            isOptimistic: false,
          });

          // Handle errors
          if (result.errors) {
            result.errors.forEach((error) => {
              toast.error(error.message || "An error occurred");
            });
          }
        }

        return result;
      } catch (error) {
        // Rollback on error
        setState({
          data: originalData,
          isOptimistic: false,
        });

        onError?.(error);
        toast.error("An unexpected error occurred");

        return {
          success: false,
          errors: [{ message: "An unexpected error occurred" }],
        };
      }
    },
    [state.data, onError]
  );

  return {
    data: state.data,
    isOptimistic: state.isOptimistic,
    addOptimistic,
    updateOptimistic,
    removeOptimistic,
    // Stable setter to avoid re-creating function each render (prevents effect loops)
    setData: useCallback((newData: T[]) => {
      // Avoid unnecessary state updates if reference is the same
      setState((prev) => {
        if (prev.data === newData) return prev;
        return { data: newData, isOptimistic: false };
      });
    }, []),
  };
}
