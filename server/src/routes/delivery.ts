import { Router, Request, Response, NextFunction } from 'express';
import { prisma } from '../app';
import { ApiError } from '../middleware/errorHandler';
import { getDeliveryQuote, isUberDirectConfigured, verifyWebhookSignature } from '../services/uberDirectService';

const router = Router();

/**
 * POST /delivery/quote - Live price + ETA quote for a dropoff address.
 * Called as the customer types their delivery address in the order form,
 * same spirit as the real-time pricing for toppers/fillings.
 */
router.post('/quote', async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!isUberDirectConfigured()) {
      throw new ApiError(503, 'Delivery is not available yet — pickup only for now.');
    }

    const { address } = req.body as { address?: string };
    if (!address || address.trim().length < 5) {
      throw new ApiError(400, 'A valid delivery address is required');
    }

    const quote = await getDeliveryQuote(address.trim());
    res.json({ data: quote });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /delivery/uber-direct/webhook - Uber's delivery status updates
 * (courier assigned, picked up, dropped off, canceled). Always 200s so
 * Uber doesn't endlessly retry, even on internal errors — those get
 * logged for manual follow-up instead, same pattern as the PayFast ITN
 * handler.
 */
router.post('/uber-direct/webhook', async (req: Request, res: Response) => {
  try {
    const signature = req.headers['x-uber-signature'] as string | undefined;
    const rawBody = JSON.stringify(req.body);

    if (!signature || !verifyWebhookSignature(rawBody, signature)) {
      console.error('[uber-direct] webhook signature mismatch — rejecting');
      return res.status(200).send('signature mismatch');
    }

    const event = req.body as { kind?: string; data?: { id: string; status: string } };
    const deliveryId = event.data?.id;
    const status = event.data?.status;

    if (!deliveryId || !status) {
      console.error('[uber-direct] webhook missing delivery id/status');
      return res.status(200).send('missing fields');
    }

    const order = await prisma.order.findFirst({ where: { uberDeliveryId: deliveryId } });

    if (!order) {
      console.error('[uber-direct] webhook for unknown delivery', deliveryId);
      return res.status(200).send('unknown delivery');
    }

    await prisma.order.update({
      where: { id: order.id },
      data: {
        deliveryStatus: status,
        // "delivered" is Uber's terminal success status
        status: status === 'delivered' ? 'picked_up' : order.status,
      },
    });

    console.log(`[uber-direct] Order ${order.orderNumber} delivery status -> ${status}`);
    res.status(200).send('ok');
  } catch (err) {
    console.error('[uber-direct] webhook handler error:', err);
    res.status(200).send('error');
  }
});

export default router;
