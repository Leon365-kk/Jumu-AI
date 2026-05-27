/**
 * Service to handle AI interactions via the backend proxy.
 * This keeps the API keys secure on the server.
 */

export interface GeminiRequest {
  model?: string;
  contents: any[];
  config?: any;
}

export interface GeminiResponse {
  text: string;
  candidates?: any[];
  error?: string;
}

const rawApiBase = ((import.meta as any).env.VITE_API_URL || "").trim();
const API_BASE = rawApiBase.replace(/\/$/, "");

export async function generateAIContent(request: GeminiRequest): Promise<GeminiResponse> {
  const endpoint = API_BASE ? `${API_BASE}/api/gemini` : "/api/gemini";

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      let errorMessage = `HTTP error ${response.status}`;
      try {
        const errorData = await response.json();
        errorMessage = errorData?.error || errorMessage;
      } catch {
        const textFallback = await response.text().catch(() => "");
        if (textFallback) errorMessage = textFallback;
      }
      throw new Error(errorMessage);
    }

    return await response.json();
  } catch (error: any) {
    console.error('AI Service Error:', { endpoint, error });
    return {
      text: '',
      error: error.message || 'Failed to connect to AI service'
    };
  }
}
