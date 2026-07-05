import { Router, Request, Response, NextFunction } from 'express';
import { prisma } from '../app';
import { authMiddleware, requireAdmin, AuthRequest } from '../middleware/auth';
import { ApiError } from '../middleware/errorHandler';
import { AdminDashboardStats, PaginationParams } from '../types';

const router = Router();

// All admin routes require authentication
router.use(authMiddleware);
router.use(requireAdmin);

/**
 * GET /admin/orders - List all orders with pagination and filtering
 */
router.get('/orders', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const {
      page = '1',
      limit = '20',
      status,
      sortBy = 'pickupDate',
      sortOrder = 'asc',
    } = req.query;

    const pageNum = Math.max(1, parseInt(page as string));
    const limitNum = Math.min(100, parseInt(limit as string));
    const skip = (pageNum - 1) * limitNum;

    const where: any = {};
    if (status) {
      where.status = status;
    }

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        include: {
          customer: true,
          size: true,
          flavor: true,
          filling: true,
        },
        orderBy: {
          [sortBy as string]: sortOrder,
        },
        skip,
        take: limitNum,
      }),
      prisma.order.count({ where }),
    ]);

    res.json({
      data: orders,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum),
      },
    });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /admin/orders/:id - Get order detail
 */
router.get('/orders/:id', async (req: AuthRequest, res: Response, next: NextFunction) => {
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

    res.json({ data: order });
  } catch (err) {
    next(err);
  }
});

/**
 * PATCH /admin/orders/:id/status - Update order status
 */
router.patch('/orders/:id/status', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;

    const validStatuses = ['draft', 'confirmed', 'paid', 'in_progress', 'ready', 'picked_up', 'cancelled'];

    if (!status || !validStatuses.includes(status)) {
      throw new ApiError(400, `Invalid status. Must be one of: ${validStatuses.join(', ')}`);
    }

    const order = await prisma.order.findUnique({
      where: { id },
    });

    if (!order) {
      throw new ApiError(404, 'Order not found');
    }

    const updatedOrder = await prisma.order.update({
      where: { id },
      data: {
        status,
        // TODO: Store notes in audit log
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
      message: 'Order status updated',
      data: updatedOrder,
    });
  } catch (err) {
    next(err);
  }
});

/**
 * PATCH /admin/orders/:id/payment-status - Update payment status
 */
router.patch('/orders/:id/payment-status', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { paymentStatus } = req.body;

    const validStatuses = ['unpaid', 'paid', 'refunded'];

    if (!paymentStatus || !validStatuses.includes(paymentStatus)) {
      throw new ApiError(400, `Invalid status. Must be one of: ${validStatuses.join(', ')}`);
    }

    const order = await prisma.order.findUnique({
      where: { id },
    });

    if (!order) {
      throw new ApiError(404, 'Order not found');
    }

    const updatedOrder = await prisma.order.update({
      where: { id },
      data: { paymentStatus },
      include: {
        customer: true,
      },
    });

    res.json({
      message: 'Payment status updated',
      data: updatedOrder,
    });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /admin/dashboard - Dashboard stats
 */
router.get('/dashboard', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const upcomingDate = new Date(today);
    upcomingDate.setDate(upcomingDate.getDate() + 7);

    const [totalOrders, totalRevenue, upcomingPickups, overduePayments, recentOrders] = await Promise.all([
      prisma.order.count(),
      prisma.order.aggregate({
        where: {
          status: {
            not: 'cancelled',
          },
        },
        _sum: {
          totalPrice: true,
        },
      }),
      prisma.order.count({
        where: {
          pickupDate: {
            gte: today,
            lte: upcomingDate,
          },
        },
      }),
      prisma.order.count({
        where: {
          paymentStatus: 'unpaid',
          paymentDueDate: {
            lt: today,
          },
        },
      }),
      prisma.order.findMany({
        where: {
          createdAt: {
            gte: new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000),
          },
        },
        orderBy: { createdAt: 'desc' },
        take: 10,
        include: {
          customer: true,
        },
      }),
    ]);

    const revenue = totalRevenue._sum.totalPrice || 0;

    const stats: AdminDashboardStats = {
      totalOrders,
      totalRevenue: Number(revenue),
      upcomingPickups,
      overduePayments,
      averageOrderValue: totalOrders > 0 ? Number(revenue) / totalOrders : 0,
    };

    res.json({
      data: stats,
      recentOrders,
    });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /admin/customers - List customers
 */
router.get('/customers', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { page = '1', limit = '20' } = req.query;

    const pageNum = Math.max(1, parseInt(page as string));
    const limitNum = Math.min(100, parseInt(limit as string));
    const skip = (pageNum - 1) * limitNum;

    const [customers, total] = await Promise.all([
      prisma.customer.findMany({
        include: {
          orders: {
            select: {
              id: true,
              totalPrice: true,
              createdAt: true,
            },
          },
        },
        skip,
        take: limitNum,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.customer.count(),
    ]);

    const customersWithStats = customers.map(customer => ({
      ...customer,
      orderCount: customer.orders.length,
      totalSpent: customer.orders.reduce((sum, order) => sum + Number(order.totalPrice), 0),
      lastOrderDate: customer.orders.length > 0
        ? customer.orders[0].createdAt
        : null,
    }));

    res.json({
      data: customersWithStats,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum),
      },
    });
  } catch (err) {
    next(err);
  }
});

export default router;
