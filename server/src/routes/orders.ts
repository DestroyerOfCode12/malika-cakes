import { Router, Request, Response, NextFunction } from 'express';
import { prisma } from '../app';
import { ApiError } from '../middleware/errorHandler';
import { CreateOrderDTO, OrderResponse, UpdateOrderDTO } from '../types';
import {
  validateOrderCreation,
  validateLeadTime,
  calculatePaymentDueDate,
  calculateRefund,
} from '../utils/validation';
import { calculateOrderPrice, calculateToppersPrice, parsePickupTime, formatPickupTime } from '../utils/pricing';
import { emailService } from '../services/emailService';
import { serializeOrder } from '../utils/serialize';

const router = Router();

/**
 * Generate unique order number
 */
const generateOrderNumber = async (): Promise<string> => {
  const date = new Date();
  const dateStr = date.toISOString().split('T')[0].replace(/-/g, '');

  const lastOrder = await prisma.order.findFirst({
    where: {
      orderNumber: {
        startsWith: `ORD-${dateStr}`,
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  const nextNum = lastOrder
    ? parseInt(lastOrder.orderNumber.split('-')[2]) + 1
    : 1;

  return `ORD-${dateStr}-${String(nextNum).padStart(4, '0')}`;
};

/**
 * POST /orders - Create new order
 */
router.post('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const dto = req.body as CreateOrderDTO;

    // Validate request
    validateOrderCreation(dto);

    // Check that referenced catalog items exist
    const [size, flavor, filling] = await Promise.all([
      prisma.catalogSize.findUnique({ where: { id: dto.sizeId } }),
      prisma.catalogFlavor.findUnique({ where: { id: dto.flavorId } }),
      prisma.catalogFilling.findUnique({ where: { id: dto.fillingId } }),
    ]);

    if (!size || !flavor || !filling) {
      throw new ApiError(400, 'One or more catalog items not found');
    }

    // Get topper prices
    const toppers = await prisma.catalogTopper.findMany({
      where: {
        id: { in: dto.topperIds },
        isActive: true,
      },
    });

    if (toppers.length !== dto.topperIds.length) {
      throw new ApiError(400, 'One or more toppers not found or inactive');
    }

    // Calculate pricing
    const fillingPrice = Number(filling.priceAddon);
    const toppersPrice = calculateToppersPrice(toppers.map(t => Number(t.priceAddon)));
    const pricing = calculateOrderPrice(Number(size.basePrice), fillingPrice, toppersPrice);

    // Create or get customer
    let customer = await prisma.customer.findUnique({
      where: { email: dto.email },
    });

    if (!customer) {
      customer = await prisma.customer.create({
        data: {
          name: dto.customer.name,
          email: dto.email,
          phone: dto.phone,
        },
      });
    }

    // Generate order number
    const orderNumber = await generateOrderNumber();

    // Parse pickup date and time
    const pickupDate = new Date(dto.pickupDate);
    const pickupTime = dto.pickupTime || '12:00';
    const paymentDueDate = calculatePaymentDueDate(dto.pickupDate);

    // Create order
    const order = await prisma.order.create({
      data: {
        customerId: customer.id,
        orderNumber,
        sizeId: dto.sizeId,
        flavorId: dto.flavorId,
        fillingId: dto.fillingId,
        basePrice: pricing.basePrice,
        customizationTotal: pricing.fillingPrice + pricing.toppersPrice,
        tax: pricing.tax,
        totalPrice: pricing.total,
        pickupDate,
        pickupTime: parsePickupTime(pickupTime),
        paymentDueDate,
        allergiesRestrictions: dto.allergiesRestrictions,
        specialRequests: dto.specialRequests,
        recipientPhone: dto.phone,
        status: 'confirmed',
        paymentStatus: 'unpaid',
        // Create order customizations
        customizations: {
          create: toppers.map(topper => ({
            topperId: topper.id,
            priceAtTime: Number(topper.priceAddon),
            quantity: 1,
          })),
        },
      },
      include: {
        size: true,
        flavor: true,
        filling: true,
        customizations: {
          include: { topper: true },
        },
        customer: true,
      },
    });

    // Send confirmation email (non-blocking; failures are logged, not thrown)
    void emailService.sendOrderConfirmation({
      customerName: customer.name,
      customerEmail: customer.email || dto.email,
      orderNumber: order.orderNumber,
      sizeName: order.size.name,
      flavorName: order.flavor.name,
      fillingName: order.filling.name,
      topperNames: order.customizations.map((c) => c.topper.name),
      allergies: order.allergiesRestrictions,
      specialRequests: order.specialRequests,
      totalPrice: Number(order.totalPrice),
      pickupDate: order.pickupDate,
      pickupTime: formatPickupTime(order.pickupTime),
      paymentDueDate: order.paymentDueDate,
    });

    res.status(201).json({
      message: 'Order created successfully',
      data: serializeOrder(order),
    });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /orders/lookup - Customer order status lookup by order number + email
 * (Must be declared before /:id so "lookup" isn't matched as an id.)
 */
router.get('/lookup', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const orderNumber = String(req.query.orderNumber || '').trim();
    const email = String(req.query.email || '').trim().toLowerCase();

    if (!orderNumber || !email) {
      throw new ApiError(400, 'Order number and email are required');
    }

    const order = await prisma.order.findUnique({
      where: { orderNumber },
      include: {
        customer: true,
        size: true,
        flavor: true,
        filling: true,
        customizations: { include: { topper: true } },
      },
    });

    // Require the email to match so strangers can't look up arbitrary orders
    if (!order || (order.customer.email || '').toLowerCase() !== email) {
      throw new ApiError(404, 'No order found matching that order number and email');
    }

    res.json({ data: serializeOrder(order) });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /orders/:id - Fetch order by ID
 */
router.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        customer: true,
        size: true,
        flavor: true,
        filling: true,
        customizations: {
          include: { topper: true },
        },
      },
    });

    if (!order) {
      throw new ApiError(404, 'Order not found');
    }

    res.json({ data: serializeOrder(order) });
  } catch (err) {
    next(err);
  }
});

/**
 * PATCH /orders/:id - Update order
 */
router.patch('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const dto = req.body as UpdateOrderDTO;

    const existingOrder = await prisma.order.findUnique({
      where: { id },
    });

    if (!existingOrder) {
      throw new ApiError(404, 'Order not found');
    }

    // Only allow updates if order is in draft or confirmed status
    if (existingOrder.status !== 'draft' && existingOrder.status !== 'confirmed') {
      throw new ApiError(400, 'Order cannot be modified in current status');
    }

    // If updating pickup date, validate lead time
    if (dto.pickupDate && !validateLeadTime(dto.pickupDate)) {
      throw new ApiError(400, 'Pickup date must be at least 14 days from today');
    }

    // Prepare update data
    const updateData: any = {};

    if (dto.sizeId) updateData.sizeId = dto.sizeId;
    if (dto.flavorId) updateData.flavorId = dto.flavorId;
    if (dto.fillingId) updateData.fillingId = dto.fillingId;
    if (dto.pickupDate) {
      updateData.pickupDate = new Date(dto.pickupDate);
      updateData.paymentDueDate = calculatePaymentDueDate(dto.pickupDate);
    }
    if (dto.pickupTime) updateData.pickupTime = parsePickupTime(dto.pickupTime);
    if (dto.allergiesRestrictions !== undefined) updateData.allergiesRestrictions = dto.allergiesRestrictions;
    if (dto.specialRequests !== undefined) updateData.specialRequests = dto.specialRequests;

    // Recalculate pricing if customizations changed
    if (dto.sizeId || dto.fillingId || dto.topperIds) {
      const sizeId = dto.sizeId || existingOrder.sizeId;
      const fillingId = dto.fillingId || existingOrder.fillingId;
      const topperIds = dto.topperIds || [];

      const [size, filling, toppers] = await Promise.all([
        prisma.catalogSize.findUnique({ where: { id: sizeId } }),
        prisma.catalogFilling.findUnique({ where: { id: fillingId } }),
        prisma.catalogTopper.findMany({
          where: { id: { in: topperIds } },
        }),
      ]);

      if (!size || !filling) {
        throw new ApiError(400, 'Invalid catalog items');
      }

      const fillingPrice = Number(filling.priceAddon);
      const toppersPrice = calculateToppersPrice(toppers.map(t => Number(t.priceAddon)));
      const pricing = calculateOrderPrice(Number(size.basePrice), fillingPrice, toppersPrice);

      updateData.basePrice = pricing.basePrice;
      updateData.customizationTotal = pricing.fillingPrice + pricing.toppersPrice;
      updateData.tax = pricing.tax;
      updateData.totalPrice = pricing.total;

      // Update customizations if toppers changed
      if (dto.topperIds) {
        await prisma.orderCustomization.deleteMany({
          where: { orderId: id },
        });

        await prisma.orderCustomization.createMany({
          data: toppers.map(topper => ({
            orderId: id,
            topperId: topper.id,
            priceAtTime: Number(topper.priceAddon),
            quantity: 1,
          })),
        });
      }
    }

    const updatedOrder = await prisma.order.update({
      where: { id },
      data: updateData,
      include: {
        customer: true,
        size: true,
        flavor: true,
        filling: true,
        customizations: {
          include: { topper: true },
        },
      },
    });

    res.json({ data: serializeOrder(updatedOrder) });
  } catch (err) {
    next(err);
  }
});

/**
 * DELETE /orders/:id - Cancel order
 */
router.delete('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    const order = await prisma.order.findUnique({
      where: { id },
    });

    if (!order) {
      throw new ApiError(404, 'Order not found');
    }

    if (order.status === 'cancelled') {
      throw new ApiError(400, 'Order is already cancelled');
    }

    // Calculate refund
    const refund = calculateRefund(order.pickupDate, Number(order.totalPrice));

    // Update order status
    const updatedOrder = await prisma.order.update({
      where: { id },
      data: {
        status: 'cancelled',
        paymentStatus: refund.percentage > 0 ? 'refunded' : 'unpaid',
      },
      include: {
        customer: true,
        size: true,
        flavor: true,
        filling: true,
        customizations: {
          include: { topper: true },
        },
      },
    });

    res.json({
      data: serializeOrder(updatedOrder),
      refund: {
        amount: refund.amount,
        percentage: refund.percentage,
      },
    });
  } catch (err) {
    next(err);
  }
});

export default router;
