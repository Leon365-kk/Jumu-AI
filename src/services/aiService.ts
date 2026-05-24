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

const API_BASE = (import.meta as any).env.VITE_API_URL || '';

export async function generateAIContent(request: GeminiRequest): Promise<GeminiResponse> {
  try {
    const response = await fetch(`${API_BASE}/api/gemini`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error: any) {
    console.error('AI Service Error:', error);
    return {
      text: '',
      error: error.message || 'Failed to connect to AI service'
    };
  }
}
