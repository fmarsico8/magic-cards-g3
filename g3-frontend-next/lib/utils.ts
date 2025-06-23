import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export type TimeGranularity = "day" | "month" | "quarter" | "year"

export function getFormattedDate(date: Date | string, granularity: TimeGranularity): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  switch (granularity) {
    case "day":
      return dateObj.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric' 
      });
    case "month":
      return dateObj.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short' 
      });
    case "quarter":
      const quarter = Math.floor(dateObj.getMonth() / 3) + 1;
      return `Q${quarter} ${dateObj.getFullYear()}`;
    case "year":
      return dateObj.getFullYear().toString();
    default:
      return dateObj.toLocaleDateString();
  }
}

export function subDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() - days);
  return result;
}

export function subMonths(date: Date, months: number): Date {
  const result = new Date(date);
  result.setMonth(result.getMonth() - months);
  return result;
}

export function subQuarters(date: Date, quarters: number): Date {
  const result = new Date(date);
  result.setMonth(result.getMonth() - (quarters * 3));
  return result;
}

export function subYears(date: Date, years: number): Date {
  const result = new Date(date);
  result.setFullYear(result.getFullYear() - years);
  return result;
}
