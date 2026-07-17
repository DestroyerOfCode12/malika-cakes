/**
 * Google Places API (New) — address autocomplete + place details.
 * https://developers.google.com/maps/documentation/places/web-service
 *
 * Autocomplete requests within a session are free as long as they're
 * followed by exactly one Place Details call using the same session
 * token — that's why every call here takes a sessionToken (a UUID the
 * frontend generates once per "search session" and discards after the
 * customer picks a suggestion).
 */

const API_BASE = 'https://places.googleapis.com/v1';
const API_KEY = process.env.GOOGLE_PLACES_API_KEY || '';

// Bias results toward South Africa since that's the only place this
// business can actually deliver.
const REGION_CODE = 'za';

export const isGooglePlacesConfigured = () => Boolean(API_KEY);

export interface PlaceSuggestion {
  placeId: string;
  text: string;
}

export interface PlaceDetails {
  formattedAddress: string;
  latitude: number;
  longitude: number;
}

export const autocomplete = async (input: string, sessionToken: string): Promise<PlaceSuggestion[]> => {
  const response = await fetch(`${API_BASE}/places:autocomplete`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Goog-Api-Key': API_KEY,
    },
    body: JSON.stringify({
      input,
      sessionToken,
      regionCode: REGION_CODE,
    }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Google Places autocomplete error (${response.status}): ${text}`);
  }

  const data = (await response.json()) as {
    suggestions?: Array<{
      placePrediction?: { placeId: string; text: { text: string } };
    }>;
  };

  return (data.suggestions || [])
    .filter((s) => s.placePrediction)
    .map((s) => ({
      placeId: s.placePrediction!.placeId,
      text: s.placePrediction!.text.text,
    }));
};

export const getPlaceDetails = async (placeId: string, sessionToken: string): Promise<PlaceDetails> => {
  const response = await fetch(`${API_BASE}/places/${placeId}?sessionToken=${sessionToken}`, {
    headers: {
      'X-Goog-Api-Key': API_KEY,
      'X-Goog-FieldMask': 'formattedAddress,location',
    },
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Google Places details error (${response.status}): ${text}`);
  }

  const data = (await response.json()) as {
    formattedAddress: string;
    location: { latitude: number; longitude: number };
  };

  return {
    formattedAddress: data.formattedAddress,
    latitude: data.location.latitude,
    longitude: data.location.longitude,
  };
};
