import prisma from '../config/db.js';
import { sendSuccess, sendError } from '../utils/apiResponse.js';

export const getBanners = async (req, res, next) => {
  try {
    const banners = await prisma.banner.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' }
    });

    return sendSuccess(res, 200, 'Banners fetched successfully', banners);
  } catch (error) {
    next(error);
  }
};

export const getAllBannersAdmin = async (req, res, next) => {
  try {
    const banners = await prisma.banner.findMany({
      orderBy: { sortOrder: 'asc' }
    });

    return sendSuccess(res, 200, 'All banners fetched for admin', banners);
  } catch (error) {
    next(error);
  }
};

export const createBanner = async (req, res, next) => {
  try {
    const { title, subtitle, image, link = '/products', buttonText = 'Shop Now', badge, sortOrder = 0, isActive = true } = req.body;

    if (!title || !image) {
      return sendError(res, 400, 'Banner title and image are required.');
    }

    const banner = await prisma.banner.create({
      data: {
        title: title.trim(),
        subtitle: subtitle ? subtitle.trim() : null,
        image,
        link: link ? link.trim() : '/products',
        buttonText: buttonText ? buttonText.trim() : 'Shop Now',
        badge: badge ? badge.trim() : null,
        sortOrder: parseInt(sortOrder || 0),
        isActive: Boolean(isActive)
      }
    });

    return sendSuccess(res, 201, 'Banner created successfully!', banner);
  } catch (error) {
    next(error);
  }
};

export const updateBanner = async (req, res, next) => {
  try {
    const { id } = req.params;
    const bannerId = parseInt(id);

    const existing = await prisma.banner.findUnique({ where: { id: bannerId } });
    if (!existing) {
      return sendError(res, 404, 'Banner not found.');
    }

    const { title, subtitle, image, link, buttonText, badge, sortOrder, isActive } = req.body;

    const updated = await prisma.banner.update({
      where: { id: bannerId },
      data: {
        ...(title !== undefined && { title: title.trim() }),
        ...(subtitle !== undefined && { subtitle: subtitle ? subtitle.trim() : null }),
        ...(image !== undefined && { image }),
        ...(link !== undefined && { link: link ? link.trim() : '/products' }),
        ...(buttonText !== undefined && { buttonText: buttonText ? buttonText.trim() : 'Shop Now' }),
        ...(badge !== undefined && { badge: badge ? badge.trim() : null }),
        ...(sortOrder !== undefined && { sortOrder: parseInt(sortOrder) }),
        ...(isActive !== undefined && { isActive: Boolean(isActive) })
      }
    });

    return sendSuccess(res, 200, 'Banner updated successfully!', updated);
  } catch (error) {
    next(error);
  }
};

export const deleteBanner = async (req, res, next) => {
  try {
    const { id } = req.params;
    const bannerId = parseInt(id);

    const existing = await prisma.banner.findUnique({ where: { id: bannerId } });
    if (!existing) {
      return sendError(res, 404, 'Banner not found.');
    }

    await prisma.banner.delete({ where: { id: bannerId } });

    return sendSuccess(res, 200, 'Banner deleted successfully!');
  } catch (error) {
    next(error);
  }
};
