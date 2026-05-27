import express, { type NextFunction, type Request, type Response } from "express";
import cors from "cors";
import path from "path";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const NVIDIA_API_BASE = "https://integrate.api.nvidia.com/v1";
const NVIDIA_KEY = process.env.NVIDIA_API_KEY;

// Model routing: maps model identifiers to NVIDIA NIM model IDs.
// Default text model: meta/llama-3.1-8b-instruct
// Vision model for Camera OCR / MathHelper: meta/llama-3.2-90b-vision-instruct
function getNvidiaModel(requestedModel: string | undefined): string {
  if (!requestedModel) return "meta/llama-3.1-8b-instruct";
  const m = requestedModel.toLowerCase();
  if (m.includes("vision") || m.includes("1.5-flash") || m.includes("camera") || m.includes("math")) {
    return "meta/llama-3.2-90b-vision-instruct";
  }
  return requestedModel;
}

// Converts the app's Gemini-style `contents` format to NVIDIA NIM messages array.
// Each part is accumulated into a single content string per message.
function convertMessages(contents: any[]): { textMessages: any[]; imagePayloads: any[] } {
  const textMessages: any[] = [];
  const imagePayloads: any[] = [];

  for (const item of contents) {
    const role = item.role === "model" ? "assistant" : item.role || "user";
    const textParts: string[] = [];

    for (const part of item.parts || []) {
      if (typeof part.text === "string" && part.text.trim()) {
        textParts.push(part.text);
      } else if (part.inlineData) {
        imagePayloads.push({
          mimeType: part.inlineData.mimeType || "image/jpeg",
          data: part.inlineData.data,
        });
      }
    }

    const content = textParts.join("\n").trim();
    if (content || role === "system") {
      textMessages.push({ role, content: content || " " });
    }
  }

  return { textMessages, imagePayloads };
}

// Merges any collected image payloads into the last user message so that NVIDIA
// receives them inline with the text prompt.
function attachImagesToMessages(textMessages: any[], imagePayloads: any[]): any[] {
  if (imagePayloads.length === 0) return textMessages;
  const messages = [...textMessages];
  for (let i = messages.length - 1; i >= 0; i--) {
    if (messages[i].role === "user") {
      messages[i].content = [
        { type: "text", text: messages[i].content || " " },
        ...imagePayloads.map((img) => ({
          type: "image_url",
          image_url: { url: `data:${img.mimeType};base64,${img.data}` },
        })),
      ];
      break;
    }
  }
  return messages;
}

async function startServer() {
  const app = express();
  const PORT = process.env.PORT ? Number(process.env.PORT) : 3000;

  if (!NVIDIA_KEY) {
    console.error("ERROR: NVIDIA_API_KEY is not set");
  }

  // CORS - allow requests from Vercel frontend and local dev
  const allowedOrigins = [
    process.env.VITE_RENDER_URL?.replace(/\/$/, "") || "https://jumu-ai.onrender.com",
    /https:\/\/.*\.vercel\.app$/,
    "https://jumuai.stemlensnetwork.com",
    "http://localhost:5173",
  ];
  app.use(cors({ origin: allowedOrigins, credentials: true }));
  app.options("*", cors({ origin: allowedOrigins, credentials: true }));

  app.use(express.json({ limit: "10mb" }));

  // SEO & Security headers
  app.use((_req: Request, res: Response, next: NextFunction) => {
    // Prevent MIME sniffing
    res.setHeader("X-Content-Type-Options", "nosniff");
    // Prevent clickjacking
    res.setHeader("X-Frame-Options", "DENY");
    // Control referrer information
    res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
    // Prevent memory-unsafe inline execution (CSP)
    res.setHeader(
      "Content-Security-Policy",
      [
        "default-src 'self'",
        // Unsplash images need explicit source
        "img-src 'self' data: https://images.unsplash.com https://picsum.photos",
        // Google Fonts, Unsplash fonts
        "font-src 'self' https://fonts.gstatic.com",
        // Stylesheets: app CSS + inline styles used by React/motion
        "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
        // Vite/HMR dev-server, Gemini AI proxy
        "connect-src 'self' https://integrate.api.nvidia.com https://*.supabase.co wss://*.supabase.co https://api.openai.com https://generativelanguage.googleapis.com",
        // Service worker scope
        "worker-src 'self'",
        // YouTube embeds etc.
        "frame-src 'self' https://www.youtube.com https://www.youtube-nocookie.com",
      ].join("; "),
    );
    // Cross-origin opener/embedder policies
    res.setHeader("Cross-Origin-Opener-Policy", "same-origin-allow-popups");
    res.setHeader("Cross-Origin-Embedder-Policy", "require-corp");
    // Permissions policy (clipboard, microphone only when needed)
    res.setHeader(
      "Permissions-Policy",
      "clipboard-write=(self), microphone=(self), camera=(self)",
    );
    next();
  });
  app.use(express.text({ type: "text/plain", limit: "10mb" }));
  app.use(express.urlencoded({ limit: "10mb", extended: true }));

  // API Proxy: translating the app's Gemini-style payload to NVIDIA NIM format
  app.post("/api/gemini", async (req: Request, res: Response) => {
    const { model, contents, config } = req.body || {};

    if (!NVIDIA_KEY) {
      return res.status(500).json({ error: "NVIDIA_API_KEY not configured on server" });
    }

    try {
      const nvidiaModel = getNvidiaModel(model);

      const { textMessages, imagePayloads } = convertMessages(contents || []);
      const messages = attachImagesToMessages(textMessages, imagePayloads);

      const body: any = {
        model: nvidiaModel,
        messages,
        stream: false,
        max_tokens: 4096,
      };

      // Map Gemini config to NIM config
      const temp = config?.temperature ?? config?.temperature ?? 0.7;
      const topP = config?.topP ?? config?.top_p ?? 0.9;
      if (temp !== undefined) body.temperature = temp;
      if (topP !== undefined) body.top_p = topP;

      // responseMimeType: "application/json" -> force structured JSON output
      if (config?.responseMimeType === "application/json") {
        body.response_format = { type: "json_object" };
      }

      const response = await fetch(`${NVIDIA_API_BASE}/chat/completions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${NVIDIA_KEY}`,
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const errorBody: any = await response.json().catch(() => ({}));
        throw new Error(errorBody.error?.message || `NVIDIA API error: HTTP ${response.status}`);
      }

      const data: any = await response.json();

      // NVIDIA response -> app's expected { text, candidates } shape
      const text = data.choices?.[0]?.message?.content ?? "";
      const stopReason = data.choices?.[0]?.finish_reason ?? null;

      // Construct a Gemini-like candidates array so that frontend TTS code
      // and any other candidate-dependent paths don't break grossly.
      // NOTE: NVIDIA NIM returns text, not inline audio data.
      // TTS path (Reader.tsx:704) gracefully falls through when inlineData is absent.
      const candidates =
        text || stopReason
          ? [
              {
                content: { parts: [{ text }] },
                finishReason: stopReason,
              },
            ]
          : undefined;

      res.json({ text, candidates });
    } catch (error: any) {
      console.error("NVIDIA Proxy Error:", error);
      res.status(500).json({ error: error.message || "Internal Server Error" });
    }
  });

  // Health-check endpoint - confirms the NVIDIA proxy is reachable
  app.get("/api/health", (_req: Request, res: Response) => {
    res.json({
      status: "ok",
      provider: "nvidia-nim",
      model: "meta/llama-3.1-8b-instruct",
    });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req: Request, res: Response) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log(`NVIDIA NIM API key: ${NVIDIA_KEY ? "loaded" : "MISSING"}`);
  });
}

startServer();
