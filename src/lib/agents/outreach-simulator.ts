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
  const resultsResults = await Promise.all(
    candidates.map(async (candidate, index) => {
      const matchResult = matchResults.find(m => m.candidateId === candidate.id);
      if (!matchResult) throw new Error(`No match result for candidate ${candidate.id}`);
      onProgress?.(candidate.id, index);
      return simulateOutreach(candidate, parsedJD, matchResult);
    })
  );

  const conversations = resultsResults.map(r => r.data);
  const thinkingParts = resultsResults.map(r => r.thinking);

  return {
    data: conversations,
    thinking: thinkingParts.join('\n---\n'),
  };
}
