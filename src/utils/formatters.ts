import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";

export const formatDate = (
  date: string | Date,
  formatStr: string = "dd MMM yyyy",
): string => {
  try {
    const dateObj = typeof date === "string" ? parseISO(date) : date;
    return format(dateObj, formatStr, { locale: es });
  } catch {
    return date.toString();
  }
};

export const formatYear = (date: string | Date): number => {
  try {
    const dateObj = typeof date === "string" ? parseISO(date) : date;
    return dateObj.getFullYear();
  } catch {
    return new Date().getFullYear();
  }
};

export const formatRating = (rating: number): string => {
  return rating.toFixed(1);
};
