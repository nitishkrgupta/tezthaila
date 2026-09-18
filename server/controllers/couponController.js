import prisma from '../config/db.js';
import { sendSuccess, sendError } from '../utils/apiResponse.js';

export const validateCoupon = async (req, res, next) => {
  try {
    const { code, subtotal } = req.body;

    if (!code || !code.trim()) {
      return sendError(res, 400, 'Please enter a coupon code');
    }

    const orderSubtotal = parseFloat(subtotal) || 0;
    const cleanCode = code.trim().toUpperCase();

    const coupon = await prisma.coupon.findUnique({
      where: { code: cleanCode }
    });

    if (!coupon || !coupon.isActive) {
      return sendError(res, 400, 'Invalid or expired coupon code');
    }

    if (coupon.expiryDate && new Date(coupon.expiryDate) < new Date()) {
      return sendError(res, 400, 'This coupon has expired');
    }

    const minAmount = Number(coupon.minimumOrderAmount);
    if (orderSubtotal < minAmount) {
      return sendError(
        res,
        400,
        `Minimum order amount of ₹${minAmount} required for coupon ${cleanCode}`
      );
    }

    let discountAmount = 0;
    const couponVal = Number(coupon.value);
    const maxDiscount = coupon.maximumDiscount ? Number(coupon.maximumDiscount) : null;

    if (coupon.type === 'PERCENTAGE') {
      discountAmount = Math.round((orderSubtotal * couponVal) / 100);
      if (maxDiscount && discountAmount > maxDiscount) {
        discountAmount = maxDiscount;
      }
    } else {
      discountAmount = couponVal;
    }

    return sendSuccess(res, 200, `Coupon '${cleanCode}' applied successfully! Saved ₹${discountAmount}`, {
      coupon: {
        id: coupon.id,
        code: coupon.code,
        type: coupon.type,
        value: couponVal,
        discountAmount,
        minimumOrderAmount: minAmount,
        maximumDiscount: maxDiscount
      }
    });
  } catch (error) {
    next(error);
  }
};

export const listCoupons = async (req, res, next) => {
  try {
    const coupons = await prisma.coupon.findMany({
      where: { isActive: true },
      orderBy: { id: 'asc' }
    });

    const formatted = coupons.map((c) => ({
      id: c.id,
      code: c.code,
      type: c.type === 'PERCENTAGE' ? `${Number(c.value)}% OFF` : `₹${Number(c.value)} Flat`,
      min: `₹${Number(c.minimumOrderAmount)}`,
      max: c.maximumDiscount ? `₹${Number(c.maximumDiscount)}` : 'No Limit',
      status: c.isActive ? 'Active' : 'Inactive'
    }));

    return sendSuccess(res, 200, 'Coupons fetched successfully', formatted);
  } catch (error) {
    next(error);
  }
};

export const getAllCouponsAdmin = async (req, res, next) => {
  try {
    const coupons = await prisma.coupon.findMany({
      orderBy: { id: 'desc' }
    });

    const formatted = coupons.map((c) => ({
      id: c.id,
      code: c.code,
      type: c.type,
      displayType: c.type === 'PERCENTAGE' ? `${Number(c.value)}% OFF` : `₹${Number(c.value)} Flat`,
      value: Number(c.value),
      minimumOrderAmount: Number(c.minimumOrderAmount),
      maximumDiscount: c.maximumDiscount ? Number(c.maximumDiscount) : null,
      usageLimit: c.usageLimit,
      usedCount: c.usedCount,
      expiryDate: c.expiryDate,
      isActive: c.isActive,
      createdAt: c.createdAt
    }));

    return sendSuccess(res, 200, 'All coupons fetched for admin', formatted);
  } catch (error) {
    next(error);
  }
};

export const createCoupon = async (req, res, next) => {
  try {
    const { code, type = 'PERCENTAGE', value, minimumOrderAmount = 0, maximumDiscount, usageLimit = 100, expiryDate, isActive = true } = req.body;

    if (!code || value === undefined || value === null) {
      return sendError(res, 400, 'Coupon code and discount value are required.');
    }

    const cleanCode = code.trim().toUpperCase();

    const existing = await prisma.coupon.findUnique({
      where: { code: cleanCode }
    });

    if (existing) {
      return sendError(res, 409, `A coupon with code '${cleanCode}' already exists.`);
    }

    const coupon = await prisma.coupon.create({
      data: {
        code: cleanCode,
        type: type === 'FIXED' ? 'FIXED' : 'PERCENTAGE',
        value: parseFloat(value),
        minimumOrderAmount: parseFloat(minimumOrderAmount || 0),
        maximumDiscount: maximumDiscount ? parseFloat(maximumDiscount) : null,
        usageLimit: parseInt(usageLimit || 100),
        expiryDate: expiryDate ? new Date(expiryDate) : null,
        isActive: Boolean(isActive)
      }
    });

    return sendSuccess(res, 201, `Coupon '${cleanCode}' created successfully!`, coupon);
  } catch (error) {
    next(error);
  }
};

export const updateCoupon = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { code, type, value, minimumOrderAmount, maximumDiscount, usageLimit, expiryDate, isActive } = req.body;

    const couponId = parseInt(id);
    const existing = await prisma.coupon.findUnique({ where: { id: couponId } });
    if (!existing) {
      return sendError(res, 404, 'Coupon not found.');
    }

    let cleanCode = existing.code;
    if (code && code.trim()) {
      cleanCode = code.trim().toUpperCase();
      if (cleanCode !== existing.code) {
        const duplicate = await prisma.coupon.findUnique({ where: { code: cleanCode } });
        if (duplicate) {
          return sendError(res, 409, `Coupon code '${cleanCode}' is already in use.`);
        }
      }
    }

    const updated = await prisma.coupon.update({
      where: { id: couponId },
      data: {
        code: cleanCode,
        ...(type !== undefined && { type: type === 'FIXED' ? 'FIXED' : 'PERCENTAGE' }),
        ...(value !== undefined && { value: parseFloat(value) }),
        ...(minimumOrderAmount !== undefined && { minimumOrderAmount: parseFloat(minimumOrderAmount) }),
        ...(maximumDiscount !== undefined && { maximumDiscount: maximumDiscount ? parseFloat(maximumDiscount) : null }),
        ...(usageLimit !== undefined && { usageLimit: parseInt(usageLimit) }),
        ...(expiryDate !== undefined && { expiryDate: expiryDate ? new Date(expiryDate) : null }),
        ...(isActive !== undefined && { isActive: Boolean(isActive) })
      }
    });

    return sendSuccess(res, 200, `Coupon '${cleanCode}' updated successfully!`, updated);
  } catch (error) {
    next(error);
  }
};

export const deleteCoupon = async (req, res, next) => {
  try {
    const { id } = req.params;
    const couponId = parseInt(id);

    const existing = await prisma.coupon.findUnique({ where: { id: couponId } });
    if (!existing) {
      return sendError(res, 404, 'Coupon not found.');
    }

    await prisma.coupon.delete({ where: { id: couponId } });

    return sendSuccess(res, 200, `Coupon '${existing.code}' removed successfully!`);
  } catch (error) {
    next(error);
  }
};

