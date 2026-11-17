import { IssueCategory, IssueSeverity } from '@/types/models';

/**
 * Calculates Great-Circle distance between two coordinates in meters using Haversine formula
 */
export function calculateHaversineDistanceMeters(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371e3; // Earth radius in meters
  const phi1 = (lat1 * Math.PI) / 180;
  const phi2 = (lat2 * Math.PI) / 180;
  const deltaPhi = ((lat2 - lat1) * Math.PI) / 180;
  const deltaLambda = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
    Math.cos(phi1) * Math.cos(phi2) * Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

/**
 * Tokenizes text into lowercase normalized word stems/tokens
 */
export function tokenizeText(text: string): Set<string> {
  const stopWords = new Set([
    'a', 'an', 'the', 'in', 'on', 'at', 'near', 'by', 'of', 'for', 'is', 'it', 'to', 'and', 'or', 'very', 'big', 'there'
  ]);
  const tokens = text
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length > 2 && !stopWords.has(w));
  return new Set(tokens);
}

/**
 * Computes Jaccard similarity index between two texts (0.0 to 1.0)
 */
export function calculateJaccardSimilarity(textA: string, textB: string): number {
  const setA = tokenizeText(textA);
  const setB = tokenizeText(textB);

  if (setA.size === 0 && setB.size === 0) return 1.0;
  if (setA.size === 0 || setB.size === 0) return 0.0;

  let intersectionCount = 0;
  for (const item of setA) {
    if (setB.has(item)) intersectionCount++;
  }

  const unionCount = setA.size + setB.size - intersectionCount;
  return unionCount === 0 ? 0 : intersectionCount / unionCount;
}

/**
 * Evaluates duplicate match score between a new report and an existing report
 * Distance weight: 65% (within 50 meters), Text similarity: 35%
 */
export function evaluateDuplicateMatch(
  newReport: { category: IssueCategory; lat: number; lng: number; title: string; description: string },
  existingReport: { category: IssueCategory; lat: number; lng: number; title: string; description: string; status: string }
): { isDuplicate: boolean; confidencePercent: number; distanceMeters: number } {
  // If status is resolved or categories differ, not a duplicate
  if (existingReport.status === 'resolved' || newReport.category !== existingReport.category) {
    return { isDuplicate: false, confidencePercent: 0, distanceMeters: 999999 };
  }

  const distanceMeters = calculateHaversineDistanceMeters(
    newReport.lat,
    newReport.lng,
    existingReport.lat,
    existingReport.lng
  );

  const textA = `${newReport.title} ${newReport.description}`;
  const textB = `${existingReport.title} ${existingReport.description}`;
  const textSim = calculateJaccardSimilarity(textA, textB);

  // If within 50m, calculate blended confidence
  if (distanceMeters <= 50) {
    const geoScore = Math.max(0, (50 - distanceMeters) / 50); // 1.0 at 0m, 0.0 at 50m
    const combinedScore = geoScore * 0.65 + textSim * 0.35;
    const confidencePercent = Math.round(combinedScore * 100);

    return {
      isDuplicate: combinedScore >= 0.45 || distanceMeters <= 20,
      confidencePercent,
      distanceMeters: Math.round(distanceMeters),
    };
  }

  return {
    isDuplicate: false,
    confidencePercent: Math.round(textSim * 30),
    distanceMeters: Math.round(distanceMeters),
  };
}

/**
 * Calculates transparent civic priority score
 * Formula: f(upvotes, severity, age_hours, category_criticality, proximity_to_institutions)
 */
export function calculateCivicPriority(params: {
  upvotes: number;
  severity: IssueSeverity;
  category: IssueCategory;
  ageHours: number;
  nearSchoolOrHospital: boolean;
}): { score: number; explanation: string[] } {
  let score = 0;
  const breakdown: string[] = [];

  // 1. Severity weight (0 - 40 pts)
  const severityMap: Record<IssueSeverity, number> = {
    low: 10,
    medium: 20,
    high: 30,
    critical: 40,
  };
  const sevPoints = severityMap[params.severity] || 15;
  score += sevPoints;
  breakdown.push(`+${sevPoints}pts from severity (${params.severity})`);

  // 2. Upvote momentum (max 30 pts)
  const upvotePoints = Math.min(30, params.upvotes * 4);
  score += upvotePoints;
  if (upvotePoints > 0) {
    breakdown.push(`+${upvotePoints}pts from ${params.upvotes} community upvotes`);
  }

  // 3. Category base criticality (10 - 25 pts)
  const categoryCriticality: Record<IssueCategory, number> = {
    water: 25,
    drainage: 22,
    pothole: 20,
    streetlight: 18,
    garbage: 15,
    encroachment: 10,
    other: 10,
  };
  const catPoints = categoryCriticality[params.category] || 10;
  score += catPoints;
  breakdown.push(`+${catPoints}pts category criticality (${params.category})`);

  // 4. Aging / SLA urgency (max 20 pts)
  const agePoints = Math.min(20, Math.floor(params.ageHours / 6) * 2);
  score += agePoints;
  if (agePoints > 0) {
    breakdown.push(`+${agePoints}pts aged ${Math.round(params.ageHours)}h without resolution`);
  }

  // 5. Sensitive Zone multiplier (school/hospital zone)
  if (params.nearSchoolOrHospital) {
    score += 15;
    breakdown.push(`+15pts sensitive landmark / school / hospital zone bonus`);
  }

  return {
    score: Math.min(100, score),
    explanation: breakdown,
  };
}

/**
 * Standard SLA duration per category in hours
 */
export const CATEGORY_SLA_HOURS: Record<IssueCategory, number> = {
  water: 12,        // water pipe burst / contamination
  drainage: 24,     // sewage overflow
  pothole: 48,      // road repair
  streetlight: 24,  // dark street public safety
  garbage: 36,      // municipal waste clearance
  encroachment: 72, // zoning inspection
  other: 48,
};

/**
 * Computes remaining SLA and breach status
 */
export function computeSlaStatus(createdAtIso: string, slaHours: number) {
  const created = new Date(createdAtIso).getTime();
  const deadline = created + slaHours * 3600 * 1000;
  const now = Date.now();
  const diffMs = deadline - now;
  const isBreached = diffMs < 0;
  const absHours = Math.abs(diffMs) / (1000 * 60 * 60);

  return {
    isBreached,
    hoursRemaining: Math.max(0, Math.round(absHours * 10) / 10),
    hoursBreached: isBreached ? Math.round(absHours * 10) / 10 : 0,
    deadlineIso: new Date(deadline).toISOString(),
    percentTimeConsumed: Math.min(100, Math.round(((now - created) / (slaHours * 3600 * 1000)) * 100)),
  };
}
