import { useEffect, useState } from "react";
import { countryToLocale, SupportedLocale } from "@/lib/locale";

export const useGeoLanguage = () => {
  const [detected, setDetected] = useState<SupportedLocale | null>(null);

  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      try {
        const res = await fetch("https://ipapi.co/json/");
        if (!res.ok) throw new Error("ipapi request failed");
        const data = await res.json();
        const locale = countryToLocale(data.country || data.country_code);
        if (!cancelled) setDetected(locale);
      } catch (e) {
        if (!cancelled) setDetected(null);
      }
    };
    run();
    return () => {
      cancelled = true;
    };
  }, []);

  return detected;
};
