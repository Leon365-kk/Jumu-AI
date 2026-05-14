const PLAIN_TEXT_FILE_PATTERN = /\.(txt|md|csv|json|log|xml)$/i;
const IMAGE_FILE_PATTERN = /\.(png|jpe?g|webp|bmp|gif|tiff?)$/i;
const PDF_FILE_PATTERN = /\.pdf$/i;
const MAX_UPLOAD_BYTES = 12 * 1024 * 1024;
const MAX_PDF_PAGES = 8;
const MAX_PAGE_WIDTH = 1600;
const MAX_PAGE_HEIGHT = 2200;

const languageMap: Record<string, string> = {
  en: "eng",
  es: "spa",
  sw: "swa",
};

const normalizeExtractedText = (value: string) =>
  value.replace(/\n{3,}/g, "\n\n").trim();

type TesseractWorkerLike = {
  recognize: (source: Blob | HTMLCanvasElement) => Promise<{ data?: { text?: string } }>;
  terminate: () => Promise<unknown>;
};

const createTesseractWorker = async (language: string): Promise<TesseractWorkerLike> => {
  const { createWorker } = await import("tesseract.js");
  return createWorker(language);
};

const recognizeWithWorker = async (
  worker: TesseractWorkerLike,
  source: Blob | HTMLCanvasElement
) => {
  const result = await worker.recognize(source);
  return result.data?.text || "";
};

const clampViewportScale = (width: number, height: number) => {
  const widthScale = MAX_PAGE_WIDTH / width;
  const heightScale = MAX_PAGE_HEIGHT / height;
  return Math.min(2, widthScale, heightScale, 1.8);
};

const extractPdfText = async (file: File, worker: TesseractWorkerLike) => {
  const pdfBytes = new Uint8Array(await file.arrayBuffer());
  const pdfjsLib = await import("pdfjs-dist");

  // Configure PDF.js worker in Vite.
  (pdfjsLib as any).GlobalWorkerOptions.workerSrc = new URL(
    "pdfjs-dist/build/pdf.worker.min.mjs",
    import.meta.url
  ).toString();

  const loadingTask = (pdfjsLib as any).getDocument({ data: pdfBytes });
  const pdf = await loadingTask.promise;
  const pagesToRead = Math.min(pdf.numPages, MAX_PDF_PAGES);
  const pageTexts: string[] = [];

  for (let i = 1; i <= pagesToRead; i++) {
    const page = await pdf.getPage(i);
    const initialViewport = page.getViewport({ scale: 1 });
    const scale = clampViewportScale(initialViewport.width, initialViewport.height);
    const viewport = page.getViewport({ scale });

    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");
    if (!context) continue;

    canvas.width = Math.floor(viewport.width);
    canvas.height = Math.floor(viewport.height);

    await page.render({
      canvasContext: context,
      viewport,
    }).promise;

    const pageText = await recognizeWithWorker(worker, canvas);
    if (pageText?.trim()) {
      pageTexts.push(pageText.trim());
    }
  }

  return pageTexts.join("\n\n");
};

export async function extractTextFromUpload(
  file: File,
  language: string
): Promise<{ text: string; provider: string }> {
  if (file.size > MAX_UPLOAD_BYTES) {
    throw new Error("File is too large. Please upload a file smaller than 12MB.");
  }

  const tesseractLanguage = languageMap[language] || "eng";
  const isPlainText =
    file.type.startsWith("text/") || PLAIN_TEXT_FILE_PATTERN.test(file.name);
  const isPdf = file.type === "application/pdf" || PDF_FILE_PATTERN.test(file.name);
  const isImage =
    file.type.startsWith("image/") || IMAGE_FILE_PATTERN.test(file.name);

  if (isPlainText) {
    const localText = normalizeExtractedText(await file.text());
    return { text: localText, provider: "local-text-reader" };
  }

  if (isImage) {
    const worker = await createTesseractWorker(tesseractLanguage);
    try {
      const ocrText = normalizeExtractedText(await recognizeWithWorker(worker, file));
      return { text: ocrText, provider: "tesseract.js-image" };
    } finally {
      await worker.terminate();
    }
  }

  if (isPdf) {
    const worker = await createTesseractWorker(tesseractLanguage);
    try {
      const pdfText = normalizeExtractedText(await extractPdfText(file, worker));
      return { text: pdfText, provider: "tesseract.js+pdf.js" };
    } finally {
      await worker.terminate();
    }
  }

  throw new Error("Unsupported file type. Please upload image, PDF, or text files.");
}
