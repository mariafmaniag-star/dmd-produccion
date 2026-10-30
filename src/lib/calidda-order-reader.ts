export type OrderDraft = {
  code?: string;
  site?: string;
  serviceType?: string;
  workDescription?: string;
  receivedAt?: string;
  extractedText: string;
};

const clean = (value: string) => value.replace(/\s+/g, " ").replace(/\s*:\s*/g, ": ").trim();
const titleCase = (value: string) => value.toLocaleLowerCase("es-PE").replace(/(^|\s)\S/g, letter => letter.toLocaleUpperCase("es-PE"));
const allLabels = ["Sede", "Ubicación", "Ubicacion", "Dirección", "Direccion", "Centro de costo", "Servicio", "Tipo de servicio", "Descripción", "Descripcion", "Descripción del trabajo", "Descripcion del trabajo", "Alcance", "Fecha", "Orden", "Solicitante"];
const stopPattern = allLabels.map(label => label.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|");
const afterLabel = (text: string, names: string[], max = 120) => {
  const pattern = names.map(name => name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|");
  const match = text.match(new RegExp(`(?:${pattern})\\s*[:#-]\\s*(.{3,${max}?})(?=\\s+(?:${stopPattern})\\s*[:#-]|$)`, "i"));
  return match?.[1] ? clean(match[1]) : undefined;
};
const compactSite = (value?: string) => {
  if (!value) return undefined;
  const scss = value.match(/\b(SCCS(?:\s+(?!TABLERO|SERVICIO|TRABAJO|DESCRIPCI[OÓ]N|ALCANCE|ORDEN|FECHA)[A-ZÁÉÍÓÚÑ0-9-]+){1,4})\b/i)?.[1];
  const selected = scss || value.replace(/\b(?:distrito|provincia|departamento|direcci[oó]n)\b.*$/i, "");
  const cleaned = clean(selected).replace(/[;,.]+$/, "");
  return scss ? cleaned.toLocaleUpperCase("es-PE") : titleCase(cleaned);
};
const compactService = (value?: string, text?: string) => {
  const source = `${value || ""} ${text || ""}`;
  const known = source.match(/\b(tablero(?:\s+el[eé]ctrico)?|mantenimiento\s+(?:preventivo|correctivo)|instalaci[oó]n\s+el[eé]ctrica|inspecci[oó]n\s+t[eé]cnica|reparaci[oó]n\s+el[eé]ctrica|prueba(?:s)?\s+el[eé]ctrica(?:s)?|puesta\s+a\s+tierra)\b/i)?.[1];
  if (known) return titleCase(known);
  return value ? titleCase(value.split(/\s+(?:sede|ubicaci[oó]n|fecha|orden)\b/i)[0].slice(0, 70)) : undefined;
};

/** Reads text embedded in a digital PDF. Scanned PDFs intentionally remain for manual review. */
export async function readCaliddaOrder(file: File): Promise<OrderDraft> {
  if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) {
    throw new Error("Selecciona una orden en formato PDF.");
  }
  const pdfjs = await import("pdfjs-dist/legacy/build/pdf.mjs");
  pdfjs.GlobalWorkerOptions.workerSrc = new URL("pdfjs-dist/legacy/build/pdf.worker.min.mjs", import.meta.url).toString();
  const document = await pdfjs.getDocument({ data: new Uint8Array(await file.arrayBuffer()) }).promise;
  const pages: string[] = [];
  for (let pageNumber = 1; pageNumber <= Math.min(document.numPages, 15); pageNumber += 1) {
    const page = await document.getPage(pageNumber);
    const content = await page.getTextContent();
    pages.push(content.items.map(item => "str" in item ? item.str : "").join(" "));
  }
  const extractedText = clean(pages.join("\n"));
  const rawSite = afterLabel(extractedText, ["Sede", "Ubicación", "Ubicacion", "Dirección", "Direccion", "Lugar del servicio"]);
  const rawService = afterLabel(extractedText, ["Tipo de servicio", "Servicio", "Especialidad"]);
  const rawDescription = afterLabel(extractedText, ["Descripción del trabajo", "Descripcion del trabajo", "Descripción", "Descripcion", "Alcance", "Trabajo a realizar"], 280);
  const order = extractedText.match(/(?:orden\s*(?:de\s*)?servicio|o\.?\s*s\.?)\s*(?:n(?:[°ºo.]|ro\.)?)?\s*[:#-]?\s*([A-Z0-9][A-Z0-9/-]{3,})/i)?.[1];
  const date = extractedText.match(/(?:fecha(?:\s+de\s+(?:emisi[oó]n|solicitud))?)\s*[:#-]?\s*(\d{1,2}[/-]\d{1,2}[/-]\d{2,4})/i)?.[1];
  return {
    code: order ? `OS-${order.replace(/^OS[-\s]?/i, "")}` : undefined,
    site: compactSite(rawSite || extractedText),
    serviceType: compactService(rawService, extractedText),
    workDescription: rawDescription ? clean(rawDescription).slice(0, 280) : undefined,
    receivedAt: date ? (() => { const [day, month, year] = date.split(/[/-]/); return `${year.length === 2 ? `20${year}` : year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`; })() : undefined,
    extractedText,
  };
}
