import { Router, Request, Response, NextFunction } from 'express';
import { prisma } from '../app';
import { ApiError } from '../middleware/errorHandler';

const router = Router();

/**
 * GET /catalog/sizes - List all active sizes
 */
router.get('/sizes', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const sizes = await prisma.catalogSize.findMany({
      where: { isActive: true },
      orderBy: { createdAt: 'asc' },
    });

    res.json({
      data: sizes,
      count: sizes.length,
    });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /catalog/flavors - List all active flavors
 */
router.get('/flavors', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const flavors = await prisma.catalogFlavor.findMany({
      where: { isActive: true },
      orderBy: { createdAt: 'asc' },
    });

    res.json({
      data: flavors,
      count: flavors.length,
    });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /catalog/fillings - List all active fillings
 */
router.get('/fillings', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const fillings = await prisma.catalogFilling.findMany({
      where: { isActive: true },
      orderBy: { createdAt: 'asc' },
    });

    res.json({
      data: fillings,
      count: fillings.length,
    });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /catalog/toppers - List all active toppers
 */
router.get('/toppers', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const toppers = await prisma.catalogTopper.findMany({
      where: { isActive: true },
      orderBy: { createdAt: 'asc' },
    });

    res.json({
      data: toppers,
      count: toppers.length,
    });
  } catch (err) {
    next(err);
  }
});

export default router;
