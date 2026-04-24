import { generateStructured } from '../gemini';
import { PROMPTS } from '../prompts';
import {
  SelfReflectionSchema,
  FinalRankingSchema,
  type SelfReflection,
  type FinalRanking,
  type CandidateProfile,
  type MatchResult,
  type InterestResult,
} from '../schemas';

export async function selfReflect(
  candidates: CandidateProfile[],
  matchResults: MatchResult[],
  interestResults: InterestResult[]
): Promise<{ data: SelfReflection; thinking: string }> {
  const allResults = {
    candidates: candidates.map(c => ({ id: c.id, name: c.name, role: c.currentRole, experience: c.experienceYears })),
    matchScores: matchResults.map(m => ({
      candidateId: m.candidateId,
      matchScore: m.overallMatchScore,
      strengths: m.strengths,
      gaps: m.gaps,
    })),
    interestScores: interestResults.map(i => ({
      candidateId: i.candidateId,
      interestScore: i.overallInterestScore,
      riskFactors: i.riskFactors,
    })),
  };

  return generateStructured(
    PROMPTS.selfReflector.system,
    PROMPTS.selfReflector.user(JSON.stringify(allResults, null, 2)),
    SelfReflectionSchema
  );
}

export async function generateFinalRanking(
  candidates: CandidateProfile[],
  matchResults: MatchResult[],
  interestResults: InterestResult[],
  selfReflection: SelfReflection
): Promise<{ data: FinalRanking; thinking: string }> {
  // Apply score adjustments from self-reflection
  const adjustedMatchResults = matchResults.map(m => {
    const adjustment = selfReflection.scoreAdjustments.find(a => a.candidateId === m.candidateId);
    return {
      ...m,
      overallMatchScore: adjustment ? adjustment.adjustedMatchScore : m.overallMatchScore,
    };
  });

  const adjustedInterestResults = interestResults.map(i => {
    const adjustment = selfReflection.scoreAdjustments.find(a => a.candidateId === i.candidateId);
    return {
      ...i,
      overallInterestScore: adjustment ? adjustment.adjustedInterestScore : i.overallInterestScore,
    };
  });

  const allData = {
    candidates: candidates.map(c => ({
      id: c.id,
      name: c.name,
      currentRole: c.currentRole,
      experienceYears: c.experienceYears,
    })),
    matchScores: adjustedMatchResults.map(m => ({
      candidateId: m.candidateId,
      matchScore: m.overallMatchScore,
      matchExplanation: m.matchExplanation,
    })),
    interestScores: adjustedInterestResults.map(i => ({
      candidateId: i.candidateId,
      interestScore: i.overallInterestScore,
      interestExplanation: i.interestExplanation,
    })),
    selfReflectionNotes: selfReflection.overallAssessment,
    biasCorrections: selfReflection.biasesDetected,
  };

  return generateStructured(
    PROMPTS.finalRanker.system,
    PROMPTS.finalRanker.user(JSON.stringify(allData, null, 2)),
    FinalRankingSchema
  );
}
