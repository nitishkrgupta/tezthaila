import prisma from '../config/db.js';
import { sendSuccess, sendError } from '../utils/apiResponse.js';

export const getCategories = async (req, res, next) => {
  try {
    let categories = await prisma.category.findMany({
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

    // If categories table is completely empty, auto-seed
    if (categories.length === 0) {
      try {
        const { runSeed } = await import('../prisma/seed.js');
        await runSeed();
        categories = await prisma.category.findMany({
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
      } catch (seedErr) {
        console.error('Auto-seeding categories failed:', seedErr);
      }
    } else {
      // Check if subcategories are missing in existing categories
      const totalSubcats = await prisma.subcategory.count();
      if (totalSubcats === 0) {
        try {
          const { runSeed } = await import('../prisma/seed.js');
          await runSeed();
          categories = await prisma.category.findMany({
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
        } catch (subErr) {
          console.error('Subcategories auto-population failed:', subErr);
        }
      }
    }

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

export const createCategory = async (req, res, next) => {
  try {
    const { name, description, image } = req.body;
    if (!name || !name.trim()) {
      return sendError(res, 400, 'Category name is required.');
    }

    const slug = name.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    let existing = await prisma.category.findUnique({ where: { slug } });
    if (existing) {
      return sendSuccess(res, 200, 'Category already exists', existing);
    }

    const category = await prisma.category.create({
      data: {
        name: name.trim(),
        slug,
        description: description?.trim() || null,
        image: image?.trim() || null
      }
    });

    return sendSuccess(res, 201, 'Category created successfully', category);
  } catch (error) {
    next(error);
  }
};

export const createSubcategory = async (req, res, next) => {
  try {
    const { categoryId, name, description } = req.body;
    if (!categoryId) {
      return sendError(res, 400, 'Category ID is required.');
    }
    if (!name || !name.trim()) {
      return sendError(res, 400, 'Subcategory name is required.');
    }

    const slug = name.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const catId = parseInt(categoryId);

    let existing = await prisma.subcategory.findFirst({
      where: { categoryId: catId, slug }
    });
    if (existing) {
      return sendSuccess(res, 200, 'Subcategory already exists', existing);
    }

    const subcategory = await prisma.subcategory.create({
      data: {
        categoryId: catId,
        name: name.trim(),
        slug,
        description: description?.trim() || null
      }
    });

    return sendSuccess(res, 201, 'Subcategory created successfully', subcategory);
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
