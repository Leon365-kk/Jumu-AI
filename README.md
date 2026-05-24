<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/a890665c-e5b4-4bf6-8e47-a57e74810b6f

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`

## Deploying to Vercel (Frontend) + Render (API Backend)

This app uses a dual-hosting setup: Vercel serves the SPA, and Render runs the Express API proxy.

### On Vercel

Add these environment variables in **Project Settings > Environment Variables** for **Production**:

- `VITE_API_URL=https://jumu-ai.onrender.com` — points frontend API calls to the Render backend
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

### On Render

Ensure `NVIDIA_API_KEY` is set. The CORS middleware on Render accepts requests from any `*.vercel.app` origin automatically, so the Vercel frontend can call the Render API without issues.

### Verifying the setup

1. Vercel serves `your-app.vercel.app` (the React SPA)
2. Vercel proxy-rewrites `/api/*` → `https://jumu-ai.onrender.com/api/*`
3. Or, without rewrites: the frontend uses `VITE_API_URL` to call `https://jumu-ai.onrender.com/api/*` directly

## Reader Upload + Voice

- Upload OCR now uses fully open-source local processing with `tesseract.js` + `pdfjs-dist`.
- Reader voice now supports a low-latency **Streaming** mode in addition to Gemini voice.
