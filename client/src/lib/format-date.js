import { format, isValid } from "date-fns";

export function formatDisplayDate(dateInput, fallback = "") {
  if (!dateInput) return fallback;

  const date = dateInput instanceof Date ? dateInput : new Date(dateInput);
  if (!isValid(date)) return fallback;

  return format(date, "d MMM, yyyy");
}
