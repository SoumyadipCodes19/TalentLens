import { generateWithGroq } from '../groq';
import { generateStructured } from '../gemini';
import { PROMPTS } from '../prompts';
import { ConversationSchema, type Conversation, type CandidateProfile, type ParsedJD, type MatchResult } from '../schemas';

export async function simulateOutreach(
  candidate: CandidateProfile,
  parsedJD: ParsedJD,
  matchResult: MatchResult,
  useGroq: boolean = true
): Promise<{ data: Conversation; thinking: string }> {
  const prompt = PROMPTS.outreachSimulator;
  const userPrompt = prompt.user(
    JSON.stringify(candidate, null, 2),
    JSON.stringify(parsedJD, null, 2),
    matchResult.matchExplanation
  );

  // Try Groq first for multi-model diversity, fall back to Gemini
  if (useGroq) {
    try {
      return await generateWithGroq(
        prompt.system,
        userPrompt,
        ConversationSchema
      );
    } catch (error) {
      console.warn('Groq failed, falling back to Gemini for outreach:', error);
    }
  }

  // Fallback to Gemini
  return generateStructured(
    prompt.system,
    userPrompt,
    ConversationSchema
  );
}

export async function simulateAllOutreach(
  candidates: CandidateProfile[],
  parsedJD: ParsedJD,
  matchResults: MatchResult[],
  onProgress?: (candidateId: string, index: number) => void
): Promise<{ data: Conversation[]; thinking: string }> {
  const conversations: Conversation[] = [];
  const thinkingParts: string[] = [];

  // Process in batches of 2 (Groq has lower rate limits)
  const batchSize = 2;
  for (let i = 0; i < candidates.length; i += batchSize) {
    const batch = candidates.slice(i, i + batchSize);
    const batchResults = await Promise.all(
      batch.map(async (candidate, batchIndex) => {
        const matchResult = matchResults.find(m => m.candidateId === candidate.id);
        if (!matchResult) throw new Error(`No match result for candidate ${candidate.id}`);
        onProgress?.(candidate.id, i + batchIndex);
        return simulateOutreach(candidate, parsedJD, matchResult);
      })
    );

    for (const result of batchResults) {
      conversations.push(result.data);
      thinkingParts.push(result.thinking);
    }

    // Delay between batches
    if (i + batchSize < candidates.length) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }

  return {
    data: conversations,
    thinking: thinkingParts.join('\n---\n'),
  };
}
