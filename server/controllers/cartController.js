import prisma from '../config/db.js';
import { sendSuccess, sendError } from '../utils/apiResponse.js';

// Helper to get or create cart for user
const getOrCreateCart = async (userId) => {
  let cart = await prisma.cart.findUnique({
    where: { userId }
  });
  if (!cart) {
    cart = await prisma.cart.create({
      data: { userId }
    });
  }
  return cart;
};

// Helper to fetch and format items
const getFormattedCartItems = async (cartId) => {
  const items = await prisma.cartItem.findMany({
    where: { cartId },
    include: {
      product: {
        include: {
          category: { select: { name: true, slug: true } },
          brand: { select: { name: true, slug: true } }
        }
      },
      variant: true
    },
    orderBy: { id: 'desc' }
  });

  return items.map((item) => {
    const unitPrice = item.variant ? Number(item.variant.price) : Number(item.price);
    const subtotal = unitPrice * item.quantity;

    return {
      id: item.id,
      cartId: item.cartId,
      productId: item.productId,
      variantId: item.variantId,
      quantity: item.quantity,
      price: unitPrice,
      subtotal,
      product: {
        id: item.product.id,
        name: item.product.name,
        slug: item.product.slug,
        sku: item.product.sku,
        thumbnail: item.product.thumbnail,
        price: Number(item.product.price),
        originalPrice: Number(item.product.originalPrice || item.product.price),
        discountPercentage: item.product.discountPercentage,
        stock: item.product.stock,
        maxQuantityPerOrder: item.product.maxQuantityPerOrder || 10,
        brandName: item.product.brand?.name || 'Tez Brand',
        categorySlug: item.product.category?.slug
      },
      variant: item.variant ? {
        id: item.variant.id,
        name: item.variant.name,
        value: item.variant.value,
        price: Number(item.variant.price),
        stock: item.variant.stock
      } : null
    };
  });
};

export const getCart = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const cart = await getOrCreateCart(userId);
    const items = await getFormattedCartItems(cart.id);

    return sendSuccess(res, 200, 'Cart retrieved successfully', items);
  } catch (error) {
    next(error);
  }
};

export const addToCart = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { product, variant, quantity = 1, productId: rawProductId, price: rawPrice } = req.body;

    const targetProductId = product?.id || rawProductId;
    if (!targetProductId) {
      return sendError(res, 400, 'Product is required to add to cart');
    }

    const cart = await getOrCreateCart(userId);
    const productId = parseInt(targetProductId);
    const variantId = variant?.id ? parseInt(variant.id) : null;

    // Look up product to verify existence and check maxQuantityPerOrder threshold
    const productRecord = await prisma.product.findUnique({
      where: { id: productId }
    });

    if (!productRecord) {
      return sendError(res, 404, 'Product not found');
    }

    let itemPrice = variant?.price
      ? parseFloat(variant.price)
      : (product?.price ? parseFloat(product.price) : (rawPrice ? parseFloat(rawPrice) : parseFloat(productRecord.price)));

    if (isNaN(itemPrice)) {
      itemPrice = parseFloat(productRecord.price);
    }

    const maxLimit = productRecord.maxQuantityPerOrder || 10;

    // Check if item already exists in user's cart
    const existing = await prisma.cartItem.findFirst({
      where: {
        cartId: cart.id,
        productId,
        variantId
      }
    });

    const addQty = parseInt(quantity || 1);

    if (existing) {
      const newQty = existing.quantity + addQty;
      if (newQty > maxLimit) {
        return sendError(
          res,
          400,
          `Maximum limit of ${maxLimit} units per order reached for this product.`
        );
      }
      await prisma.cartItem.update({
        where: { id: existing.id },
        data: {
          quantity: newQty,
          price: itemPrice
        }
      });
    } else {
      if (addQty > maxLimit) {
        return sendError(
          res,
          400,
          `Maximum limit of ${maxLimit} units per order reached for this product.`
        );
      }
      await prisma.cartItem.create({
        data: {
          cartId: cart.id,
          productId,
          variantId,
          quantity: addQty,
          price: itemPrice
        }
      });
    }

    const updatedItems = await getFormattedCartItems(cart.id);
    return sendSuccess(res, 200, 'Item added to cart', updatedItems);
  } catch (error) {
    next(error);
  }
};

export const updateCartItem = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { itemId } = req.params;
    const { quantity } = req.body;

    const cart = await getOrCreateCart(userId);
    const item = await prisma.cartItem.findFirst({
      where: { id: parseInt(itemId), cartId: cart.id },
      include: { product: true }
    });

    if (!item) {
      return sendError(res, 404, 'Cart item not found');
    }

    const qty = parseInt(quantity);
    if (qty <= 0) {
      await prisma.cartItem.delete({ where: { id: item.id } });
    } else {
      const maxLimit = item.product?.maxQuantityPerOrder || 10;
      if (qty > maxLimit) {
        return sendError(
          res,
          400,
          `Maximum limit of ${maxLimit} units per order reached for this product.`
        );
      }
      await prisma.cartItem.update({
        where: { id: item.id },
        data: { quantity: qty }
      });
    }

    const updatedItems = await getFormattedCartItems(cart.id);
    return sendSuccess(res, 200, 'Cart item quantity updated', updatedItems);
  } catch (error) {
    next(error);
  }
};

export const removeFromCart = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { itemId } = req.params;

    const cart = await getOrCreateCart(userId);
    await prisma.cartItem.deleteMany({
      where: { id: parseInt(itemId), cartId: cart.id }
    });

    const updatedItems = await getFormattedCartItems(cart.id);
    return sendSuccess(res, 200, 'Item removed from cart', updatedItems);
  } catch (error) {
    next(error);
  }
};

export const clearCart = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const cart = await getOrCreateCart(userId);

    await prisma.cartItem.deleteMany({
      where: { cartId: cart.id }
    });

    return sendSuccess(res, 200, 'Cart cleared successfully', []);
  } catch (error) {
    next(error);
  }
};
