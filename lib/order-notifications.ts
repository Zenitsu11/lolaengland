import { getSupabaseAdmin } from '@/lib/supabase-admin';

export type OrderNotificationType = 'order_confirmation' | 'shipment' | 'delivery' | 'return' | 'refund';

const dbType: Record<OrderNotificationType, string> = {
  order_confirmation: 'order_confirmation',
  shipment: 'shipment_update',
  delivery: 'delivery_confirmation',
  return: 'return_update',
  refund: 'refund_update',
};

const copy: Record<OrderNotificationType, { subject: string; heading: string; body: string }> = {
  order_confirmation: { subject: 'Your LOLA ENGLAND order is confirmed', heading: 'Your order is confirmed!', body: 'We have confirmed your order and our team will prepare it for delivery shortly.' },
  shipment: { subject: 'Your LOLA ENGLAND order has shipped', heading: 'Your order is on its way!', body: 'Your order has been shipped. Use the tracking details shared by LOLA ENGLAND to follow its progress.' },
  delivery: { subject: 'Your LOLA ENGLAND order has been delivered', heading: 'Order delivered', body: 'Our records show that your LOLA ENGLAND order has been delivered. We hope you love it!' },
  return: { subject: 'Update on your LOLA ENGLAND return', heading: 'Return update', body: 'There is an update on your LOLA ENGLAND return request.' },
  refund: { subject: 'Update on your LOLA ENGLAND refund', heading: 'Refund update', body: 'There is an update on your LOLA ENGLAND refund.' },
};

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c] || c);
}

export async function enqueueOrderNotification(args: {
  orderId: string;
  type: OrderNotificationType;
  email?: string | null;
  phone?: string | null;
  customerName?: string | null;
  amount?: number | null;
  paymentMethod?: string | null;
}) {
  const db = getSupabaseAdmin();
  if (!db) return { ok: false, error: 'Database unavailable.' };
  const email = args.email?.trim();
  if (!email) return { ok: false, error: 'No customer email is available for this notification.' };

  const type = dbType[args.type];
  const { error: queueError } = await db.from('order_notifications').upsert([{
    order_id: args.orderId, notification_type: type, channel: 'email',
    status: 'pending', customer_email: email, customer_phone: args.phone || null,
  }], { onConflict: 'order_id,notification_type,channel', ignoreDuplicates: true });
  if (queueError) {
    console.error('notification enqueue failed', queueError);
    return { ok: false, error: 'Could not queue notification.' };
  }

  const { data: row, error: lookupError } = await db.from('order_notifications')
    .select('id,status').eq('order_id', args.orderId).eq('notification_type', type)
    .eq('channel', 'email').maybeSingle();
  if (lookupError || !row) return { ok: false, error: 'Could not read notification status.' };
  if (row.status === 'sent') return { ok: true, alreadySent: true };

  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.LOLA_NOTIFICATION_FROM_EMAIL;
  if (!apiKey || !from) {
    const error = 'Email is not configured. Add RESEND_API_KEY and LOLA_NOTIFICATION_FROM_EMAIL in Vercel, then retry.';
    await db.from('order_notifications').update({ status: 'failed', error_message: error }).eq('id', row.id);
    return { ok: false, error };
  }

  const { data: orderRecord } = await db.from('orders').select('invoice_number,estimated_delivery_date').eq('id', args.orderId).maybeSingle();
  const displayOrderId = orderRecord?.invoice_number || args.orderId;
  const estimatedDelivery = orderRecord?.estimated_delivery_date ? new Date(orderRecord.estimated_delivery_date + 'T12:00:00').toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }) : '';
  const template = copy[args.type];
  const name = args.customerName?.trim() || 'there';
  const amount = args.amount == null ? '' : `<p><strong>Order total:</strong> ₹${Number(args.amount).toLocaleString('en-IN')}</p>`;
  const cod = args.paymentMethod?.toLowerCase() === 'cod'
    ? '<p>Please keep the order amount ready to pay when your order is delivered.</p>' : '';
  const text = `Hi ${name},\n\n${template.body}\n\nOrder ID: ${displayOrderId}${args.amount == null ? '' : `\nOrder total: ₹${Number(args.amount).toLocaleString('en-IN')}`}${estimatedDelivery ? `\nEstimated delivery: ${estimatedDelivery}` : ''}${args.paymentMethod?.toLowerCase() === 'cod' ? '\nPlease keep the order amount ready to pay when your order is delivered.' : ''}\n\nThank you,\nLOLA ENGLAND`;
  const html = `<!doctype html><html><body style="margin:0;background:#f7f5f2;font-family:Arial,sans-serif;color:#171717"><div style="max-width:600px;margin:24px auto;padding:32px 24px;background:#fff;border:1px solid #e8e4df"><p style="letter-spacing:3px;font-size:13px;font-weight:bold">LOLA ENGLAND</p><h1>${template.heading}</h1><p>Hi ${escapeHtml(name)},</p><p>${template.body}</p><p><strong>Order ID:</strong> ${escapeHtml(displayOrderId)}</p>${amount}${estimatedDelivery ? `<p><strong>Estimated delivery:</strong> ${escapeHtml(estimatedDelivery)}</p>` : ''}${cod}<p>Thank you for shopping with us,<br><strong>LOLA ENGLAND</strong></p></div></body></html>`;

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ from, to: [email], subject: template.subject, html, text }),
      cache: 'no-store',
    });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok) {
      const message = typeof payload?.message === 'string' ? payload.message : 'Email provider rejected the message.';
      await db.from('order_notifications').update({ status: 'failed', error_message: message }).eq('id', row.id);
      return { ok: false, error: message };
    }
    await db.from('order_notifications').update({
      status: 'sent', provider_message_id: typeof payload?.id === 'string' ? payload.id : null,
      error_message: null, sent_at: new Date().toISOString(),
    }).eq('id', row.id);
    return { ok: true, alreadySent: false };
  } catch (err) {
    console.error('notification send failed', err);
    await db.from('order_notifications').update({ status: 'failed', error_message: 'Email provider request failed.' }).eq('id', row.id);
    return { ok: false, error: 'Email could not be sent. Check the email provider configuration.' };
  }
}


