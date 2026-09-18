import prisma from '../config/db.js';
import { sendSuccess, sendError } from '../utils/apiResponse.js';

export const getAddresses = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const addresses = await prisma.address.findMany({
      where: { userId },
      orderBy: [{ isDefault: 'desc' }, { id: 'desc' }]
    });

    return sendSuccess(res, 200, 'Addresses retrieved successfully', addresses);
  } catch (error) {
    next(error);
  }
};

export const createAddress = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const {
      fullName,
      phone,
      house,
      street,
      area,
      city,
      state,
      pincode,
      landmark,
      isDefault
    } = req.body;

    if (!fullName || !phone || !house || !city || !pincode) {
      return sendError(res, 400, 'Full name, phone, house/flat, city, and PIN code are required');
    }

    if (isDefault) {
      await prisma.address.updateMany({
        where: { userId },
        data: { isDefault: false }
      });
    }

    const count = await prisma.address.count({ where: { userId } });

    const newAddress = await prisma.address.create({
      data: {
        userId,
        fullName,
        phone,
        house,
        street: street || '',
        area: area || '',
        city,
        state: state || 'Karnataka',
        pincode,
        landmark: landmark || '',
        isDefault: count === 0 ? true : Boolean(isDefault)
      }
    });

    return sendSuccess(res, 201, 'Address saved successfully', newAddress);
  } catch (error) {
    next(error);
  }
};

export const deleteAddress = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const address = await prisma.address.findFirst({
      where: { id: parseInt(id), userId }
    });

    if (!address) {
      return sendError(res, 404, 'Address not found');
    }

    await prisma.address.delete({
      where: { id: address.id }
    });

    return sendSuccess(res, 200, 'Address deleted successfully');
  } catch (error) {
    next(error);
  }
};
