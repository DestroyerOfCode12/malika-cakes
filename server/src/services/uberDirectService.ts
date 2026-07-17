/**
 * Uber Direct — delivery-as-a-service API (direct.uber.com), not to be
 * confused with the consumer "Uber Connect" feature. Requires a Uber
 * Direct business account (application + approval, no instant sandbox
 * like PayFast) to get a customer ID, client ID, and client secret.
 *
 * Flow: OAuth2 client-credentials token -> quote a delivery (price +
 * ETA) -> create the delivery once the order is ready -> Uber sends
 * webhook updates as the courier is assigned/picks up/drops off.
 */
import crypto from 'crypto';

const AUTH_URL = 'https://login.uber.com/oauth/v2/token';
const API_BASE = 'https://api.uber.com/v1';

const CUSTOMER_ID = process.env.UBER_DIRECT_CUSTOMER_ID || '';
const CLIENT_ID = process.env.UBER_DIRECT_CLIENT_ID || '';
const CLIENT_SECRET = process.env.UBER_DIRECT_CLIENT_SECRET || '';
const WEBHOOK_SECRET = process.env.UBER_DIRECT_WEBHOOK_SECRET || '';

const STORE_NAME = process.env.STORE_NAME || "Malika's Cake Boutique";
const STORE_ADDRESS = process.env.STORE_ADDRESS || '';
const STORE_PHONE = process.env.STORE_PHONE || '';
// Optional — if set, sent alongside STORE_ADDRESS so Uber doesn't have to
// geocode the store's own address independently either.
const STORE_LATITUDE = process.env.STORE_LATITUDE ? Number(process.env.STORE_LATITUDE) : undefined;
const STORE_LONGITUDE = process.env.STORE_LONGITUDE ? Number(process.env.STORE_LONGITUDE) : undefined;

export const isUberDirectConfigured = () =>
  Boolean(CUSTOMER_ID && CLIENT_ID && CLIENT_SECRET && STORE_ADDRESS && STORE_PHONE);

// Cache the OAuth token in memory between requests — it's valid ~30 days,
// re-fetching on every call would be wasteful and slower for customers.
let cachedToken: { value: string; expiresAt: number } | null = null;

const getAccessToken = async (): Promise<string> => {
  if (cachedToken && cachedToken.expiresAt > Date.now() + 60_000) {
    return cachedToken.value;
  }

  const response = await fetch(AUTH_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
      grant_type: 'client_credentials',
      scope: 'direct.organizations',
    }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Uber Direct auth failed (${response.status}): ${text}`);
  }

  const data = (await response.json()) as { access_token: string; expires_in: number };
  cachedToken = { value: data.access_token, expiresAt: Date.now() + data.expires_in * 1000 };
  return cachedToken.value;
};

const authedFetch = async (path: string, options: RequestInit = {}) => {
  const token = await getAccessToken();
  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      ...options.headers,
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Uber Direct API error (${response.status}) on ${path}: ${text}`);
  }

  return response.json();
};

interface DeliveryQuote {
  quoteId: string;
  feeRands: number;
  dropoffEta: string;
  expiresAt: string;
}

interface DropoffLocation {
  address: string;
  latitude?: number;
  longitude?: number;
}

/**
 * Get a delivery price + ETA quote for the store -> customer address.
 * Quotes expire (Uber typically gives ~30 min), so this is called live
 * as the customer enters their address, not cached long-term.
 *
 * When latitude/longitude are provided (from a Google Places selection),
 * they're sent alongside the address string — Uber uses them directly
 * rather than re-geocoding text it didn't resolve itself, which is more
 * reliable for addresses like apartment complexes and estates.
 */
export const getDeliveryQuote = async (dropoff: DropoffLocation): Promise<DeliveryQuote> => {
  const data = (await authedFetch(`/customers/${CUSTOMER_ID}/delivery_quotes`, {
    method: 'POST',
    body: JSON.stringify({
      pickup_address: STORE_ADDRESS,
      ...(STORE_LATITUDE !== undefined && { pickup_latitude: STORE_LATITUDE }),
      ...(STORE_LONGITUDE !== undefined && { pickup_longitude: STORE_LONGITUDE }),
      dropoff_address: dropoff.address,
      ...(dropoff.latitude !== undefined && { dropoff_latitude: dropoff.latitude }),
      ...(dropoff.longitude !== undefined && { dropoff_longitude: dropoff.longitude }),
    }),
  })) as { id: string; fee: number; dropoff_eta: string; expires: string };

  return {
    quoteId: data.id,
    feeRands: data.fee / 100, // Uber returns fee in cents
    dropoffEta: data.dropoff_eta,
    expiresAt: data.expires,
  };
};

interface CreateDeliveryParams {
  quoteId: string;
  orderNumber: string;
  dropoffAddress: string;
  dropoffName: string;
  dropoffPhone: string;
  itemName: string;
}

interface DeliveryResult {
  uberDeliveryId: string;
  status: string;
  trackingUrl: string;
}

/**
 * Dispatch a real courier. Called when an admin marks a delivery order
 * "ready" — this is the point money/commitment actually happens, so it
 * should never fire automatically on order creation.
 */
export const createDelivery = async (params: CreateDeliveryParams): Promise<DeliveryResult> => {
  const data = (await authedFetch(`/customers/${CUSTOMER_ID}/deliveries`, {
    method: 'POST',
    body: JSON.stringify({
      quote_id: params.quoteId,
      pickup_name: STORE_NAME,
      pickup_address: STORE_ADDRESS,
      pickup_phone_number: STORE_PHONE,
      dropoff_name: params.dropoffName,
      dropoff_address: params.dropoffAddress,
      dropoff_phone_number: params.dropoffPhone,
      manifest_items: [{ name: params.itemName, quantity: 1 }],
      external_id: params.orderNumber,
    }),
  })) as { id: string; status: string; tracking_url: string };

  return {
    uberDeliveryId: data.id,
    status: data.status,
    trackingUrl: data.tracking_url,
  };
};

/**
 * Verify Uber's webhook signature (HMAC-SHA256 over the raw body using
 * the webhook signing secret from the Uber Direct dashboard).
 */
export const verifyWebhookSignature = (rawBody: string, signature: string): boolean => {
  if (!WEBHOOK_SECRET) return false;
  const expected = crypto.createHmac('sha256', WEBHOOK_SECRET).update(rawBody).digest('hex');
  return expected === signature;
};
