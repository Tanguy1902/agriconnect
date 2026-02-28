/**
 * Date utility functions for AgriConnect
 * Handles timezone conversion for dates from the backend (UTC) to local time
 */

/**
 * Converts a date string from the backend to a properly parsed Date object.
 * The backend (SQLite) stores dates in UTC without timezone info.
 * This function ensures naive timestamps are treated as UTC so the browser
 * can automatically convert them to the user's local timezone.
 * 
 * @param dateString - The date string from the backend
 * @returns A Date object correctly representing the UTC timestamp
 */
export function parseBackendDate(dateString: string): Date {
  // Check if the date string already has timezone info
  const hasTimezone = dateString.includes('Z') || /[+-]\d{2}:\d{2}$/.test(dateString) || /[+-]\d{4}$/.test(dateString);
  
  if (!hasTimezone) {
    // Backend stores dates in UTC without timezone marker.
    // Append 'Z' to tell JavaScript this is a UTC timestamp.
    // The browser will automatically convert to local time when displaying.
    return new Date(dateString.trim() + 'Z');
  }
  
  // If timezone is present, the Date constructor handles it correctly
  return new Date(dateString);
}

/**
 * A safer version that handles null/undefined dates
 * @param dateString - The date string from the backend (can be null/undefined)
 * @returns A Date object or null if input is invalid
 */
export function parseBackendDateSafe(dateString: string | null | undefined): Date | null {
  if (!dateString) return null;
  try {
    return parseBackendDate(dateString);
  } catch {
    return null;
  }
}
