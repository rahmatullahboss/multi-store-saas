export function selectRows(rows: any[], fields?: Record<string, any>) {
  if (!fields) return rows;
  // If fields include count, return count only
  if (Object.keys(fields).some((key) => key.toLowerCase().includes('count'))) {
    return [{ count: rows.length }];
  }
  // Otherwise return rows as-is (simple projection)
  return rows;
}
