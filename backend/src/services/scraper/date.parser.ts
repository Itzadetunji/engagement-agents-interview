import {
  addDaysIso,
  excelSerialToIso,
  todayIso,
} from "./utils.js";

export function parseExpiryText(
  text: string | undefined | null,
  excelEnd?: string | null,
  referenceDate = new Date(),
): string | null {
  const normalized = (text ?? "").trim().toLowerCase();
  const ref = new Date(referenceDate);
  ref.setHours(0, 0, 0, 0);

  if (!normalized && excelEnd) {
    const serial = Number(excelEnd);
    return excelSerialToIso(serial);
  }

  if (/ends?\s+today/.test(normalized) || normalized.includes("ends-today")) {
    return todayIso();
  }

  if (/ends?\s+tomorrow/.test(normalized) || normalized.includes("ends-tomorrow")) {
    return addDaysIso(1);
  }

  const explicit = parseExplicitDate(normalized, ref);
  if (explicit) return explicit;

  if (excelEnd) {
    const serial = Number(excelEnd);
    return excelSerialToIso(serial);
  }

  return null;
}

export function parseStartDate(excelStart?: string | null): string | null {
  if (!excelStart) return null;
  const serial = Number(excelStart);
  return excelSerialToIso(serial);
}

function parseExplicitDate(text: string, ref: Date): string | null {
  const monthDay = text.match(
    /(jan(?:uary)?|feb(?:ruary)?|mar(?:ch)?|apr(?:il)?|may|jun(?:e)?|jul(?:y)?|aug(?:ust)?|sep(?:t(?:ember)?)?|oct(?:ober)?|nov(?:ember)?|dec(?:ember)?)\.?\s+(\d{1,2})(?:,?\s+(\d{4}))?/i,
  );
  if (monthDay) {
    const month = monthIndex(monthDay[1]);
    const day = Number(monthDay[2]);
    const year = monthDay[3] ? Number(monthDay[3]) : ref.getFullYear();
    if (month === null) return null;
    const d = new Date(year, month, day);
    return d.toISOString().slice(0, 10);
  }

  const numeric = text.match(/(\d{1,2})\/(\d{1,2})\/(\d{2,4})/);
  if (numeric) {
    let year = Number(numeric[3]);
    if (year < 100) year += 2000;
    const d = new Date(year, Number(numeric[1]) - 1, Number(numeric[2]));
    return d.toISOString().slice(0, 10);
  }

  return null;
}

function monthIndex(token: string): number | null {
  const months = [
    "jan",
    "feb",
    "mar",
    "apr",
    "may",
    "jun",
    "jul",
    "aug",
    "sep",
    "oct",
    "nov",
    "dec",
  ];
  const idx = months.findIndex((m) => token.toLowerCase().startsWith(m));
  return idx === -1 ? null : idx;
}
