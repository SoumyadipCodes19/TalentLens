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
  const resultsResults = await Promise.all(
    candidates.map(async (candidate, index) => {
      onProgress?.(candidate.id, index);
      return scoreCandidate(parsedJD, candidate, strategy);
    })
  );

  const results = resultsResults.map(r => r.data);
  const thinkingParts = resultsResults.map(r => r.thinking);

  return {
    data: results,
    thinking: thinkingParts.join('\n---\n'),
  };
}
