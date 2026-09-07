"use client";

import { useEffect } from "react";
import { useLanguage } from "@/i18n/LanguageContext";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const { t } = useLanguage();
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex flex-col items-center justify-center min-h-[400px] p-8 text-center rounded-2xl border border-[#F3C2C2] bg-[#FDECEC]">
        <p className="mono-label text-[#B42318]">{t("err_kicker")}</p>
        <h2 className="mt-2 font-display font-black text-2xl tracking-tight text-[#0A2342]">
          {t("err_title")}
        </h2>
        <p className="mt-2 text-sm text-[#3D4F68] max-w-md">
          {error.message || t("err_default")}
        </p>
        <button
          type="button"
          aria-label="Try again"
          onClick={() => reset()}
          className="mt-6 px-6 py-3 rounded-xl bg-[#D95D0F] text-white text-sm font-bold hover:bg-[#B45309] transition-colors shadow-[0_2px_0_#0A2342]"
        >{t("try_again")}</button>
      </div>
    </div>
  );
}
