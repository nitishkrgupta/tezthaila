import prisma from '../config/db.js';
import { sendSuccess, sendError } from '../utils/apiResponse.js';

export const getAdminStats = async (req, res, next) => {
  try {
    const [
      orders,
      totalOrders,
      totalProducts,
      totalCustomers,
      lowStockItems,
      pendingOrdersCount
    ] = await Promise.all([
      prisma.order.findMany({
        select: { totalAmount: true }
      }),
      prisma.order.count(),
      prisma.product.count({ where: { active: true } }),
      prisma.user.count({ where: { role: 'CUSTOMER' } }),
      prisma.product.count({ where: { stock: { lt: 40 }, active: true } }),
      prisma.order.count({
        where: {
          orderStatus: {
            in: ['ORDER_PLACED', 'CONFIRMED', 'PACKED', 'SHIPPED', 'OUT_FOR_DELIVERY']
          }
        }
      })
    ]);

    const totalRevenue = orders.reduce((sum, o) => sum + Number(o.totalAmount || 0), 0);

    const recentOrders = await prisma.order.findMany({
      include: {
        address: { select: { fullName: true, city: true, phone: true } }
      },
      orderBy: { createdAt: 'desc' },
      take: 6
    });

    const formattedRecent = recentOrders.map((o) => ({
      id: o.id,
      orderNumber: o.orderNumber,
      totalAmount: Number(o.totalAmount),
      paymentMethod: o.paymentMethod,
      paymentStatus: o.paymentStatus,
      orderStatus: o.orderStatus,
      createdAt: o.createdAt,
      customerName: o.address?.fullName || 'Valued Customer'
    }));

    return sendSuccess(res, 200, 'Admin analytics computed from MySQL', {
      totalRevenue,
      totalOrders,
      totalCustomers: totalCustomers || 1,
      totalProducts,
      pendingOrders: pendingOrdersCount,
      lowStockItems,
      recentOrders: formattedRecent
    });
  } catch (error) {
    next(error);
  }
};

export const updateOrderStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = [
      'ORDER_PLACED',
      'CONFIRMED',
      'PACKED',
      'SHIPPED',
      'OUT_FOR_DELIVERY',
      'DELIVERED',
      'CANCELLED'
    ];

    if (!status || !validStatuses.includes(status)) {
      return sendError(res, 400, `Invalid order status. Allowed: ${validStatuses.join(', ')}`);
    }

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

    const updateData = { orderStatus: status };
    if (status === 'DELIVERED') {
      updateData.paymentStatus = 'PAID';
    }

    const updated = await prisma.order.update({
      where: { id: order.id },
      data: updateData
    });

    return sendSuccess(res, 200, `Order #${order.orderNumber} status updated to ${status} in MySQL`, updated);
  } catch (error) {
    next(error);
  }
};