export async function sendAdminCodOrderAlert(args: {
  orderId: string;
  invoiceNumber: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  shippingAddress: string;
  amount: number;
  items: Array<{ name?: string; size?: string; quantity?: number; price?: number } | null>;
}) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.LOLA_NOTIFICATION_FROM_EMAIL;
  const to = process.env.LOLA_ADMIN_ORDER_EMAIL;
  if (!apiKey || !from || !to) return { ok: false, error: 'Admin order alert is not configured. Check RESEND_API_KEY, LOLA_NOTIFICATION_FROM_EMAIL and LOLA_ADMIN_ORDER_EMAIL.' };
  const itemsText = args.items.filter((item): item is NonNullable<typeof item> => item !== null).map(item => `${item.name || 'Item'}${item.size ? ` (size ${item.size})` : ''} × ${Math.max(1, Number(item.quantity) || 1)}`).join(', ');
  const subject = `New COD order needs confirmation — ${args.invoiceNumber}`;
  const text = `A new Cash on Delivery order needs your review.\n\nOrder code: ${args.invoiceNumber}\nCustomer: ${args.customerName}\nPhone: ${args.customerPhone}\nEmail: ${args.customerEmail || 'Not provided'}\nItems: ${itemsText}\nTotal: ₹${Number(args.amount).toLocaleString('en-IN')}\nDelivery address: ${args.shippingAddress}\n\nOpen the owner panel and go to Orders to confirm or cancel this order:\nhttps://www.lolaengland.com/admin\n\nThis alert does not confirm the order. Please review it in the admin panel.`;
  const html = `<!doctype html><html><body style="margin:0;background:#f7f5f2;font-family:Arial,sans-serif;color:#171717"><div style="max-width:620px;margin:24px auto;padding:30px 24px;background:#fff;border:1px solid #e8e4df"><p style="letter-spacing:3px;font-size:13px;font-weight:bold">LOLA ENGLAND · OWNER ALERT</p><h1>New COD order needs confirmation</h1><p><strong>Order code:</strong> ${escapeHtml(args.invoiceNumber)}</p><p><strong>Customer:</strong> ${escapeHtml(args.customerName)}</p><p><strong>Phone:</strong> ${escapeHtml(args.customerPhone)}</p><p><strong>Email:</strong> ${escapeHtml(args.customerEmail || 'Not provided')}</p><p><strong>Items:</strong> ${escapeHtml(itemsText || 'Order items')}</p><p><strong>Total:</strong> ₹${Number(args.amount).toLocaleString('en-IN')}</p><p><strong>Delivery address:</strong><br>${escapeHtml(args.shippingAddress)}</p><p>This alert does not confirm the order. Review the order in the owner panel before confirming.</p><p><a href="https://www.lolaengland.com/admin" style="display:inline-block;background:#171717;color:#fff;padding:13px 18px;text-decoration:none">Open admin orders</a></p></div></body></html>`;
  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ from, to: [to], subject, text, html }),
      cache: 'no-store',
    });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok) return { ok: false, error: typeof payload?.message === 'string' ? payload.message : 'Email provider rejected the admin alert.' };
    return { ok: true, messageId: typeof payload?.id === 'string' ? payload.id : null };
  } catch {
    return { ok: false, error: 'Admin alert email request failed.' };
  }
}
