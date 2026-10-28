function escapeCsvCell(cell: unknown): string {
  const text = cell === null || cell === undefined ? '' : String(cell);
  return /[",\n\r]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

export function buildCsv(headers: string[], rows: unknown[][]): string {
  return [headers, ...rows].map((row) => row.map(escapeCsvCell).join(',')).join('\r\n');
}

export function downloadCsv(fileName: string, csvContent: string): void {
  // BOM để Excel đọc đúng tiếng Việt có dấu.
  const csvBlob = new Blob(['\uFEFF', csvContent], { type: 'text/csv;charset=utf-8' });
  const objectUrl = URL.createObjectURL(csvBlob);
  const anchor = document.createElement('a');
  anchor.href = objectUrl;
  anchor.download = fileName;
  anchor.click();
  URL.revokeObjectURL(objectUrl);
}
