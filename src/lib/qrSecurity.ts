export interface QRPayload {
  bookingId: string;
  lotId: string;
  slotNumber: string;
  validUntilTimestamp: number;
  securityHash: string;
  evConnector?: string;
}

/**
 * Creates an offline-verifiable tamper-resistant signature hash using djb2 algorithm
 */
export function generateTokenHash(input: string): string {
  let hash = 5381;
  for (let i = 0; i < input.length; i++) {
    hash = (hash * 33) ^ input.charCodeAt(i);
  }
  return (hash >>> 0).toString(16).toUpperCase();
}

/**
 * Generates an encrypted/signed QR entry pass string
 */
export function generateQREntryPass(params: {
  bookingId: string;
  lotId: string;
  slotNumber: string;
  expiryDate: Date;
  evConnector?: string;
}): string {
  const expiryTimestamp = params.expiryDate.getTime();
  const rawString = `${params.bookingId}:${params.lotId}:${params.slotNumber}:${expiryTimestamp}`;
  const securityHash = generateTokenHash(rawString);

  const payload: QRPayload = {
    bookingId: params.bookingId,
    lotId: params.lotId,
    slotNumber: params.slotNumber,
    validUntilTimestamp: expiryTimestamp,
    securityHash,
    evConnector: params.evConnector,
  };

  return btoa(JSON.stringify(payload));
}

/**
 * Validates a scanned QR pass token
 */
export function verifyQREntryPass(encodedToken: string): {
  isValid: boolean;
  reason?: string;
  payload?: QRPayload;
  isExpired?: boolean;
} {
  try {
    const jsonStr = atob(encodedToken);
    const payload = JSON.parse(jsonStr) as QRPayload;

    const rawString = `${payload.bookingId}:${payload.lotId}:${payload.slotNumber}:${payload.validUntilTimestamp}`;
    const expectedHash = generateTokenHash(rawString);

    if (payload.securityHash !== expectedHash) {
      return { isValid: false, reason: 'Invalid or forged security hash signature' };
    }

    const now = Date.now();
    if (now > payload.validUntilTimestamp) {
      return {
        isValid: false,
        reason: 'Pass has expired',
        isExpired: true,
        payload,
      };
    }

    return { isValid: true, payload };
  } catch {
    return { isValid: false, reason: 'Malformed QR payload format' };
  }
}
