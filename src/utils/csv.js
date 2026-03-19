export function parseCsvLine(line) {
  const result = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i += 1) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i += 1;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (ch === "," && !inQuotes) {
      result.push(current.trim());
      current = "";
    } else {
      current += ch;
    }
  }

  result.push(current.trim());
  return result;
}

export function parseCsv(text) {
  const lines = text.split(/\r?\n/).filter((line) => line.trim());
  if (!lines.length) return [];

  const headers = parseCsvLine(lines[0]).map((h) => h.trim());

  return lines.slice(1).map((line) => {
    const values = parseCsvLine(line);
    return headers.reduce((obj, header, index) => {
      obj[header] = values[index] || "";
      return obj;
    }, {});
  });
}

export function toCsvValue(value) {
  const str = value == null ? "" : String(value);
  return /[",]/.test(str) ? `"${str.replace(/"/g, '""')}"` : str;
}

export function buildCsv(rows, headers) {
  const lines = [headers.join(",")];
  for (const row of rows) {
    lines.push(headers.map((header) => toCsvValue(row[header] || "")).join(","));
  }
  return lines.join("\n");
}
