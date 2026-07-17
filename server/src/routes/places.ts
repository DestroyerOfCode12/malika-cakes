import { Router, Request, Response, NextFunction } from 'express';
import { ApiError } from '../middleware/errorHandler';
import { autocomplete, getPlaceDetails, isGooglePlacesConfigured } from '../services/placesService';

const router = Router();

/**
 * GET /places/autocomplete?input=...&sessionToken=...
 * Live address suggestions as the customer types.
 */
router.get('/autocomplete', async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!isGooglePlacesConfigured()) {
      throw new ApiError(503, 'Address lookup is not available right now.');
    }

    const input = String(req.query.input || '').trim();
    const sessionToken = String(req.query.sessionToken || '').trim();

    if (input.length < 3) {
      throw new ApiError(400, 'Please enter at least 3 characters');
    }
    if (!sessionToken) {
      throw new ApiError(400, 'Missing session token');
    }

    const suggestions = await autocomplete(input, sessionToken);
    res.json({ data: suggestions });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /places/details?placeId=...&sessionToken=...
 * Resolves a chosen suggestion to a formatted address + precise
 * coordinates. Closes out the session — same token as the autocomplete
 * calls that led here, so the whole search is billed as one session.
 */
router.get('/details', async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!isGooglePlacesConfigured()) {
      throw new ApiError(503, 'Address lookup is not available right now.');
    }

    const placeId = String(req.query.placeId || '').trim();
    const sessionToken = String(req.query.sessionToken || '').trim();

    if (!placeId || !sessionToken) {
      throw new ApiError(400, 'Missing placeId or session token');
    }

    const details = await getPlaceDetails(placeId, sessionToken);
    res.json({ data: details });
  } catch (err) {
    next(err);
  }
});

export default router;
