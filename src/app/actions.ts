'use server';

import { runPipeline } from '@/lib/pipeline';
import type { PipelineResult, PipelineEvent, CandidateProfile } from '@/lib/schemas';

export interface PipelineResponse {
  success: boolean;
  result?: PipelineResult;
  error?: string;
  events: PipelineEvent[];
}

export async function executePipeline(
  jdText: string,
  importedCandidatesJson?: string
): Promise<PipelineResponse> {
  try {
    const events: PipelineEvent[] = [];

    let importedCandidates: CandidateProfile[] | null = null;
    if (importedCandidatesJson) {
      try {
        importedCandidates = JSON.parse(importedCandidatesJson);
      } catch {
        return {
          success: false,
          error: 'Failed to parse imported candidate data. Please check the format.',
          events: [],
        };
      }
    }

    const result = await runPipeline(
      jdText,
      importedCandidates,
      (event) => {
        events.push(event);
      }
    );

    return {
      success: true,
      result,
      events,
    };
  } catch (error) {
    console.error('Pipeline execution failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'An unexpected error occurred',
      events: [],
    };
  }
}
