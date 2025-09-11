"use client";

import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { pageview } from "@/lib/gtag";

export function AnalyticsProvider() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (!pathname) return;
    const url =
      searchParams && searchParams.toString()
        ? `${pathname}?${searchParams.toString()}`
        : pathname;

    pageview(url);
  }, [pathname, searchParams]);

  return null;
}