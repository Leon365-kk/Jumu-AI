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

## Deploying to Vercel

Add these environment variables in **Project Settings > Environment Variables** for **Production**, then redeploy:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `GEMINI_API_KEY` (if you are using `/api/gemini` on the deployed server)

If `VITE_SUPABASE_URL` or `VITE_SUPABASE_ANON_KEY` is missing, the app will now show a configuration warning screen instead of a blank page.
