import { generateStructured } from '../gemini';
import { PROMPTS } from '../prompts';
import { InterestResultSchema, type InterestResult, type Conversation, type CandidateProfile } from '../schemas';

export async function analyzeInterest(
  conversation: Conversation,
  candidate: CandidateProfile
): Promise<{ data: InterestResult; thinking: string }> {
  return generateStructured(
    PROMPTS.interestScorer.system,
    PROMPTS.interestScorer.user(
      JSON.stringify(conversation, null, 2),
      JSON.stringify(candidate, null, 2)
    ),
    InterestResultSchema
  );
}

export async function analyzeAllInterest(
  conversations: Conversation[],
  candidates: CandidateProfile[],
  onProgress?: (candidateId: string, index: number) => void
): Promise<{ data: InterestResult[]; thinking: string }> {
  const results: InterestResult[] = [];
  const thinkingParts: string[] = [];

  const batchSize = 3;
  for (let i = 0; i < conversations.length; i += batchSize) {
    const batch = conversations.slice(i, i + batchSize);
    const batchResults = await Promise.all(
      batch.map(async (conversation, batchIndex) => {
        const candidate = candidates.find(c => c.id === conversation.candidateId);
        if (!candidate) throw new Error(`No candidate for conversation ${conversation.candidateId}`);
        onProgress?.(conversation.candidateId, i + batchIndex);
        return analyzeInterest(conversation, candidate);
      })
    );

    for (const result of batchResults) {
      results.push(result.data);
      thinkingParts.push(result.thinking);
    }

    if (i + batchSize < conversations.length) {
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  }

  return {
    data: results,
    thinking: thinkingParts.join('\n---\n'),
  };
}
