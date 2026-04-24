import type { CandidateProfile } from './schemas';
import Papa from 'papaparse';

interface CSVCandidate {
  name: string;
  current_role: string;
  company: string;
  experience_years: string;
  skills: string;
  education_degree?: string;
  education_field?: string;
  education_institution?: string;
  location: string;
  summary: string;
  achievements?: string;
  satisfaction?: string;
  salary_expectation?: string;
  notice_period?: string;
}

export function parseCSV(csvText: string): CandidateProfile[] {
  const result = Papa.parse<CSVCandidate>(csvText, {
    header: true,
    skipEmptyLines: true,
    transformHeader: (header) => header.trim().toLowerCase().replace(/\s+/g, '_'),
  });

  if (result.errors.length > 0) {
    console.warn('CSV parse warnings:', result.errors);
  }

  return result.data.map((row, index): CandidateProfile => ({
    id: `imported_${index + 1}`,
    name: row.name || `Candidate ${index + 1}`,
    currentRole: row.current_role || 'Not specified',
    currentCompany: row.company || 'Not specified',
    experienceYears: parseInt(row.experience_years) || 0,
    skills: (row.skills || '').split(';').map(skill => ({
      name: skill.trim(),
      proficiency: 'intermediate' as const,
      yearsUsed: 2,
    })),
    education: {
      degree: row.education_degree || 'Not specified',
      field: row.education_field || 'Not specified',
      institution: row.education_institution || 'Not specified',
    },
    location: row.location || 'Not specified',
    summary: row.summary || '',
    achievements: (row.achievements || '').split(';').filter(Boolean),
    currentSatisfaction: (row.satisfaction as CandidateProfile['currentSatisfaction']) || 'neutral',
    salaryExpectation: row.salary_expectation || 'Not specified',
    noticePeriod: row.notice_period || 'Not specified',
    personalityType: 'analytical' as const,
  }));
}

export function parseJSON(jsonText: string): CandidateProfile[] {
  const data = JSON.parse(jsonText);
  const candidates = Array.isArray(data) ? data : data.candidates || [];
  return candidates.map((c: Partial<CandidateProfile>, index: number): CandidateProfile => ({
    id: c.id || `imported_${index + 1}`,
    name: c.name || `Candidate ${index + 1}`,
    currentRole: c.currentRole || 'Not specified',
    currentCompany: c.currentCompany || 'Not specified',
    experienceYears: c.experienceYears || 0,
    skills: c.skills || [],
    education: c.education || { degree: 'Not specified', field: 'Not specified', institution: 'Not specified' },
    location: c.location || 'Not specified',
    summary: c.summary || '',
    achievements: c.achievements || [],
    currentSatisfaction: c.currentSatisfaction || 'neutral',
    salaryExpectation: c.salaryExpectation || 'Not specified',
    noticePeriod: c.noticePeriod || 'Not specified',
    personalityType: c.personalityType || 'analytical',
  }));
}
