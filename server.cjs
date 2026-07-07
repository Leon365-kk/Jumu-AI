var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// server.ts
var import_express = __toESM(require("express"), 1);
var import_cors = __toESM(require("cors"), 1);
var import_path = __toESM(require("path"), 1);
var import_vite = require("vite");
var import_dotenv = __toESM(require("dotenv"), 1);
import_dotenv.default.config({ path: ".env.local" });
var NVIDIA_API_BASE = "https://integrate.api.nvidia.com/v1";
var NVIDIA_KEY = process.env.NVIDIA_API_KEY;
function getNvidiaModel(requestedModel) {
  if (!requestedModel) return "meta/llama-3.1-8b-instruct";
  const m = requestedModel.toLowerCase();
  if (m.includes("vision") || m.includes("1.5-flash") || m.includes("camera") || m.includes("math")) {
    return "meta/llama-3.2-90b-vision-instruct";
  }
  return requestedModel;
}
function convertMessages(contents) {
  const textMessages = [];
  const imagePayloads = [];
  for (const item of contents) {
    const role = item.role === "model" ? "assistant" : item.role || "user";
    let textParts = [];
    for (const part of item.parts || []) {
      if (typeof part.text === "string" && part.text.trim()) {
        textParts.push(part.text);
      } else if (part.inlineData) {
        imagePayloads.push({
          mimeType: part.inlineData.mimeType || "image/jpeg",
          data: part.inlineData.data
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
function attachImagesToMessages(textMessages, imagePayloads) {
  if (imagePayloads.length === 0) return textMessages;
  const messages = [...textMessages];
  for (let i = messages.length - 1; i >= 0; i--) {
    if (messages[i].role === "user") {
      messages[i].content = [
        { type: "text", text: messages[i].content || " " },
        ...imagePayloads.map((img) => ({
          type: "image_url",
          image_url: { url: `data:${img.mimeType};base64,${img.data}` }
        }))
      ];
      break;
    }
  }
  return messages;
}
async function startServer() {
  const app = (0, import_express.default)();
  const PORT = process.env.PORT ? Number(process.env.PORT) : 3e3;
  if (!NVIDIA_KEY) {
    console.error("ERROR: NVIDIA_API_KEY is not set");
  }
  const allowedOrigins = [
    process.env.VITE_RENDER_URL?.replace(/\/$/, "") || "https://jumu-ai.onrender.com",
    /https:\/\/.*\.vercel\.app$/,
    "https://jumuai.stemlensnetwork.com",
    "http://localhost:5173"
  ];
  app.use((0, import_cors.default)({ origin: allowedOrigins, credentials: true }));
  app.options("*", (0, import_cors.default)({ origin: allowedOrigins, credentials: true }));
  app.use(import_express.default.json({ limit: "10mb" }));
  app.use((_req, res, next) => {
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.setHeader("X-Frame-Options", "DENY");
    res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
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
        "frame-src 'self' https://www.youtube.com https://www.youtube-nocookie.com"
      ].join("; ")
    );
    res.setHeader("Cross-Origin-Opener-Policy", "same-origin-allow-popups");
    res.setHeader("Cross-Origin-Embedder-Policy", "require-corp");
    res.setHeader(
      "Permissions-Policy",
      "clipboard-write=(self), microphone=(self), camera=(self)"
    );
    next();
  });
  app.use(import_express.default.text({ type: "text/plain", limit: "10mb" }));
  app.use(import_express.default.urlencoded({ limit: "10mb", extended: true }));
  app.post("/api/gemini", async (req, res) => {
    const { model, contents, config } = req.body || {};
    if (!NVIDIA_KEY) {
      return res.status(500).json({ error: "NVIDIA_API_KEY not configured on server" });
    }
    try {
      const nvidiaModel = getNvidiaModel(model);
      const { textMessages, imagePayloads } = convertMessages(contents || []);
      const messages = attachImagesToMessages(textMessages, imagePayloads);
      const body = {
        model: nvidiaModel,
        messages,
        stream: false,
        max_tokens: 4096
      };
      const temp = config?.temperature ?? config?.temperature ?? 0.7;
      const topP = config?.topP ?? config?.top_p ?? 0.9;
      if (temp !== void 0) body.temperature = temp;
      if (topP !== void 0) body.top_p = topP;
      if (config?.responseMimeType === "application/json") {
        body.response_format = { type: "json_object" };
      }
      const response = await fetch(`${NVIDIA_API_BASE}/chat/completions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${NVIDIA_KEY}`
        },
        body: JSON.stringify(body)
      });
      if (!response.ok) {
        const errorBody = await response.json().catch(() => ({}));
        throw new Error(errorBody.error?.message || `NVIDIA API error: HTTP ${response.status}`);
      }
      const data = await response.json();
      const text = data.choices?.[0]?.message?.content ?? "";
      const stopReason = data.choices?.[0]?.finish_reason ?? null;
      const candidates = text || stopReason ? [
        {
          content: { parts: [{ text }] },
          finishReason: stopReason
        }
      ] : void 0;
      res.json({ text, candidates });
    } catch (error) {
      console.error("NVIDIA Proxy Error:", error);
      res.status(500).json({ error: error.message || "Internal Server Error" });
    }
  });
  app.get("/api/health", (_req, res) => {
    res.json({
      status: "ok",
      provider: "nvidia-nim",
      model: "meta/llama-3.1-8b-instruct"
    });
  });
  if (process.env.NODE_ENV !== "production") {
    const vite = await (0, import_vite.createServer)({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    const distPath = import_path.default.join(process.cwd(), "dist");
    app.use(import_express.default.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(import_path.default.join(distPath, "index.html"));
    });
  }
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log(`NVIDIA NIM API key: ${NVIDIA_KEY ? "loaded" : "MISSING"}`);
  });
}
startServer();
//# sourceMappingURL=server.cjs.map
