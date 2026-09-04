import React from "react";
import { ShieldCheck } from "lucide-react";
import { useTranslation } from "react-i18next";
import { AppWordmark, GrowingShieldMark } from "@/components/brand/AppBrand";
import AuthLanguageSwitcher from "@/components/AuthLanguageSwitcher";

export default function AuthLayout({ icon: Icon, title, subtitle, footer, children }) {
  const { t, i18n } = useTranslation();
  const isRtl = i18n.dir() === "rtl";

  return (
    <main
      className="relative min-h-[100dvh] overflow-hidden bg-[linear-gradient(145deg,#dff5ef_0%,#f8f6ef_48%,#e5f2ef_100%)] px-4 py-5 sm:py-8"
      dir={isRtl ? "rtl" : "ltr"}
    >
      <div className="pointer-events-none absolute -start-24 -top-28 h-72 w-72 rounded-full bg-teal-300/25 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-32 -end-24 h-80 w-80 rounded-full bg-amber-200/30 blur-3xl" />

      <div className="relative mx-auto flex min-h-[calc(100dvh-2.5rem)] w-full max-w-md flex-col justify-center">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <GrowingShieldMark size={44} />
            <AppWordmark name={t("global.app_name")} className="max-w-[170px]" />
          </div>
          <AuthLanguageSwitcher />
        </div>

        <section className="overflow-hidden rounded-[30px] border border-white/80 bg-white/86 shadow-[0_28px_80px_rgba(36,105,92,0.18)] backdrop-blur-xl">
          <div className="px-6 pb-4 pt-7 text-center sm:px-8">
            <div className="mx-auto mb-3 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-teal-500 to-teal-700 text-white shadow-lg shadow-teal-700/20">
              <Icon className="h-6 w-6" aria-hidden="true" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">{title}</h1>
            {subtitle && <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-slate-600">{subtitle}</p>}
          </div>

          <div className="px-6 pb-6 sm:px-8 sm:pb-8">{children}</div>
        </section>

        {footer && <p className="mt-4 text-center text-sm text-slate-600">{footer}</p>}

        <div className="mt-4 flex items-center justify-center gap-2 text-center text-xs leading-5 text-slate-500">
          <ShieldCheck className="h-4 w-4 shrink-0 text-teal-700" aria-hidden="true" />
          <span>{t("onboarding.welcome.privacy_note")}</span>
        </div>
      </div>
    </main>
  );
}
