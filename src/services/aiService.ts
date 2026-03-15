import { AISummary } from '../types';

const GEMINI_API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY;
const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models";
const GEMINI_URL = `${GEMINI_API_URL}/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`;

// Helper utility for exponential backoff
const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const withRetry = async <T>(
  fn: () => Promise<T>,
  maxRetries: number = 5,
  baseDelayMs: number = 10000 // Reverting to longer 10s base delay for Gemini free tier
): Promise<T> => {
  let attempt = 0;
  while (attempt < maxRetries) {
    try {
      return await fn();
    } catch (error: any) {
      attempt++;
      const isRateLimit = error?.message?.includes('429');

      // If it's a 429 Rate Limit error, and we have retries left, wait and retry
      if (isRateLimit && attempt < maxRetries) {
        const jitter = Math.floor(Math.random() * 5000);
        const delay = (baseDelayMs * Math.pow(2, attempt - 1)) + jitter;

        console.warn(`[Gemini Service] Rate limit hit (429). Retrying in ${Math.round(delay / 1000)}s... (Attempt ${attempt}/${maxRetries})`);
        await sleep(delay);
        continue;
      }

      throw error;
    }
  }
  throw new Error('Maximum retries exceeded');
};

export const aiService = {
  async generateSummary(rawNotes: string): Promise<AISummary> {
    const systemPrompt = `You are an expert AI for sales representatives. Analyze the meeting notes and generate a structured JSON summary.
    
    You must return a JSON object with this exact structure:
    {
      "meetingSummary": "string (concise 2-3 sentence summary)",
      "painPoints": ["string"],
      "actionItems": ["string"],
      "recommendedNextStep": "string"
    }`;

    const userPrompt = `Meeting Notes to analyze:
    ${rawNotes}`;

    const makeRequest = async () => {
      const response = await fetch(GEMINI_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          systemInstruction: {
            parts: [{ text: systemPrompt }]
          },
          contents: [
            {
              role: 'user',
              parts: [{ text: userPrompt }],
            },
          ],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 1024,
            responseMimeType: "application/json",
          },
        }),
      });

      if (!response.ok) {
        let errorDetails = '';
        try {
          const errorData = await response.json();
          errorDetails = JSON.stringify(errorData);
        } catch (e) {
          errorDetails = await response.text();
        }
        console.error(`[Gemini Service] API Error ${response.status}:`, errorDetails);
        throw new Error(`API Error: ${response.status}`);
      }

      const data = await response.json();
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text;

      if (!text) {
        throw new Error('No response from AI');
      }

      const summary: AISummary = JSON.parse(text.trim());

      // Validate the response structure
      if (
        !summary.meetingSummary ||
        !Array.isArray(summary.painPoints) ||
        !Array.isArray(summary.actionItems) ||
        !summary.recommendedNextStep
      ) {
        throw new Error('Invalid AI response structure');
      }

      return summary;
    };

    try {
      return await withRetry(makeRequest, 5, 10000);
    } catch (error) {
      console.error('Gemini Summary Error:', error);
      throw error;
    }
  },
};

