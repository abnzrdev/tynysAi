export type AqiCategory = "low" | "medium" | "high" | "unknown";

interface ClassificationResult {
  category: AqiCategory;
  rule: string;
}

// Classifies particulate readings into simple bands from the referenced paper
export function classifyAqiCategory(pm25?: number | null, pm10?: number | null): ClassificationResult {
  const hasPm25 = typeof pm25 === "number" && Number.isFinite(pm25);
  const hasPm10 = typeof pm10 === "number" && Number.isFinite(pm10);

  const thresholds = {
    pm25: { medium: 25, high: 50 },
    pm10: { medium: 50, high: 100 },
  } as const;

  const overHigh = (hasPm25 && pm25! > thresholds.pm25.high) || (hasPm10 && pm10! > thresholds.pm10.high);
  if (overHigh) {
    return { category: "high", rule: "PM2.5 > 50 or PM10 > 100" };
  }

  const inMediumBand = (hasPm25 && pm25! >= thresholds.pm25.medium && pm25! <= thresholds.pm25.high)
    || (hasPm10 && pm10! >= thresholds.pm10.medium && pm10! <= thresholds.pm10.high);
  if (inMediumBand) {
    return { category: "medium", rule: "PM2.5 25-50 or PM10 50-100" };
  }

  if (hasPm25 || hasPm10) {
    const pm25LowOk = !hasPm25 || pm25! < thresholds.pm25.medium;
    const pm10LowOk = !hasPm10 || pm10! < thresholds.pm10.medium;
    if (pm25LowOk && pm10LowOk) {
      return { category: "low", rule: "PM2.5 < 25 and PM10 < 50" };
    }
  }

  return { category: "unknown", rule: "Insufficient particulate data" };
}
