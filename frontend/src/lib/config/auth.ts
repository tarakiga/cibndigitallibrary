export type DepartmentOption = {
  value: string;
  label: string;
};

const DEFAULT_CIBN_DEPARTMENTS: DepartmentOption[] = [
  { value: "banking_operations", label: "Banking Operations" },
  { value: "risk_management", label: "Risk Management" },
  { value: "credit_analysis", label: "Credit Analysis" },
  { value: "treasury", label: "Treasury" },
  { value: "retail_banking", label: "Retail Banking" },
  { value: "corporate_banking", label: "Corporate Banking" },
  { value: "compliance", label: "Compliance" },
];

const normalizeValue = (label: string) =>
  label
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "_");

const parseDepartmentOptions = (
  raw: string | undefined,
  fallback: DepartmentOption[]
) => {
  if (!raw) return fallback;
  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return fallback;
    const mapped = parsed
      .map((item) => {
        if (typeof item === "string") {
          return { value: normalizeValue(item), label: item };
        }
        if (item && typeof item === "object" && item.value && item.label) {
          return { value: String(item.value), label: String(item.label) };
        }
        return null;
      })
      .filter((item): item is DepartmentOption => Boolean(item));
    return mapped.length ? mapped : fallback;
  } catch {
    return fallback;
  }
};

export const CIBN_DEPARTMENT_OPTIONS = parseDepartmentOptions(
  process.env.NEXT_PUBLIC_CIBN_DEPARTMENTS_JSON,
  DEFAULT_CIBN_DEPARTMENTS
);
