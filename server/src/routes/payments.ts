import { Router, Request, Response } from 'express';
import { prisma } from '../app';
import { verifyItnSignature, validateWithPayfast } from '../services/paymentService';

const router = Router();

/**
 * POST /payments/payfast/notify - PayFast's server-to-server ITN webhook.
 * This is the authoritative source of payment status, not the browser
 * redirect to return_url (which can be interrupted or spoofed by the
 * customer). Always responds 200 so PayFast doesn't endlessly retry, even
 * on internal errors — failures are logged for manual follow-up instead.
 */
router.post('/payfast/notify', async (req: Request, res: Response) => {
  try {
    const data = req.body as Record<string, string>;
    console.log('[payfast] ITN received:', data.m_payment_id, data.payment_status);

    if (!verifyItnSignature(data)) {
      console.error('[payfast] ITN signature mismatch — rejecting', data.m_payment_id);
      return res.status(200).send('signature mismatch');
    }

    // Server-to-server confirmation with PayFast itself, guarding against
    // spoofed requests that happen to have a matching signature.
    const rawBody = Object.entries(data)
      .map(([key, value]) => `${key}=${encodeURIComponent(String(value))}`)
      .join('&');
    const isValid = await validateWithPayfast(rawBody);

    if (!isValid) {
      console.error('[payfast] ITN failed PayFast server validation', data.m_payment_id);
      return res.status(200).send('validation failed');
    }

    const order = await prisma.order.findUnique({
      where: { orderNumber: data.m_payment_id },
    });

    if (!order) {
      console.error('[payfast] ITN for unknown order', data.m_payment_id);
      return res.status(200).send('unknown order');
    }

    // Guard against a tampered amount_gross not matching what we billed.
    const paidAmount = Number(data.amount_gross);
    const expectedAmount = Number(order.totalPrice);
    if (Math.abs(paidAmount - expectedAmount) > 0.01) {
      console.error(
        `[payfast] ITN amount mismatch for ${order.orderNumber}: expected ${expectedAmount}, got ${paidAmount}`
      );
      return res.status(200).send('amount mismatch');
    }

    if (data.payment_status === 'COMPLETE') {
      await prisma.order.update({
        where: { id: order.id },
        data: {
          paymentStatus: 'paid',
          status: order.status === 'confirmed' ? 'paid' : order.status,
        },
      });
      console.log(`[payfast] Order ${order.orderNumber} marked paid`);
    }

    res.status(200).send('ok');
  } catch (err) {
    console.error('[payfast] ITN handler error:', err);
    // Still 200 — PayFast will retry on non-200, and this needs a human
    // to look at the logs rather than a flood of retries.
    res.status(200).send('error');
  }
});

export default router;
