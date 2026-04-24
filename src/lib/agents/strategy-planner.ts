import { generateStructured } from '../gemini';
import { PROMPTS } from '../prompts';
import { SearchStrategySchema, type SearchStrategy, type ParsedJD } from '../schemas';

export async function planSearchStrategy(parsedJD: ParsedJD): Promise<{ data: SearchStrategy; thinking: string }> {
  return generateStructured(
    PROMPTS.strategyPlanner.system,
    PROMPTS.strategyPlanner.user(JSON.stringify(parsedJD, null, 2)),
    SearchStrategySchema
  );
}
