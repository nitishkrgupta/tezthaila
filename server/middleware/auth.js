import jwt from 'jsonwebtoken';
import prisma from '../config/db.js';
import { sendError } from '../utils/apiResponse.js';

export const authenticateUser = async (req, res, next) => {
  try {
    let token = null;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
    }

    if (!token) {
      return sendError(res, 401, 'Authentication required. Please sign in.');
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'tez_thaila_jwt_super_secret_key_2026_indian_ecommerce_platform');

    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        avatar: true,
        isActive: true,
        createdAt: true,
        updatedAt: true
      }
    });

    if (!user) {
      return sendError(res, 401, 'User account no longer exists.');
    }

    if (!user.isActive) {
      return sendError(res, 403, 'Your account has been deactivated. Please contact support.');
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return sendError(res, 401, 'Invalid or expired session token. Please sign in again.');
    }
    next(error);
  }
};

export const optionalAuth = async (req, res, next) => {
  try {
    let token = null;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
    }

    if (token) {
      try {
        const decoded = jwt.verify(
          token,
          process.env.JWT_SECRET || 'tez_thaila_jwt_super_secret_key_2026_indian_ecommerce_platform'
        );
        const user = await prisma.user.findUnique({
          where: { id: decoded.id },
          select: { id: true, name: true, email: true, role: true, isActive: true }
        });
        if (user && user.isActive) {
          req.user = user;
          return next();
        }
      } catch (tokenErr) {
        // Token invalid, fall back to guest customer
      }
    }

    // Default to customer ID 2 or first customer for guest session
    const defaultCust = await prisma.user.findFirst({
      where: { role: 'CUSTOMER', isActive: true },
      select: { id: true, name: true, email: true, role: true }
    });
    req.user = defaultCust || { id: 2, name: 'Guest User', role: 'CUSTOMER' };
    next();
  } catch (err) {
    next(err);
  }
};

export const requireAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== 'ADMIN') {
    return sendError(res, 403, 'Access denied. Administrator privileges required.');
  }
  next();
};
