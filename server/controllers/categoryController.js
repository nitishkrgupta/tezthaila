import prisma from '../config/db.js';
import { sendSuccess } from '../utils/apiResponse.js';

export const getCategories = async (req, res, next) => {
  try {
    const categories = await prisma.category.findMany({
      where: { isActive: true },
      include: {
        subcategories: {
          where: { isActive: true },
          orderBy: { id: 'asc' }
        },
        _count: {
          select: { products: true }
        }
      },
      orderBy: { id: 'asc' }
    });

    const formatted = categories.map((c) => ({
      ...c,
      productCount: c._count?.products || 0
    }));

    return sendSuccess(res, 200, 'Categories fetched successfully', formatted);
  } catch (error) {
    next(error);
  }
};

export const getSubcategories = async (req, res, next) => {
  try {
    const { categoryId } = req.params;
    const { categoryId: queryCatId } = req.query;
    const targetCatId = categoryId || queryCatId;

    const where = { isActive: true };
    if (targetCatId) {
      where.categoryId = parseInt(targetCatId);
    }

    const subcategories = await prisma.subcategory.findMany({
      where,
      orderBy: { id: 'asc' }
    });

    return sendSuccess(res, 200, 'Subcategories fetched successfully', subcategories);
  } catch (error) {
    next(error);
  }
};

export const getBrands = async (req, res, next) => {
  try {
    const brands = await prisma.brand.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' }
    });

    return sendSuccess(res, 200, 'Brands fetched successfully', brands);
  } catch (error) {
    next(error);
  }
};
