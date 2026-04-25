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
  const resultsResults = await Promise.all(
    conversations.map(async (conversation, index) => {
      const candidate = candidates.find(c => c.id === conversation.candidateId);
      if (!candidate) throw new Error(`No candidate for conversation ${conversation.candidateId}`);
      onProgress?.(conversation.candidateId, index);
      return analyzeInterest(conversation, candidate);
    })
  );

  const results = resultsResults.map(r => r.data);
  const thinkingParts = resultsResults.map(r => r.thinking);

  return {
    data: results,
    thinking: thinkingParts.join('\n---\n'),
  };
}
