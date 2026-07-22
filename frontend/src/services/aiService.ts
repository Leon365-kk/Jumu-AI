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
  errorType?: 'network_error' | 'timeout_error' | 'api_error' | 'server_error' | 'auth_error';
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
      let errorType = 'network_error';
      
      try {
        const errorData = await response.json();
        errorMessage = errorData?.error || errorMessage;
        
        // Determine error type based on message
        if (errorMessage.includes('timeout') || errorMessage.includes('timed out')) {
          errorType = 'timeout_error';
        } else if (errorMessage.includes('NVIDIA') || errorMessage.includes('API')) {
          errorType = 'api_error';
        } else if (response.status >= 500) {
          errorType = 'server_error';
        } else if (response.status === 401 || response.status === 403) {
          errorType = 'auth_error';
        }
      } catch {
        const textFallback = await response.text().catch(() => "");
        if (textFallback) errorMessage = textFallback;
      }
      
      throw new Error(JSON.stringify({ message: errorMessage, type: errorType }));
    }

    return await response.json();
  } catch (error: any) {
    console.error('AI Service Error:', { endpoint, error });
    
    // Parse structured error if available
    let errorMessage = error.message || 'Failed to connect to AI service';
    let errorType = 'network_error';
    
    try {
      const parsed = JSON.parse(error.message);
      errorMessage = parsed.message || errorMessage;
      errorType = parsed.type || errorType;
    } catch {
      // Not a structured error, use defaults
      if (error.message?.includes('fetch') || error.message?.includes('network')) {
        errorType = 'network_error';
      } else if (error.message?.includes('timeout')) {
        errorType = 'timeout_error';
      }
    }
    
    return {
      text: '',
      error: errorMessage,
      errorType: errorType as 'network_error' | 'timeout_error' | 'api_error' | 'server_error' | 'auth_error'
    };
  }
}
