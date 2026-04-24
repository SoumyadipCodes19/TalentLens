import { GoogleGenerativeAI, GenerativeModel } from '@google/generative-ai';
import { z } from 'zod';

let genAI: GoogleGenerativeAI | null = null;
let model: GenerativeModel | null = null;

function getModel(): GenerativeModel {
  if (!model) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) throw new Error('GEMINI_API_KEY is not set in environment variables');
    genAI = new GoogleGenerativeAI(apiKey);
    model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
  }
  return model;
}

export async function generateStructured<T>(
  systemPrompt: string,
  userPrompt: string,
  schema: z.ZodType<T>,
  maxRetries = 5
): Promise<{ data: T; thinking: string }> {
  const gemini = getModel();
  let lastError: Error | null = null;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const result = await gemini.generateContent({
        contents: [{ role: 'user', parts: [{ text: userPrompt }] }],
        systemInstruction: {
          role: 'system',
          parts: [{ text: systemPrompt + '\n\nYou MUST respond with valid JSON only. No markdown, no code fences, no explanation outside the JSON.' }],
        },
        generationConfig: {
          responseMimeType: 'application/json',
          temperature: 0.7,
        },
      });

      const response = result.response;
      const text = response.text();

      // Extract thinking from the model (if available in metadata)
      let thinking = '';
      try {
        const candidate = response.candidates?.[0];
        if (candidate?.content?.parts) {
          for (const part of candidate.content.parts) {
            const p = part as unknown as Record<string, unknown>;
            if (p.thought === true && typeof p.text === 'string') {
              thinking += p.text + '\n';
            }
          }
        }
      } catch {
        // Thinking extraction is best-effort
      }

      // Parse JSON
      const jsonText = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      const parsed = JSON.parse(jsonText);

      // Validate with Zod
      const validated = schema.parse(parsed);

      return { data: validated, thinking: thinking || 'Agent processed this step internally.' };
    } catch (error) {
      lastError = error as Error;
      if (attempt < maxRetries - 1) {
        // Exponential backoff with jitter
        const delay = Math.pow(2, attempt) * 2000 + Math.random() * 1000;
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }

  throw new Error(`Failed after ${maxRetries} attempts: ${lastError?.message}`);
}
