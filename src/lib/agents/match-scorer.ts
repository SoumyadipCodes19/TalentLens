import { generateStructured } from '../gemini';
import { PROMPTS } from '../prompts';
import { MatchResultSchema, type MatchResult, type ParsedJD, type CandidateProfile, type SearchStrategy } from '../schemas';

export async function scoreCandidate(
  parsedJD: ParsedJD,
  candidate: CandidateProfile,
  strategy: SearchStrategy
): Promise<{ data: MatchResult; thinking: string }> {
  return generateStructured(
    PROMPTS.matchScorer.system,
    PROMPTS.matchScorer.user(
      JSON.stringify(parsedJD, null, 2),
      JSON.stringify(candidate, null, 2),
      JSON.stringify(strategy, null, 2)
    ),
    MatchResultSchema
  );
}

export async function scoreAllCandidates(
  parsedJD: ParsedJD,
  candidates: CandidateProfile[],
  strategy: SearchStrategy,
  onProgress?: (candidateId: string, index: number) => void
): Promise<{ data: MatchResult[]; thinking: string }> {
  const results: MatchResult[] = [];
  const thinkingParts: string[] = [];

  // Process in batches of 3 to respect rate limits
  const batchSize = 3;
  for (let i = 0; i < candidates.length; i += batchSize) {
    const batch = candidates.slice(i, i + batchSize);
    const batchResults = await Promise.all(
      batch.map(async (candidate, batchIndex) => {
        onProgress?.(candidate.id, i + batchIndex);
        return scoreCandidate(parsedJD, candidate, strategy);
      })
    );

    for (const result of batchResults) {
      results.push(result.data);
      thinkingParts.push(result.thinking);
    }

    // Small delay between batches for rate limiting
    if (i + batchSize < candidates.length) {
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  }

  return {
    data: results,
    thinking: thinkingParts.join('\n---\n'),
  };
}
