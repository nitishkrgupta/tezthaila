import https from 'https';
import dotenv from 'dotenv';

dotenv.config();

/**
 * Escape HTML special characters for Telegram HTML parse_mode.
 */
function escapeHtml(text) {
  if (!text) return '';
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

/**
 * Send a silent Telegram notification to Admin when an order is placed.
 * Uses disable_notification: true so the admin receives the message without intrusive alert sounds.
 * Telegram Bot Token and Chat ID are loaded securely from environment variables (.env).
 */
export const sendSilentOrderNotification = async (order) => {
  const botToken = process.env.TELEGRAM_BOT_TOKEN?.trim();
  const chatId = process.env.TELEGRAM_ADMIN_CHAT_ID?.trim();

  if (!botToken || !chatId) {
    console.log('[Telegram Service] TELEGRAM_BOT_TOKEN or TELEGRAM_ADMIN_CHAT_ID not configured in .env. Skipping alert.');
    return { success: false, reason: 'unconfigured' };
  }

  const items = order.items || [];
  const itemsList = items.length > 0
    ? items.map((i, idx) => {
        const pName = escapeHtml(i.productName || i.name || i.product?.name || 'Tez Thaila Item');
        const qty = i.quantity || 1;
        const price = i.price || 0;
        return `${idx + 1}. <b>${pName}</b> × ${qty} — ₹${price}`;
      }).join('\n')
    : 'No item details';

  const addr = order.address || {};
  const addressParts = [addr.house, addr.street, addr.area, addr.city, addr.state, addr.pincode]
    .filter(Boolean);
  const addressLine = addressParts.length > 0
    ? escapeHtml(addressParts.join(', '))
    : 'Address details pending';

  const customerName = escapeHtml(addr.fullName || order.user?.name || 'Customer');
  const customerPhone = escapeHtml(addr.phone || order.user?.phone || 'N/A');
  const orderNum = escapeHtml(order.orderNumber || String(order.id || 'N/A'));
  const total = order.totalAmount || order.total || 0;
  const payMethod = escapeHtml(order.paymentMethod || 'COD');

  const htmlMessage = [
    `🛒 <b>NEW ORDER RECEIVED — TEZ THAILA</b> 🛍️`,
    `━━━━━━━━━━━━━━━━━━━━━━━━━━━━`,
    `📋 <b>Order ID:</b> <code>#${orderNum}</code>`,
    `💰 <b>Total Amount:</b> <b>₹${total}</b> (${payMethod})`,
    `👤 <b>Customer:</b> ${customerName}`,
    `📞 <b>Phone:</b> <code>${customerPhone}</code>`,
    `📍 <b>Delivery Address:</b>`,
    `<i>${addressLine}</i>`,
    ``,
    `📦 <b>Order Items:</b>`,
    itemsList,
    `━━━━━━━━━━━━━━━━━━━━━━━━━━━━`,
    `🕒 <b>Time:</b> ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })} (IST)`,
    `⚡ <b>Status:</b> ORDER_PLACED • Dispatch Ready`
  ].join('\n');

  return sendTelegramHttpRequest(botToken, chatId, htmlMessage, 'HTML', orderNum);
};

function sendTelegramHttpRequest(botToken, chatId, text, parseMode, orderNum) {
  return new Promise((resolve) => {
    try {
      const payload = {
        chat_id: chatId,
        text: text,
        disable_notification: true
      };

      if (parseMode) {
        payload.parse_mode = parseMode;
      }

      const postData = JSON.stringify(payload);

      const options = {
        hostname: 'api.telegram.org',
        port: 443,
        path: `/bot${botToken}/sendMessage`,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(postData)
        },
        timeout: 10000
      };

      const req = https.request(options, (res) => {
        let body = '';
        res.on('data', (chunk) => { body += chunk; });
        res.on('end', () => {
          try {
            const parsed = JSON.parse(body);
            if (parsed.ok) {
              console.log(`[Telegram Service] Silent order alert sent successfully for order #${orderNum}`);
              resolve({ success: true, data: parsed });
            } else {
              console.warn('[Telegram Service] Telegram API error:', parsed.description);
              // If formatting failed, retry as plain text without parse_mode
              if (parseMode) {
                console.log('[Telegram Service] Retrying notification in plain text...');
                const plainText = text.replace(/<[^>]*>?/gm, '');
                sendTelegramHttpRequest(botToken, chatId, plainText, null, orderNum).then(resolve);
              } else {
                resolve({ success: false, error: parsed.description });
              }
            }
          } catch {
            resolve({ success: true });
          }
        });
      });

      req.on('error', (err) => {
        console.warn('[Telegram Service] Network error sending Telegram message:', err.message);
        resolve({ success: false, error: err.message });
      });

      req.on('timeout', () => {
        req.destroy();
        console.warn('[Telegram Service] Request timed out while sending Telegram notification.');
        resolve({ success: false, error: 'timeout' });
      });

      req.write(postData);
      req.end();
    } catch (err) {
      console.warn('[Telegram Service] Unexpected error:', err.message);
      resolve({ success: false, error: err.message });
    }
  });
}
