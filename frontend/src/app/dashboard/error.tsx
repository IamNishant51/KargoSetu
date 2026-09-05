"use client";

import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] p-6 text-center rounded-xl border border-red-200 bg-red-50">
      <h2 className="text-xl font-semibold text-red-800 mb-2">
        Something went wrong!
      </h2>
      <p className="text-sm text-red-600 mb-4">
        {error.message || "An unexpected error occurred in the dashboard."}
      </p>
      <button
        type="button"
        aria-label="Try again"
        onClick={() => reset()}
        className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
      >
        Try again
      </button>
    </div>
  );
}
