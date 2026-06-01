export type Option = {
  value: string;
  label: string;
};

const DEFAULT_CONTENT_TYPE_OPTIONS: Option[] = [
  { value: "document", label: "Document" },
  { value: "video", label: "Video" },
  { value: "audio", label: "Audio" },
  { value: "physical", label: "Physical Item" },
];

const DEFAULT_CONTENT_CATEGORY_OPTIONS: Option[] = [
  { value: "exam_text", label: "Exam Text" },
  { value: "cibn_publication", label: "CIBN Publication" },
  { value: "research_paper", label: "Research Paper" },
  { value: "stationery", label: "Stationery" },
  { value: "souvenir", label: "Souvenir" },
  { value: "other", label: "Other" },
];

const parseOptions = (raw: string | undefined, fallback: Option[]) => {
  if (!raw) return fallback;
  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return fallback;
    const mapped = parsed
      .map((item) => {
        if (item && typeof item === "object" && item.value && item.label) {
          return { value: String(item.value), label: String(item.label) };
        }
        return null;
      })
      .filter((item): item is Option => Boolean(item));
    return mapped.length ? mapped : fallback;
  } catch {
    return fallback;
  }
};

export const CONTENT_TYPE_OPTIONS = parseOptions(
  process.env.NEXT_PUBLIC_CONTENT_TYPE_OPTIONS_JSON,
  DEFAULT_CONTENT_TYPE_OPTIONS
);

export const CONTENT_CATEGORY_OPTIONS = parseOptions(
  process.env.NEXT_PUBLIC_CONTENT_CATEGORY_OPTIONS_JSON,
  DEFAULT_CONTENT_CATEGORY_OPTIONS
);

const retryCount = Number(process.env.NEXT_PUBLIC_UPLOAD_RETRY_COUNT ?? "2");
const retryBaseDelayMs = Number(process.env.NEXT_PUBLIC_UPLOAD_RETRY_BASE_DELAY_MS ?? "400");
const retryMaxDelayMs = Number(process.env.NEXT_PUBLIC_UPLOAD_RETRY_MAX_DELAY_MS ?? "2500");

export const CONTENT_UPLOAD_RETRY = {
  retries: Number.isFinite(retryCount) ? retryCount : 2,
  baseDelayMs: Number.isFinite(retryBaseDelayMs) ? retryBaseDelayMs : 400,
  maxDelayMs: Number.isFinite(retryMaxDelayMs) ? retryMaxDelayMs : 2500,
};
