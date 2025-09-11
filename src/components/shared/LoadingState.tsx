import React from "react";
import Logo from "./Logo";

interface LoadingStateProps {
  title?: string;
  description?: string;
}

export const LoadingState: React.FC<LoadingStateProps> = ({
  title,
  description,
}) => {
  return (
    <div
      role="status"
      aria-live="polite"
      className="w-[80%] max-w-md mx-auto p-6 bg-white/60 dark:bg-slate-900/60 backdrop-blur rounded-2xl border border-gray-200/60 dark:border-slate-700/60 shadow-lg flex items-center gap-6"
    >
      {/* Logo symbol */}
      <div className="flex-shrink-0 p-1 rounded-lg bg-gradient-to-br from-green-600 to-green-700/95 shadow-md">
        <Logo variant="symbol" size="md" showAdmin={false} />
      </div>

      {/* Content */}
      <div className="flex-1">
        <h3 className="text-lg font-semibold bg-gradient-to-r from-green-700 to-green-600 bg-clip-text text-transparent">
          {title ?? "Loading"}
        </h3>
        <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
          {description ?? "Please wait a moment while we load your data..."}
        </p>

        {/* Visual skeletons */}
        <div className="mt-4 space-y-3">
          <div className="h-3 rounded-full bg-gray-200 dark:bg-slate-700 w-3/4 animate-pulse" />
          <div className="h-3 rounded-full bg-gray-200 dark:bg-slate-700 w-1/2 animate-pulse" />
          <div className="h-3 rounded-full bg-gray-200 dark:bg-slate-700 w-5/6 animate-pulse" />
        </div>

        {/* Spinner + small note */}
        <div className="mt-5 flex items-center justify-center">
          <div
            className="w-9 h-9 rounded-full border-2 border-green-600 border-t-transparent animate-spin"
            aria-hidden
          />
        </div>
      </div>
    </div>
  );
};

export default LoadingState;
