import { calculateHaversineDistanceMeters, tokenizeText, calculateJaccardSimilarity, evaluateDuplicateMatch, calculateCivicPriority, computeSlaStatus } from './algorithms';
import { generateQREntryPass, verifyQREntryPass } from './qrSecurity';
import { classifyCivicIssue } from './classifier';

export function runAllAlgorithmsVerification(): { total: number; passed: number; results: string[] } {
  const results: string[] = [];
  let passed = 0;
  let total = 0;

  function assert(condition: boolean, desc: string) {
    total++;
    if (condition) {
      passed++;
      results.push(`✔ PASS: ${desc}`);
    } else {
      results.push(`✖ FAIL: ${desc}`);
    }
  }

  // 1. Haversine Distance Test
  // Distance between Gandhipuram (11.0185, 76.9654) and nearby point (~35 meters away: 11.0187, 76.9656)
  const dist = calculateHaversineDistanceMeters(11.0185, 76.9654, 11.0187, 76.9656);
  assert(dist > 25 && dist < 45, `Haversine distance calculated accurately (${Math.round(dist)}m)`);

  // 2. Text Tokenizer & Jaccard Similarity Test
  const text1 = 'Dangerous deep crater pothole near signal';
  const text2 = 'Severe pothole crater around the signal';
  const jaccard = calculateJaccardSimilarity(text1, text2);
  assert(jaccard >= 0.4, `Jaccard similarity identifies overlapping keywords (${(jaccard * 100).toFixed(0)}%)`);

  // 3. Duplicate Detection Test (within 50m + matching category)
  const dupCheck = evaluateDuplicateMatch(
    { category: 'pothole', lat: 11.0185, lng: 76.9654, title: 'Deep crater pothole', description: 'Road broken' },
    { category: 'pothole', lat: 11.0186, lng: 76.9655, title: 'Severe crater pothole near signal', description: 'Two wheelers skid', status: 'reported' }
  );
  assert(dupCheck.isDuplicate === true && dupCheck.distanceMeters <= 50, `Duplicate detector correctly flagged nearby incident within 50m`);

  // Negative duplicate test (far away)
  const nonDupCheck = evaluateDuplicateMatch(
    { category: 'pothole', lat: 11.0185, lng: 76.9654, title: 'Pothole', description: 'damage' },
    { category: 'pothole', lat: 11.0950, lng: 76.9990, title: 'Pothole', description: 'damage', status: 'reported' }
  );
  assert(nonDupCheck.isDuplicate === false, `Distant incident (>50m) correctly avoided false duplicate match`);

  // 4. Civic Priority Scoring Test
  const priority = calculateCivicPriority({
    upvotes: 10,
    severity: 'critical',
    category: 'water',
    ageHours: 12,
    nearSchoolOrHospital: true,
  });
  assert(priority.score >= 80, `High severity + high upvotes yielded high priority (${priority.score}/100)`);

  // 5. SLA Math Test
  const tenHoursAgo = new Date(Date.now() - 10 * 3600 * 1000).toISOString();
  const slaActive = computeSlaStatus(tenHoursAgo, 24);
  assert(!slaActive.isBreached && slaActive.hoursRemaining > 12, `SLA active remaining countdown is correct`);

  const fortyHoursAgo = new Date(Date.now() - 40 * 3600 * 1000).toISOString();
  const slaBreached = computeSlaStatus(fortyHoursAgo, 24);
  assert(slaBreached.isBreached && slaBreached.hoursBreached > 15, `SLA breach detected accurately`);

  // 6. QR Entry Pass Cryptographic Verification
  const validUntil = new Date(Date.now() + 2 * 3600 * 1000);
  const passToken = generateQREntryPass({
    bookingId: 'BK-TEST-1',
    lotId: 'lot-gandhipuram',
    slotNumber: 'A-02',
    expiryDate: validUntil,
    evConnector: 'CCS2',
  });
  const verification = verifyQREntryPass(passToken);
  assert(verification.isValid === true && verification.payload?.slotNumber === 'A-02', `QR Token generation & signature validation verified`);

  // 7. Smart AI Rule Classifier
  const classification = classifyCivicIssue('Huge pile of garbage trash spilling onto pavement', 'trash_dump.jpg');
  assert(classification.suggestedCategory === 'garbage', `AI Smart Classifier correctly identified category: ${classification.suggestedCategory}`);

  return { total, passed, results };
}
