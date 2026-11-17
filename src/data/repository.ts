import {
  CivicIssue,
  ParkingLot,
  EVStation,
  BusRoute,
  LiveBus,
  UserProfile,
  ParkingReservation,
  AppNotification,
  IssueStatus,
} from '@/types/models';
import {
  SEED_CIVIC_ISSUES,
  SEED_PARKING_LOTS,
  SEED_EV_STATIONS,
  SEED_BUS_ROUTES,
  SEED_LIVE_BUSES,
  SEED_USERS,
} from './seedData';
import { evaluateDuplicateMatch, calculateCivicPriority, CATEGORY_SLA_HOURS } from '@/lib/algorithms';
import { generateQREntryPass } from '@/lib/qrSecurity';

const STORAGE_KEYS = {
  ISSUES: 'urbanease_issues_v2',
  PARKING: 'urbanease_parking_v2',
  EV: 'urbanease_ev_v2',
  BUS_ROUTES: 'urbanease_bus_routes_v2',
  LIVE_BUSES: 'urbanease_live_buses_v2',
  USERS: 'urbanease_users_v2',
  CURRENT_USER_ID: 'urbanease_current_user_v2',
  RESERVATIONS: 'urbanease_reservations_v2',
  NOTIFICATIONS: 'urbanease_notifications_v2',
  LANGUAGE: 'urbanease_lang_v1',
};

class LocalDataRepository {
  private getStorage<T>(key: string, fallback: T): T {
    try {
      const item = localStorage.getItem(key);
      if (!item) return fallback;
      return JSON.parse(item) as T;
    } catch {
      return fallback;
    }
  }

  private setStorage<T>(key: string, data: T): void {
    try {
      localStorage.setItem(key, JSON.stringify(data));
    } catch (e) {
      console.error(`Failed saving to localStorage for ${key}:`, e);
    }
  }

  constructor() {
    this.initializeIfEmpty();
  }

