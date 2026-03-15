import { AISummary } from '../types';

const DEEPSEEK_API_KEY = process.env.EXPO_PUBLIC_DEEPSEEK_API_KEY;
const DEEPSEEK_BASE_URL = "https://api.deepseek.com";
const DEEPSEEK_URL = `${DEEPSEEK_BASE_URL}/chat/completions`;

// Helper utility for exponential backoff
const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const withRetry = async <T>(
  fn: () => Promise<T>,
  maxRetries: number = 5,
  baseDelayMs: number = 5000 // DeepSeek might be more stable, but keeping robust delay
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
        const jitter = Math.floor(Math.random() * 2000);
        const delay = (baseDelayMs * Math.pow(2, attempt - 1)) + jitter;

        console.warn(`[DeepSeek Service] Rate limit hit (429). Retrying in ${Math.round(delay / 1000)}s... (Attempt ${attempt}/${maxRetries})`);
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
    
    You must return a valid JSON object with this exact structure:
    {
      "meetingSummary": "string (concise 2-3 sentence summary)",
      "painPoints": ["string"],
      "actionItems": ["string"],
      "recommendedNextStep": "string"
    }`;

    const userPrompt = `Meeting Notes to analyze:
    ${rawNotes}`;

    const makeRequest = async () => {
      const response = await fetch(DEEPSEEK_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${DEEPSEEK_API_KEY}`
        },
        body: JSON.stringify({
          model: "deepseek-chat",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt }
          ],
          response_format: {
            type: "json_object"
          },
          temperature: 0.7,
          max_tokens: 1024
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
        console.error(`[DeepSeek Service] API Error ${response.status}:`, errorDetails);
        throw new Error(`API Error: ${response.status}`);
      }

      const data = await response.json();
      const text = data.choices?.[0]?.message?.content;

      if (!text) {
        throw new Error('No response from DeepSeek AI');
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
      return await withRetry(makeRequest, 5, 5000);
    } catch (error) {
      console.error('DeepSeek Summary Error:', error);
      throw error;
    }
  },
};

