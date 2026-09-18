import prisma from '../config/db.js';
import { sendSuccess, sendError } from '../utils/apiResponse.js';
import { sendSilentOrderNotification } from '../services/telegramService.js';

export const createOrder = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const {
      addressId,
      items,
      paymentMethod = 'COD',
      paymentStatus = 'PENDING',
      couponCode,
      subtotal,
      discount = 0,
      shippingFee = 0,
      tax = 0,
      totalAmount,
      paymentDetails
    } = req.body;

    if (!items || !items.length) {
      return sendError(res, 400, 'Cannot place an empty order');
    }

    const orderNumber = `TT-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`;
    const trackingNumber = `TT-EXP-${Math.floor(10000 + Math.random() * 90000)}`;
    const estimatedDelivery = new Date(Date.now() + 86400000 * 2); // 48h express

    // Execute order creation in a Prisma transaction
    const createdOrder = await prisma.$transaction(async (tx) => {
      // 1. Resolve address
      let targetAddressId = addressId ? parseInt(addressId) : null;
      if (targetAddressId) {
        const addrExists = await tx.address.findUnique({ where: { id: targetAddressId } });
        if (!addrExists) targetAddressId = null;
      }
      if (!targetAddressId) {
        const defaultAddr = await tx.address.findFirst({
          where: { userId },
          orderBy: { isDefault: 'desc' }
        });
        targetAddressId = defaultAddr?.id || null;
      }

      // 2. Create the Order
      const newOrder = await tx.order.create({
        data: {
          orderNumber,
          userId,
          addressId: targetAddressId,
          subtotal: parseFloat(subtotal),
          discount: parseFloat(discount || 0),
          shippingFee: parseFloat(shippingFee || 0),
          tax: parseFloat(tax || 0),
          totalAmount: parseFloat(totalAmount),
          couponCode: couponCode || null,
          paymentMethod: paymentMethod === 'RAZORPAY' ? 'RAZORPAY' : 'COD',
          paymentStatus: paymentStatus === 'PAID' ? 'PAID' : 'PENDING',
          orderStatus: 'ORDER_PLACED',
          paymentId: paymentDetails?.paymentId || null,
          razorpayOrderId: paymentDetails?.razorpayOrderId || null,
          trackingNumber,
          estimatedDelivery
        }
      });

      // 3. Create Order Items & Deduct Stock
      for (const item of items) {
        let targetProductId = parseInt(item.productId || item.product?.id || item.id);
        const prodExists = await tx.product.findUnique({ where: { id: targetProductId } });
        if (!prodExists) {
          const firstProd = await tx.product.findFirst();
          targetProductId = firstProd ? firstProd.id : 1;
        }

        let targetVariantId = null;
        const rawVariantId = item.variantId ? parseInt(item.variantId) : (item.variant?.id ? parseInt(item.variant.id) : null);
        if (rawVariantId) {
          const varExists = await tx.productVariant.findUnique({ where: { id: rawVariantId } });
          if (varExists) targetVariantId = rawVariantId;
        }

        const itemPrice = parseFloat(item.price || item.variant?.price || item.product?.price || 0);
        const qty = parseInt(item.quantity || 1);
        const itemSubtotal = itemPrice * qty;
        const productName = item.product?.name || item.name || 'Tez Thaila Product';

        await tx.orderItem.create({
          data: {
            orderId: newOrder.id,
            productId: targetProductId,
            variantId: targetVariantId,
            productName,
            quantity: qty,
            price: itemPrice,
            subtotal: itemSubtotal
          }
        });

        // Deduct stock safely
        await tx.product.updateMany({
          where: { id: targetProductId, stock: { gte: qty } },
          data: { stock: { decrement: qty } }
        });
      }

      // 4. Create Payment Record if details provided
      if (paymentDetails) {
        await tx.payment.create({
          data: {
            orderId: newOrder.id,
            razorpayOrderId: paymentDetails.razorpayOrderId || null,
            razorpayPaymentId: paymentDetails.paymentId || null,
            amount: parseFloat(totalAmount),
            currency: 'INR',
            status: paymentStatus === 'PAID' ? 'PAID' : 'PENDING',
            method: paymentMethod === 'RAZORPAY' ? 'RAZORPAY' : 'COD'
          }
        });
      }

      // 5. Clear User Cart
      const cart = await tx.cart.findUnique({ where: { userId } });
      if (cart) {
        await tx.cartItem.deleteMany({ where: { cartId: cart.id } });
      }

      return newOrder;
    });

    // Fetch the complete order with address and items for response
    const fullOrder = await prisma.order.findUnique({
      where: { id: createdOrder.id },
      include: {
        address: true,
        items: {
          include: {
            product: {
              select: { id: true, name: true, slug: true, thumbnail: true }
            },
            variant: true
          }
        }
      }
    });

    const formattedOrder = {
      id: fullOrder.id,
      orderNumber: fullOrder.orderNumber,
      userId: fullOrder.userId,
      subtotal: Number(fullOrder.subtotal),
      discount: Number(fullOrder.discount),
      shippingFee: Number(fullOrder.shippingFee),
      tax: Number(fullOrder.tax),
      totalAmount: Number(fullOrder.totalAmount),
      couponCode: fullOrder.couponCode,
      paymentMethod: fullOrder.paymentMethod,
      paymentStatus: fullOrder.paymentStatus,
      orderStatus: fullOrder.orderStatus,
      trackingNumber: fullOrder.trackingNumber,
      estimatedDelivery: fullOrder.estimatedDelivery,
      createdAt: fullOrder.createdAt,
      address: fullOrder.address,
      items: fullOrder.items.map((it) => ({
        id: it.id,
        productId: it.productId,
        variantId: it.variantId,
        name: it.productName,
        productName: it.productName,
        price: Number(it.price),
        quantity: it.quantity,
        subtotal: Number(it.subtotal),
        thumbnail: it.product?.thumbnail || 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=600&q=80',
        product: it.product,
        variant: it.variant
      }))
    };

    // Send silent Telegram notification to Admin asynchronously
    sendSilentOrderNotification(fullOrder).catch((tgErr) => {
      console.warn('[Telegram Alert Error]:', tgErr.message);
    });

    return sendSuccess(res, 201, 'Order placed successfully in MySQL!', formattedOrder);
  } catch (error) {
    next(error);
  }
};

