/**
 * Formats a Date object or string as YYYY-MM-DD, ignoring timezones.
 * Useful for "calendar dates" like birthdays and anniversaries.
 */
export function formatDateOnly(date: Date | string | null | undefined): string | null {
  if (!date) return null;
  
  // If it's already a string and looks like YYYY-MM-DD, just return the date part
  if (typeof date === 'string' && /^\d{4}-\d{2}-\d{2}/.test(date)) {
    return date.substring(0, 10);
  }

  const d = new Date(date);
  if (isNaN(d.getTime())) return null;

  // For Date objects (like those from Postgres TIMESTAMP), use local methods. 
  // Postgres TIMESTAMP is "local" relative to the server/driver, so using UTC
  // methods shifts the day if the server is not in UTC.
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  
  return `${year}-${month}-${day}`;
}
