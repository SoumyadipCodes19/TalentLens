import { generateStructured } from '../gemini';
import { PROMPTS } from '../prompts';
import { CandidatePoolSchema, type CandidateProfile, type ParsedJD, type SearchStrategy } from '../schemas';

export async function discoverCandidates(
  parsedJD: ParsedJD,
  strategy: SearchStrategy,
  count: number = 12
): Promise<{ data: CandidateProfile[]; thinking: string }> {
  const result = await generateStructured(
    PROMPTS.candidateDiscovery.system,
    PROMPTS.candidateDiscovery.user(
      JSON.stringify(parsedJD, null, 2),
      JSON.stringify(strategy, null, 2),
      count
    ),
    CandidatePoolSchema
  );

  return {
    data: result.data.candidates,
    thinking: result.thinking + '\n\nGeneration Reasoning: ' + result.data.generationReasoning,
  };
}
