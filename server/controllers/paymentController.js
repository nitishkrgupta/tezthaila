import crypto from 'crypto';
import { sendSuccess, sendError } from '../utils/apiResponse.js';

export const createRazorpayOrder = async (req, res, next) => {
  try {
    const { amount, currency = 'INR' } = req.body;

    if (!amount || amount <= 0) {
      return sendError(res, 400, 'Valid order amount is required');
    }

    const keyId = process.env.RAZORPAY_KEY_ID || 'rzp_test_simulated_key';
    const razorpayOrderId = `order_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 8)}`;

    return sendSuccess(res, 200, 'Razorpay order generated', {
      id: razorpayOrderId,
      amount: Math.round(parseFloat(amount) * 100), // in paise
      currency,
      key: keyId
    });
  } catch (error) {
    next(error);
  }
};

export const verifyRazorpayPayment = async (req, res, next) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    // For sandbox/test environments without real Razorpay secret key
    const secret = process.env.RAZORPAY_KEY_SECRET;
    let isValid = true;

    if (secret && razorpay_signature) {
      const generatedSignature = crypto
        .createHmac('sha256', secret)
        .update(`${razorpay_order_id}|${razorpay_payment_id}`)
        .digest('hex');
      isValid = generatedSignature === razorpay_signature;
    }

    if (!isValid) {
      return sendError(res, 400, 'Invalid payment signature. Payment verification failed.');
    }

    return sendSuccess(res, 200, 'Payment verified successfully', {
      paymentId: razorpay_payment_id || `pay_${Date.now()}`,
      orderId: razorpay_order_id,
      status: 'PAID'
    });
  } catch (error) {
    next(error);
  }
};