export const getOrders = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const isAdmin = req.user.role === 'ADMIN';

    const where = isAdmin ? {} : { userId };

    const orders = await prisma.order.findMany({
      where,
      include: {
        address: true,
        items: {
          include: {
            product: { select: { thumbnail: true, slug: true } }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    const formatted = orders.map((o) => ({
      id: o.id,
      orderNumber: o.orderNumber,
      userId: o.userId,
      subtotal: Number(o.subtotal),
      discount: Number(o.discount),
      shippingFee: Number(o.shippingFee),
      tax: Number(o.tax),
      totalAmount: Number(o.totalAmount),
      couponCode: o.couponCode,
      paymentMethod: o.paymentMethod,
      paymentStatus: o.paymentStatus,
      orderStatus: o.orderStatus,
      trackingNumber: o.trackingNumber,
      estimatedDelivery: o.estimatedDelivery,
      createdAt: o.createdAt,
      address: o.address,
      items: o.items.map((it) => ({
        id: it.id,
        productId: it.productId,
        variantId: it.variantId,
        name: it.productName,
        productName: it.productName,
        price: Number(it.price),
        quantity: it.quantity,
        subtotal: Number(it.subtotal),
        thumbnail: it.product?.thumbnail || 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=600&q=80'
      }))
    }));

    return sendSuccess(res, 200, 'Orders retrieved successfully', formatted);
  } catch (error) {
    next(error);
  }
};

export const getOrderById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const isNum = !isNaN(id);

    const order = await prisma.order.findFirst({
      where: {
        OR: [
          { orderNumber: id },
          ...(isNum ? [{ id: parseInt(id) }] : [])
        ]
      },
      include: {
        address: true,
        items: {
          include: {
            product: true,
            variant: true
          }
        },
        payments: true
      }
    });

    if (!order) {
      return sendError(res, 404, 'Order not found');
    }

    const formatted = {
      id: order.id,
      orderNumber: order.orderNumber,
      userId: order.userId,
      subtotal: Number(order.subtotal),
      discount: Number(order.discount),
      shippingFee: Number(order.shippingFee),
      tax: Number(order.tax),
      totalAmount: Number(order.totalAmount),
      couponCode: order.couponCode,
      paymentMethod: order.paymentMethod,
      paymentStatus: order.paymentStatus,
      orderStatus: order.orderStatus,
      trackingNumber: order.trackingNumber,
      estimatedDelivery: order.estimatedDelivery,
      createdAt: order.createdAt,
      address: order.address,
      items: order.items.map((it) => ({
        id: it.id,
        productId: it.productId,
        variantId: it.variantId,
        name: it.productName,
        productName: it.productName,
        price: Number(it.price),
        quantity: it.quantity,
        subtotal: Number(it.subtotal),
        thumbnail: it.product?.thumbnail || 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=600&q=80',
        product: it.product,
        variant: it.variant
      })),
      payments: order.payments
    };

    return sendSuccess(res, 200, 'Order details fetched', formatted);
  } catch (error) {
    next(error);
  }
};

export const cancelOrder = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { reason = 'Customer requested cancellation' } = req.body;
    const isNum = !isNaN(id);

    const order = await prisma.order.findFirst({
      where: {
        OR: [
          { orderNumber: id },
          ...(isNum ? [{ id: parseInt(id) }] : [])
        ]
      }
    });

    if (!order) {
      return sendError(res, 404, 'Order not found');
    }

    if (order.orderStatus === 'DELIVERED') {
      return sendError(res, 400, 'Delivered orders cannot be cancelled. You may request a return instead.');
    }

    const updated = await prisma.order.update({
      where: { id: order.id },
      data: {
        orderStatus: 'CANCELLED'
      }
    });

    return sendSuccess(res, 200, 'Order cancelled successfully', updated);
  } catch (error) {
    next(error);
  }
};

export const requestReturn = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { reason = 'Defective or incorrect item' } = req.body;
    const isNum = !isNaN(id);

    const order = await prisma.order.findFirst({
      where: {
        OR: [
          { orderNumber: id },
          ...(isNum ? [{ id: parseInt(id) }] : [])
        ]
      }
    });

    if (!order) {
      return sendError(res, 404, 'Order not found');
    }

    await prisma.order.update({
      where: { id: order.id },
      data: { orderStatus: 'RETURN_REQUESTED' }
    });

    await prisma.returnRequest.create({
      data: {
        orderId: order.id,
        userId: order.userId,
        reason,
        status: 'REQUESTED'
      }
    });

    return sendSuccess(res, 200, 'Return requested successfully. Doorstep pickup scheduled within 48 hours.');
  } catch (error) {
    next(error);
  }
};
