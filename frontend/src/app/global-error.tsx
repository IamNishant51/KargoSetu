"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error);
  }, [error]);

  return (
    <html lang="en">
      <body className="min-h-screen bg-[#FAF7F1] flex flex-col items-center justify-center p-4">
        <div className="max-w-xl w-full text-center bg-white p-8 rounded-2xl shadow-sm border border-[#E2E6EB]">
          <h2 className="text-[#B42318] text-2xl font-black mb-4 font-display">
            Something went wrong!
          </h2>
          <p className="text-[#3D4F68] mb-6">
            {error.message || "An unexpected error occurred during execution."}
          </p>
          <button
            onClick={() => reset()}
            className="px-6 py-3 bg-[#D95D0F] hover:bg-[#B45309] text-white font-bold rounded-xl shadow-[0_2px_0_#0A2342] transition-colors"
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
