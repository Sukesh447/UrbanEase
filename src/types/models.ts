export type IssueCategory = 'pothole' | 'garbage' | 'streetlight' | 'water' | 'drainage' | 'encroachment' | 'other';

export type IssueStatus = 'reported' | 'verified' | 'assigned' | 'in_progress' | 'resolved';

export type IssueSeverity = 'low' | 'medium' | 'high' | 'critical';

export interface TimelineEvent {
  status: IssueStatus;
  timestamp: string;
  officerName?: string;
  notes?: string;
  photoUrl?: string;
}

export interface CivicIssue {
  id: string;
  category: IssueCategory;
  title: string;
  description: string;
  photoUrl: string;
  beforePhotoUrl?: string;
  afterPhotoUrl?: string;
  location: {
    lat: number;
    lng: number;
    address: string;
    wardId: number;
    wardName: string;
  };
  severity: IssueSeverity;
  status: IssueStatus;
  reportedBy: {
    id: string;
    name: string;
    isAnonymous: boolean;
  };
  upvotes: number;
  upvotedByUserIds: string[];
  createdAt: string;
  updatedAt: string;
  slaHours: number;
  slaDeadline: string;
  priorityScore: number;
  timeline: TimelineEvent[];
  assignedOfficer?: {
    id: string;
    name: string;
    department: string;
    contact: string;
  };
  citizenFeedback?: {
    confirmedResolved: boolean;
    rating?: number;
    feedbackText?: string;
    submittedAt?: string;
  };
}

export interface UserProfile {
  id: string;
  name: string;
  role: 'citizen' | 'officer' | 'planner';
  department?: string;
  wardId?: number;
  greenScore: number;
  co2SavedKg: number;
  reportsCount: number;
  upvotesGiven: number;
  badges: string[];
}

export interface ParkingLot {
  id: string;
  name: string;
  nameTamil: string;
  address: string;
  lat: number;
  lng: number;
  totalSlots: number;
  availableSlots: number;
  pricePerHour: number;
  isCovered: boolean;
  hasEVCharging: boolean;
  evStationId?: string;
  slots: {
    slotNumber: string;
    type: 'standard' | 'ev' | 'disabled' | 'compact';
    isOccupied: boolean;
    floor: string;
  }[];
}

export type EVConnectorType = 'CCS2' | 'Type2' | 'CHAdeMO' | '3-pin';

export interface EVConnector {
  id: string;
  type: EVConnectorType;
  powerKw: number;
  status: 'available' | 'charging' | 'offline' | 'reserved';
  pricePerKwh: number;
}

export interface EVStation {
  id: string;
  name: string;
  nameTamil: string;
  address: string;
  lat: number;
  lng: number;
  operator: string;
  connectors: EVConnector[];
  estimatedWaitMins: number;
  rating: number;
}

export interface ParkingReservation {
  id: string;
  lotId: string;
  lotName: string;
  slotNumber: string;
  evStationId?: string;
  connectorType?: EVConnectorType;
  startTime: string;
  durationHours: number;
  totalCost: number;
  co2AvoidedKg: number;
  qrToken: string;
  status: 'active' | 'completed' | 'cancelled' | 'expired';
  createdAt: string;
}

export interface BusStop {
  id: string;
  name: string;
  nameTamil: string;
  lat: number;
  lng: number;
  sequence: number;
}

export interface BusRoute {
  id: string;
  routeNumber: string;
  routeName: string;
  routeNameTamil: string;
  origin: string;
  destination: string;
  stops: BusStop[];
  frequencyMins: number;
  polyline: [number, number][];
}

export interface LiveBus {
  id: string;
  routeId: string;
  routeNumber: string;
  busRegNumber: string;
  lat: number;
  lng: number;
  heading: number;
  speedKmH: number;
  crowdLevel: 'low' | 'moderate' | 'packed';
  nextStopId: string;
  etaNextStopMins: number;
  delayMins: number; // positive = late, negative = early
  crowdConfidenceContributors: number;
  lastUpdated: string;
}

export interface AppNotification {
  id: string;
  title: string;
  titleTamil: string;
  message: string;
  messageTamil: string;
  timestamp: string;
  read: boolean;
  type: 'issue_update' | 'parking_pass' | 'bus_alert' | 'green_badge' | 'sla_warning';
  linkTo?: string;
}
