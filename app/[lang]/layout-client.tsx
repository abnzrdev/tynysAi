"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { SidebarLayout } from "@/components/sidebar";
import { type Locale } from "@/lib/i18n/config";

type LangLayoutClientProps = {
  locale: Locale;
  children: ReactNode;
};

export function LangLayoutClient({ locale, children }: LangLayoutClientProps) {
  const pathname = usePathname();
  const isDashboardRoute = pathname?.includes("/dashboard");

  if (isDashboardRoute) {
    return (
      <SidebarLayout locale={locale}>
        <div className="min-h-screen w-full overflow-x-hidden">{children}</div>
      </SidebarLayout>
    );
  }

  return <div className="min-h-screen w-full overflow-x-hidden">{children}</div>;
}
