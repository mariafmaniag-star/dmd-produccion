export type OrderDraft = {
  code?: string;
  site?: string;
  serviceType?: string;
  receivedAt?: string;
  extractedText: string;
};

const clean = (value: string) => value.replace(/\s+/g, " ").replace(/\s*:\s*/g, ": ").trim();
const labelled = (text: string, labels: string[]) => {
  const label = labels.map(item => item.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|");
  const match = text.match(new RegExp(`(?:${label})\\s*[:#-]\\s*([^\\n]{3,110})`, "i"));
  return match?.[1] ? clean(match[1]) : undefined;
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
  const order = extractedText.match(/(?:orden\s*(?:de\s*)?servicio|o\.?\s*s\.?)\s*(?:n(?:[°ºo.]|ro\.)?)?\s*[:#-]?\s*([A-Z0-9][A-Z0-9/-]{3,})/i)?.[1];
  const date = extractedText.match(/(?:fecha(?:\s+de\s+(?:emisi[oó]n|solicitud))?)\s*[:#-]?\s*(\d{1,2}[/-]\d{1,2}[/-]\d{2,4})/i)?.[1];
  return {
    code: order ? `OS-${order.replace(/^OS[-\s]?/i, "")}` : undefined,
    site: labelled(extractedText, ["sede", "ubicación", "ubicacion", "dirección", "direccion", "lugar del servicio"]),
    serviceType: labelled(extractedText, ["tipo de servicio", "descripción del servicio", "descripcion del servicio", "servicio", "descripción", "descripcion"]),
    receivedAt: date ? (() => { const [day, month, year] = date.split(/[/-]/); return `${year.length === 2 ? `20${year}` : year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`; })() : undefined,
    extractedText,
  };
}
