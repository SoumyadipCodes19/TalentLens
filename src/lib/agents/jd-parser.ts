import { generateStructured } from '../gemini';
import { PROMPTS } from '../prompts';
import { ParsedJDSchema, type ParsedJD } from '../schemas';

export async function parseJobDescription(jdText: string): Promise<{ data: ParsedJD; thinking: string }> {
  return generateStructured(
    PROMPTS.jdParser.system,
    PROMPTS.jdParser.user(jdText),
    ParsedJDSchema
  );
}
