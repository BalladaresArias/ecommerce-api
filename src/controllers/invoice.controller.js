const pool = require('../config/db');

const generateInvoice = async (req, res) => {
  try {
    const { orderId } = req.params;
    const userId = req.user.id;
    const isAdmin = req.user.role === 'admin';

    const [orders] = await pool.query(
      `SELECT o.*, u.name AS customer_name, u.email, u.phone
       FROM orders o
       JOIN users u ON o.user_id = u.id
       WHERE o.id = ?`,
      [orderId]
    );

    if (!orders.length)
      return res.status(404).json({ error: 'Orden no encontrada' });

    const order = orders[0];

    if (!isAdmin && order.user_id !== userId)
      return res.status(403).json({ error: 'No autorizado' });

    const [items] = await pool.query(
      `SELECT oi.*, p.name AS product_name, p.description
       FROM order_items oi
       JOIN products p ON oi.product_id = p.id
       WHERE oi.order_id = ?`,
      [orderId]
    );

    const subtotal = items.reduce((s, i) => s + (i.unit_price * i.quantity), 0);
    const discount = Number(order.discount) || 0;
    const total = Number(order.total);
    const fecha = new Date(order.created_at).toLocaleDateString('es-CO', {
      year: 'numeric', month: 'long', day: 'numeric'
    });

    const html = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8"/>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Helvetica Neue', Arial, sans-serif; color: #1a1a1a; background: #fff; padding: 40px; }
    .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 48px; padding-bottom: 24px; border-bottom: 2px solid #c9a84c; }
    .brand { font-size: 28px; font-weight: 300; letter-spacing: 4px; color: #c9a84c; }
    .brand span { display: block; font-size: 11px; letter-spacing: 2px; color: #888; margin-top: 4px; }
    .invoice-info { text-align: right; }
    .invoice-info h2 { font-size: 22px; font-weight: 300; letter-spacing: 3px; color: #1a1a1a; margin-bottom: 8px; }
    .invoice-info p { font-size: 12px; color: #666; line-height: 1.8; }
    .invoice-info .number { color: #c9a84c; font-weight: 600; font-size: 14px; }
    .section { margin-bottom: 32px; }
    .section h3 { font-size: 10px; letter-spacing: 3px; color: #c9a84c; margin-bottom: 12px; font-weight: 600; }
    .client-info { background: #f8f8f8; padding: 20px; border-left: 3px solid #c9a84c; }
    .client-info p { font-size: 13px; color: #333; line-height: 1.8; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 24px; }
    thead tr { border-bottom: 2px solid #c9a84c; }
    thead th { padding: 10px 12px; font-size: 10px; letter-spacing: 2px; color: #888; font-weight: 600; text-align: left; }
    thead th:last-child { text-align: right; }
    tbody tr { border-bottom: 1px solid #eee; }
    tbody tr:hover { background: #fafafa; }
    tbody td { padding: 14px 12px; font-size: 13px; color: #333; }
    tbody td:last-child { text-align: right; font-weight: 500; }
    .totals { margin-left: auto; width: 280px; }
    .totals-row { display: flex; justify-content: space-between; padding: 8px 0; font-size: 13px; color: #555; border-bottom: 1px solid #f0f0f0; }
    .totals-row.total { padding-top: 14px; border-bottom: none; border-top: 2px solid #c9a84c; margin-top: 8px; }
    .totals-row.total span { font-size: 20px; color: #c9a84c; font-weight: 300; letter-spacing: 1px; }
    .totals-row.total label { font-size: 11px; letter-spacing: 2px; color: #888; font-weight: 600; align-self: flex-end; }
    .status-badge { display: inline-block; padding: 4px 14px; font-size: 10px; letter-spacing: 2px; font-weight: 700; }
    .status-pendiente { background: rgba(201,168,76,0.1); color: #c9a84c; }
    .status-pagado { background: rgba(46,213,115,0.1); color: #27ae60; }
    .status-enviado { background: rgba(30,144,255,0.1); color: #1e90ff; }
    .status-entregado { background: rgba(46,213,115,0.15); color: #27ae60; }
    .status-cancelado { background: rgba(231,76,60,0.1); color: #e74c3c; }
    .footer { margin-top: 48px; padding-top: 24px; border-top: 1px solid #eee; text-align: center; }
    .footer p { font-size: 11px; color: #aaa; letter-spacing: 1px; line-height: 1.8; }
    .shipping-box { background: rgba(30,144,255,0.05); border: 1px solid rgba(30,144,255,0.2); padding: 16px; margin-top: 24px; }
    .shipping-box h3 { color: #1e90ff; }
    .shipping-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-top: 10px; }
    .shipping-grid p { font-size: 12px; color: #333; }
    .shipping-grid label { font-size: 10px; color: #888; letter-spacing: 1px; display: block; margin-bottom: 2px; }
    @media print { body { padding: 20px; } }
  </style>
</head>
<body>
  <div class="header">
    <div>
      <div class="brand">SHOPFLOW<span>E-COMMERCE STORE</span></div>
    </div>
    <div class="invoice-info">
      <h2>FACTURA</h2>
      <p class="number">#${String(order.id).padStart(6, '0')}</p>
      <p>Fecha: ${fecha}</p>
      <p>
        <span class="status-badge status-${order.status}">${order.status.toUpperCase()}</span>
      </p>
    </div>
  </div>

  <div class="section">
    <h3>DATOS DEL CLIENTE</h3>
    <div class="client-info">
      <p><strong>${order.customer_name}</strong></p>
      <p>${order.email}</p>
      ${order.phone ? `<p>${order.phone}</p>` : ''}
    </div>
  </div>

  <div class="section">
    <h3>DETALLE DE PRODUCTOS</h3>
    <table>
      <thead>
        <tr>
          <th>Producto</th>
          <th>Precio unit.</th>
          <th>Cantidad</th>
          <th>Subtotal</th>
        </tr>
      </thead>
      <tbody>
        ${items.map(item => `
          <tr>
            <td>${item.product_name}</td>
            <td>$${Number(item.unit_price).toLocaleString('es-CO')}</td>
            <td>${item.quantity}</td>
            <td>$${(item.unit_price * item.quantity).toLocaleString('es-CO')}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>

    <div class="totals">
      <div class="totals-row">
        <span>Subtotal</span>
        <span>$${subtotal.toLocaleString('es-CO')}</span>
      </div>
      ${discount > 0 ? `
      <div class="totals-row" style="color:#e74c3c">
        <span>Descuento</span>
        <span>-$${discount.toLocaleString('es-CO')}</span>
      </div>` : ''}
      <div class="totals-row total">
        <label>TOTAL</label>
        <span>$${total.toLocaleString('es-CO')}</span>
      </div>
    </div>
  </div>

  ${order.shipping_tracking ? `
  <div class="shipping-box">
    <h3>INFORMACIÓN DE ENVÍO</h3>
    <div class="shipping-grid">
      <div><label>TRANSPORTADORA</label><p>${order.shipping_company || ''}</p></div>
      <div><label>TRACKING</label><p>${order.shipping_tracking}</p></div>
      ${order.shipping_estimated ? `<div><label>ENTREGA ESTIMADA</label><p>${new Date(order.shipping_estimated + 'T12:00:00').toLocaleDateString('es-CO', { year: 'numeric', month: 'long', day: 'numeric' })}</p></div>` : ''}
      ${order.shipping_notes ? `<div><label>NOTAS</label><p>${order.shipping_notes}</p></div>` : ''}
    </div>
  </div>` : ''}

  <div class="footer">
    <p>SHOPFLOW · Gracias por tu compra · Este documento es tu comprobante de pago</p>
    <p>Generado el ${new Date().toLocaleDateString('es-CO', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
  </div>
</body>
</html>`;

    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.send(html);
  } catch (err) {
    console.error('Invoice error:', err.message);
    res.status(500).json({ error: 'Error al generar factura', detail: err.message });
  }
};

module.exports = { generateInvoice };