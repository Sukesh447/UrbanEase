import { IssueCategory, IssueSeverity } from '@/types/models';

export interface ClassificationResult {
  suggestedCategory: IssueCategory;
  estimatedSeverity: IssueSeverity;
  confidenceScore: number;
  reason: string;
}

const CATEGORY_KEYWORDS: Record<IssueCategory, { keywords: string[]; defaultSeverity: IssueSeverity }> = {
  pothole: {
    keywords: ['pothole', 'hole', 'crater', 'asphalt', 'road damage', 'tarmac', 'bump', 'crack', 'road broken'],
    defaultSeverity: 'high',
  },
  garbage: {
    keywords: ['garbage', 'trash', 'waste', 'dump', 'overflow', 'litter', 'smell', 'debris', 'plastic', 'refuse'],
    defaultSeverity: 'medium',
  },
  streetlight: {
    keywords: ['streetlight', 'light', 'dark', 'bulb', 'pole', 'lamp', 'flicker', 'blackout', 'night safety'],
    defaultSeverity: 'medium',
  },
  water: {
    keywords: ['water', 'pipe', 'leak', 'pipeline', 'burst', 'tap', 'contamination', 'drinking water', 'pressure'],
    defaultSeverity: 'critical',
  },
  drainage: {
    keywords: ['drain', 'drainage', 'sewage', 'gutter', 'clogged', 'smell', 'overflow', 'manhole', 'stagnant'],
    defaultSeverity: 'high',
  },
  encroachment: {
    keywords: ['encroach', 'footpath', 'hawker', 'illegal shop', 'blocked pavement', 'sidewalk'],
    defaultSeverity: 'low',
  },
  other: {
    keywords: ['fence', 'signboard', 'tree fallen', 'animal', 'public property'],
    defaultSeverity: 'low',
  },
};

/**
 * Intelligent client-side rule classifier for photo filenames and descriptive input
 */
export function classifyCivicIssue(inputText: string, photoFileName?: string): ClassificationResult {
  const combined = `${inputText} ${photoFileName || ''}`.toLowerCase();

  let bestCategory: IssueCategory = 'pothole';
  let bestScore = 0;
  let matchReason = 'Default fallback recommendation';
  let estimatedSeverity: IssueSeverity = 'medium';

  for (const [category, data] of Object.entries(CATEGORY_KEYWORDS) as [IssueCategory, typeof CATEGORY_KEYWORDS['pothole']][]) {
    let score = 0;
    for (const keyword of data.keywords) {
      if (combined.includes(keyword)) {
        score += keyword.length >= 6 ? 3 : 2;
      }
    }

    if (score > bestScore) {
      bestScore = score;
      bestCategory = category;
      estimatedSeverity = data.defaultSeverity;
      matchReason = `Identified keywords matching ${category} civic guidelines`;
    }
  }

  // Adjust severity based on critical phrases
  if (combined.includes('danger') || combined.includes('accident') || combined.includes('burst') || combined.includes('deep')) {
    estimatedSeverity = 'critical';
    matchReason += ' (Elevated to Critical based on road safety risk indicators)';
  }

  const confidence = bestScore > 0 ? Math.min(95, 65 + bestScore * 5) : 55;

  return {
    suggestedCategory: bestCategory,
    estimatedSeverity,
    confidenceScore: confidence,
    reason: matchReason,
  };
}
