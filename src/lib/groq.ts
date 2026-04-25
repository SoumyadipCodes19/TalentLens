import Groq from 'groq-sdk';
import { z } from 'zod';

let groqClient: Groq | null = null;

function getGroqClient(): Groq {
  if (!groqClient) {
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) throw new Error('GROQ_API_KEY is not set in environment variables');
    groqClient = new Groq({ apiKey });
  }
  return groqClient;
}

export async function generateWithGroq<T>(
  systemPrompt: string,
  userPrompt: string,
  schema: z.ZodType<T>,
  maxRetries = 3
): Promise<{ data: T; thinking: string }> {
  const client = getGroqClient();
  let lastError: Error | null = null;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const completion = await client.chat.completions.create({
        model: 'llama-3.1-8b-instant',
        messages: [
          {
            role: 'system',
            content: systemPrompt + '\n\nYou MUST respond with valid JSON only. No markdown code fences, no explanation outside the JSON object.',
          },
          {
            role: 'user',
            content: userPrompt,
          },
        ],
        response_format: { type: 'json_object' },
        temperature: 0.8,
        max_tokens: 4096,
      });

      const text = completion.choices[0]?.message?.content || '';
      const jsonText = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      const parsed = JSON.parse(jsonText);
      const validated = schema.parse(parsed);

      return {
        data: validated,
        thinking: 'Groq Llama 3.1 8B generated candidate conversation responses with a distinct voice.',
      };
    } catch (error) {
      lastError = error as Error;
      if (attempt < maxRetries - 1) {
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1500));
      }
    }
  }

  throw new Error(`Groq failed after ${maxRetries} attempts: ${lastError?.message}`);
}