  public initializeIfEmpty(): void {
    if (!localStorage.getItem(STORAGE_KEYS.ISSUES)) {
      this.setStorage(STORAGE_KEYS.ISSUES, SEED_CIVIC_ISSUES);
    }
    if (!localStorage.getItem(STORAGE_KEYS.PARKING)) {
      this.setStorage(STORAGE_KEYS.PARKING, SEED_PARKING_LOTS);
    }
    if (!localStorage.getItem(STORAGE_KEYS.EV)) {
      this.setStorage(STORAGE_KEYS.EV, SEED_EV_STATIONS);
    }
    if (!localStorage.getItem(STORAGE_KEYS.BUS_ROUTES)) {
      this.setStorage(STORAGE_KEYS.BUS_ROUTES, SEED_BUS_ROUTES);
    }
    if (!localStorage.getItem(STORAGE_KEYS.LIVE_BUSES)) {
      this.setStorage(STORAGE_KEYS.LIVE_BUSES, SEED_LIVE_BUSES);
    }
    if (!localStorage.getItem(STORAGE_KEYS.USERS)) {
      this.setStorage(STORAGE_KEYS.USERS, SEED_USERS);
    }
    if (!localStorage.getItem(STORAGE_KEYS.CURRENT_USER_ID)) {
      this.setStorage(STORAGE_KEYS.CURRENT_USER_ID, 'user_priya');
    }
    if (!localStorage.getItem(STORAGE_KEYS.RESERVATIONS)) {
      const now = new Date();
      const expiry = new Date(now.getTime() + 2 * 3600 * 1000);
      const seedBooking: ParkingReservation = {
        id: 'res-priya-982',
        lotId: 'lot-gandhipuram-multilevel',
        lotName: 'Gandhipuram Smart Multi-Level Car Parking',
        slotNumber: 'A-01',
        evStationId: 'ev-gandhipuram-hub',
        connectorType: 'CCS2',
        startTime: now.toISOString(),
        durationHours: 2,
        totalCost: 110,
        co2AvoidedKg: 8.4,
        qrToken: generateQREntryPass({
          bookingId: 'res-priya-982',
          lotId: 'lot-gandhipuram-multilevel',
          slotNumber: 'A-01',
          expiryDate: expiry,
          evConnector: 'CCS2',
        }),
        status: 'active',
        createdAt: now.toISOString(),
      };
      this.setStorage(STORAGE_KEYS.RESERVATIONS, [seedBooking]);
    }
    if (!localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS)) {
      const initialNotes: AppNotification[] = [
        {
          id: 'notif-1',
          title: 'Streetlight Fixed!',
          titleTamil: 'தெருவிளக்கு சரிசெய்யப்பட்டது!',
          message: 'Ward 12 D.B. Road streetlights repaired by Mr. Rajan. Please verify resolution.',
          messageTamil: 'வார்டு 12 டி.பி. சாலை தெருவிளக்குகள் சரிசெய்யப்பட்டன. உறுதிப்படுத்தவும்.',
          timestamp: new Date(Date.now() - 3600 * 1000).toISOString(),
          read: false,
          type: 'issue_update',
          linkTo: '/issues/issue-103',
        },
        {
          id: 'notif-2',
          title: 'QR Entry Pass Active',
          titleTamil: 'நுழைவு சீட்டு தயார்',
          message: 'Slot A-01 reserved at Gandhipuram Multi-Level with CCS2 fast charger.',
          messageTamil: 'காந்திபுரம் அடுக்கு பார்க்கிங்கில் A-01 இடம் பதிவு செய்யப்பட்டுள்ளது.',
          timestamp: new Date(Date.now() - 7200 * 1000).toISOString(),
          read: true,
          type: 'parking_pass',
          linkTo: '/park',
        },
      ];
      this.setStorage(STORAGE_KEYS.NOTIFICATIONS, initialNotes);
    }
  }

  public resetAllToSeed(): void {
    localStorage.clear();
    this.initializeIfEmpty();
  }

  // --- ISSUES REPOSITORY ---
  public getIssues(): CivicIssue[] {
    return this.getStorage<CivicIssue[]>(STORAGE_KEYS.ISSUES, SEED_CIVIC_ISSUES);
  }

  public getIssueById(id: string): CivicIssue | undefined {
    return this.getIssues().find((i) => i.id === id);
  }

  public findPotentialDuplicates(report: {
    category: CivicIssue['category'];
    lat: number;
    lng: number;
    title: string;
    description: string;
  }): { issue: CivicIssue; distanceMeters: number; confidencePercent: number }[] {
    const all = this.getIssues().filter((i) => i.status !== 'resolved');
    const matches: { issue: CivicIssue; distanceMeters: number; confidencePercent: number }[] = [];

    for (const existing of all) {
      const match = evaluateDuplicateMatch(report, {
        category: existing.category,
        lat: existing.location.lat,
        lng: existing.location.lng,
        title: existing.title,
        description: existing.description,
        status: existing.status,
      });
      if (match.isDuplicate) {
        matches.push({
          issue: existing,
          distanceMeters: match.distanceMeters,
          confidencePercent: match.confidencePercent,
        });
      }
    }

    return matches.sort((a, b) => b.confidencePercent - a.confidencePercent);
  }

  public createIssue(issueData: Omit<CivicIssue, 'id' | 'createdAt' | 'updatedAt' | 'priorityScore' | 'upvotes' | 'upvotedByUserIds' | 'timeline' | 'slaDeadline' | 'slaHours'>): CivicIssue {
    const issues = this.getIssues();
    const slaHours = CATEGORY_SLA_HOURS[issueData.category] || 48;
    const nowIso = new Date().toISOString();
    const deadlineIso = new Date(Date.now() + slaHours * 3600 * 1000).toISOString();

    const priorityInfo = calculateCivicPriority({
      upvotes: 1,
      severity: issueData.severity,
      category: issueData.category,
      ageHours: 0,
      nearSchoolOrHospital: issueData.location.wardId === 24 || issueData.location.wardId === 37,
    });

    const newIssue: CivicIssue = {
      ...issueData,
      id: `issue-${Date.now().toString().slice(-6)}`,
      createdAt: nowIso,
      updatedAt: nowIso,
      slaHours,
      slaDeadline: deadlineIso,
      upvotes: 1,
      upvotedByUserIds: [issueData.reportedBy.id],
      priorityScore: priorityInfo.score,
      timeline: [
        {
          status: 'reported',
          timestamp: nowIso,
          notes: 'Submitted via UrbanEase Citizen Portal with GPS Geotag',
        },
      ],
    };

    issues.unshift(newIssue);
    this.setStorage(STORAGE_KEYS.ISSUES, issues);

    // Update user stats
    this.incrementUserReports(issueData.reportedBy.id);

    return newIssue;
  }

  public upvoteIssue(issueId: string, userId: string): { success: boolean; newCount: number } {
    const issues = this.getIssues();
    const index = issues.findIndex((i) => i.id === issueId);
    if (index === -1) return { success: false, newCount: 0 };

    const issue = issues[index];
    if (issue.upvotedByUserIds.includes(userId)) {
      issue.upvotedByUserIds = issue.upvotedByUserIds.filter((id) => id !== userId);
      issue.upvotes = Math.max(0, issue.upvotes - 1);
    } else {
      issue.upvotedByUserIds.push(userId);
      issue.upvotes += 1;
      this.incrementUserUpvotes(userId);
    }

    const ageHours = (Date.now() - new Date(issue.createdAt).getTime()) / (3600 * 1000);
    const priority = calculateCivicPriority({
      upvotes: issue.upvotes,
      severity: issue.severity,
      category: issue.category,
      ageHours,
      nearSchoolOrHospital: issue.location.wardId === 24 || issue.location.wardId === 37,
    });
    issue.priorityScore = priority.score;
    issue.updatedAt = new Date().toISOString();

    issues[index] = issue;
    this.setStorage(STORAGE_KEYS.ISSUES, issues);

    return { success: true, newCount: issue.upvotes };
  }

  public updateIssueStatus(
    issueId: string,
    status: IssueStatus,
    officerName: string,
    notes?: string,
    photoUrl?: string
  ): CivicIssue | null {
    const issues = this.getIssues();
    const index = issues.findIndex((i) => i.id === issueId);
    if (index === -1) return null;

    const issue = issues[index];
    issue.status = status;
    issue.updatedAt = new Date().toISOString();
    if (photoUrl) {
      issue.afterPhotoUrl = photoUrl;
    }

    issue.timeline.push({
      status,
      timestamp: issue.updatedAt,
      officerName,
      notes,
      photoUrl,
    });

    issues[index] = issue;
    this.setStorage(STORAGE_KEYS.ISSUES, issues);

    this.addNotification({
      title: `Issue ${status.replace('_', ' ').toUpperCase()}`,
      titleTamil: `கோரிக்கை நிலை: ${status}`,
      message: `Your report "${issue.title.slice(0, 35)}..." updated to ${status}.`,
      messageTamil: `உங்கள் புகார் நிலை மாற்றப்பட்டுள்ளது: ${status}.`,
      type: 'issue_update',
      linkTo: `/issues/${issue.id}`,
    });

    return issue;
  }

  public confirmCitizenResolution(
    issueId: string,
    confirmedResolved: boolean,
    rating?: number,
    feedbackText?: string
  ): CivicIssue | null {
    const issues = this.getIssues();
    const index = issues.findIndex((i) => i.id === issueId);
    if (index === -1) return null;

    const issue = issues[index];
    issue.citizenFeedback = {
      confirmedResolved,
      rating,
      feedbackText,
      submittedAt: new Date().toISOString(),
    };

    if (!confirmedResolved) {
      issue.status = 'in_progress';
      issue.timeline.push({
        status: 'in_progress',
        timestamp: new Date().toISOString(),
        notes: `Citizen re-opened report: ${feedbackText || 'Issue not resolved on ground.'}`,
      });
    }

    issues[index] = issue;
    this.setStorage(STORAGE_KEYS.ISSUES, issues);
    return issue;
  }

  // --- PARKING & EV ---
  public getParkingLots(): ParkingLot[] {
    return this.getStorage<ParkingLot[]>(STORAGE_KEYS.PARKING, SEED_PARKING_LOTS);
  }

  public getEVStations(): EVStation[] {
    return this.getStorage<EVStation[]>(STORAGE_KEYS.EV, SEED_EV_STATIONS);
  }

  public updateEVConnectorStatus(
    stationId: string,
    connectorId: string,
    status: 'available' | 'charging' | 'offline' | 'reserved'
  ): boolean {
    const stations = this.getEVStations();
    const station = stations.find((s) => s.id === stationId);
    if (!station) return false;

    const connector = station.connectors.find((c) => c.id === connectorId);
    if (!connector) return false;

    connector.status = status;
    this.setStorage(STORAGE_KEYS.EV, stations);
    return true;
  }

  public getReservations(): ParkingReservation[] {
    return this.getStorage<ParkingReservation[]>(STORAGE_KEYS.RESERVATIONS, []);
  }

  public createReservation(params: {
    lotId: string;
    lotName: string;
    slotNumber: string;
    durationHours: number;
    evStationId?: string;
    connectorType?: any;
    pricePerHour: number;
  }): ParkingReservation {
    const reservations = this.getReservations();
    const now = new Date();
    const expiry = new Date(now.getTime() + params.durationHours * 3600 * 1000);
    const bookingId = `BK-${Date.now().toString().slice(-6)}`;

    const totalCost = params.durationHours * params.pricePerHour + (params.connectorType ? 80 : 0);
    const co2AvoidedKg = params.connectorType ? 12.5 : 3.8;

    const qrToken = generateQREntryPass({
      bookingId,
      lotId: params.lotId,
      slotNumber: params.slotNumber,
      expiryDate: expiry,
      evConnector: params.connectorType,
    });

    const newRes: ParkingReservation = {
      id: bookingId,
      lotId: params.lotId,
      lotName: params.lotName,
      slotNumber: params.slotNumber,
      evStationId: params.evStationId,
      connectorType: params.connectorType,
      startTime: now.toISOString(),
      durationHours: params.durationHours,
      totalCost,
      co2AvoidedKg,
      qrToken,
      status: 'active',
      createdAt: now.toISOString(),
    };

    reservations.unshift(newRes);
    this.setStorage(STORAGE_KEYS.RESERVATIONS, reservations);

    // Update lot availability
    const lots = this.getParkingLots();
    const lotIndex = lots.findIndex((l) => l.id === params.lotId);
    if (lotIndex !== -1) {
      lots[lotIndex].availableSlots = Math.max(0, lots[lotIndex].availableSlots - 1);
      const slot = lots[lotIndex].slots.find((s) => s.slotNumber === params.slotNumber);
      if (slot) slot.isOccupied = true;
      this.setStorage(STORAGE_KEYS.PARKING, lots);
    }

    // Award green score
    this.addGreenScoreToCurrentUser(30, co2AvoidedKg);

    return newRes;
  }

  public cancelReservation(bookingId: string): boolean {
    const reservations = this.getReservations();
    const res = reservations.find((r) => r.id === bookingId);
    if (!res) return false;

    res.status = 'cancelled';
    this.setStorage(STORAGE_KEYS.RESERVATIONS, reservations);

    // Restore lot slot
    const lots = this.getParkingLots();
    const lot = lots.find((l) => l.id === res.lotId);
    if (lot) {
      lot.availableSlots = Math.min(lot.totalSlots, lot.availableSlots + 1);
      const slot = lot.slots.find((s) => s.slotNumber === res.slotNumber);
      if (slot) slot.isOccupied = false;
      this.setStorage(STORAGE_KEYS.PARKING, lots);
    }

    return true;
  }

  // --- BUS TRACKING ---
  public getBusRoutes(): BusRoute[] {
    return this.getStorage<BusRoute[]>(STORAGE_KEYS.BUS_ROUTES, SEED_BUS_ROUTES);
  }

  public getLiveBuses(): LiveBus[] {
    return this.getStorage<LiveBus[]>(STORAGE_KEYS.LIVE_BUSES, SEED_LIVE_BUSES);
  }

  public updateBusDelay(busId: string, additionalDelayMins: number, reportCrowdLevel?: LiveBus['crowdLevel']): LiveBus | null {
    const buses = this.getLiveBuses();
    const bus = buses.find((b) => b.id === busId);
    if (!bus) return null;

    bus.delayMins += additionalDelayMins;
    if (reportCrowdLevel) bus.crowdLevel = reportCrowdLevel;
    bus.crowdConfidenceContributors += 1;
    bus.lastUpdated = new Date().toISOString();

    this.setStorage(STORAGE_KEYS.LIVE_BUSES, buses);
    return bus;
  }

  // --- USERS & NOTIFICATIONS ---
  public getUsers(): UserProfile[] {
    return this.getStorage<UserProfile[]>(STORAGE_KEYS.USERS, SEED_USERS);
  }

  public getCurrentUser(): UserProfile {
    const currentId = this.getStorage<string>(STORAGE_KEYS.CURRENT_USER_ID, 'user_priya');
    const users = this.getUsers();
    return users.find((u) => u.id === currentId) || users[0];
  }

  public setCurrentUserId(userId: string): void {
    this.setStorage(STORAGE_KEYS.CURRENT_USER_ID, userId);
  }

  private incrementUserReports(userId: string): void {
    const users = this.getUsers();
    const user = users.find((u) => u.id === userId);
    if (user) {
      user.reportsCount += 1;
      user.greenScore += 25;
      user.co2SavedKg += 2.0;
      this.setStorage(STORAGE_KEYS.USERS, users);
    }
  }

  private incrementUserUpvotes(userId: string): void {
    const users = this.getUsers();
    const user = users.find((u) => u.id === userId);
    if (user) {
      user.upvotesGiven += 1;
      user.greenScore += 5;
      this.setStorage(STORAGE_KEYS.USERS, users);
    }
  }

  private addGreenScoreToCurrentUser(points: number, co2Kg: number): void {
    const user = this.getCurrentUser();
    const users = this.getUsers();
    const target = users.find((u) => u.id === user.id);
    if (target) {
      target.greenScore += points;
      target.co2SavedKg += co2Kg;
      this.setStorage(STORAGE_KEYS.USERS, users);
    }
  }

  public getNotifications(): AppNotification[] {
    return this.getStorage<AppNotification[]>(STORAGE_KEYS.NOTIFICATIONS, []);
  }

  public addNotification(note: Omit<AppNotification, 'id' | 'timestamp' | 'read'>): AppNotification {
    const notes = this.getNotifications();
    const newNote: AppNotification = {
      ...note,
      id: `notif-${Date.now()}`,
      timestamp: new Date().toISOString(),
      read: false,
    };
    notes.unshift(newNote);
    this.setStorage(STORAGE_KEYS.NOTIFICATIONS, notes);
    return newNote;
  }

  public markNotificationAsRead(id: string): void {
    const notes = this.getNotifications();
    const target = notes.find((n) => n.id === id);
    if (target) {
      target.read = true;
      this.setStorage(STORAGE_KEYS.NOTIFICATIONS, notes);
    }
  }
}

export const repository = new LocalDataRepository();
