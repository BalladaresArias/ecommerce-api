const axios = require('axios');
const crypto = require('crypto');
const pool = require('../config/db');
const sendEmail = require('../config/mailer');
const { orderStatusEmail } = require('../config/emailTemplates');
require('dotenv').config();

const WOMPI_API = 'https://sandbox.wompi.co/v1';

const createTransaction = async (req, res) => {
  try {
    const { order_id, token, card_holder, installments = 1 } = req.body;

    if (!order_id || !token)
      return res.status(400).json({ error: 'order_id y token son requeridos' });

    const [orders] = await pool.query(
      'SELECT * FROM orders WHERE id = ? AND user_id = ?',
      [order_id, req.user.id]
    );

    if (!orders.length)
      return res.status(404).json({ error: 'Orden no encontrada' });

    const order = orders[0];

    if (order.status !== 'pendiente')
      return res.status(400).json({ error: 'Esta orden ya fue procesada' });

    // Verificar stock antes de pagar
    const [items] = await pool.query(
      `SELECT oi.*, p.stock, p.name AS product_name
       FROM order_items oi
       JOIN products p ON oi.product_id = p.id
       WHERE oi.order_id = ?`,
      [order_id]
    );

    for (const item of items) {
      if (item.stock < item.quantity) {
        return res.status(400).json({
          error: `Stock insuficiente para ${item.product_name}. Disponible: ${item.stock}`
        });
      }
    }

    const merchantRes = await axios.get(
      `${WOMPI_API}/merchants/${process.env.WOMPI_PUBLIC_KEY}`
    );
    const acceptanceToken = merchantRes.data.data.presigned_acceptance.acceptance_token;

    const amountInCents = Math.round(Number(order.total) * 4000 * 100);
    const currency = 'COP';
    const reference = `shopflow-${order_id}-${Date.now()}`;

    const integrityString = `${reference}${amountInCents}${currency}${process.env.WOMPI_INTEGRITY_KEY}`;
    const signature = crypto.createHash('sha256').update(integrityString).digest('hex');

    const transactionRes = await axios.post(
      `${WOMPI_API}/transactions`,
      {
        amount_in_cents: amountInCents,
        currency,
        customer_email: req.user.email,
        payment_method: {
          type: 'CARD',
          installments: Number(installments),
          token,
        },
        reference,
        acceptance_token: acceptanceToken,
        signature,
      },
      {
        headers: { Authorization: `Bearer ${process.env.WOMPI_PRIVATE_KEY}` },
      }
    );

    const tx = transactionRes.data.data;
    console.log('Transacción:', tx.id, tx.status);

    // Si fue aprobado, descontar stock automáticamente
    if (tx.status === 'APPROVED') {
      for (const item of items) {
        await pool.query(
          'UPDATE products SET stock = stock - ? WHERE id = ?',
          [item.quantity, item.product_id]
        );
      }
      await pool.query(
        'UPDATE orders SET status = ?, payment_reference = ? WHERE id = ?',
        ['pagado', reference, order_id]
      );
    } else {
      await pool.query(
        'UPDATE orders SET payment_reference = ? WHERE id = ?',
        [reference, order_id]
      );
    }

    res.json({
      message: 'Transacción procesada',
      status: tx.status,
      reference,
      transaction_id: tx.id,
    });

  } catch (err) {
    const detail = err.response?.data || err.message;
    console.error('ERROR payment:', JSON.stringify(detail, null, 2));
    res.status(500).json({ error: 'Error al procesar pago', detail });
  }
};

// Webhook automático de Wompi
const webhook = async (req, res) => {
  try {
    const { event, data } = req.body;

    if (event === 'transaction.updated') {
      const tx = data.transaction;
      const reference = tx.reference;
      const orderId = reference.split('-')[1];

      const [orders] = await pool.query(
        `SELECT o.*, u.name, u.email
         FROM orders o
         JOIN users u ON o.user_id = u.id
         WHERE o.id = ?`,
        [orderId]
      );

      if (!orders.length) return res.json({ received: true });
      const order = orders[0];

      let newStatus = order.status;

      if (tx.status === 'APPROVED' && order.status === 'pendiente') {
        newStatus = 'pagado';

        // Descontar stock
        const [items] = await pool.query(
          'SELECT * FROM order_items WHERE order_id = ?', [orderId]
        );
        for (const item of items) {
          await pool.query(
            'UPDATE products SET stock = stock - ? WHERE id = ?',
            [item.quantity, item.product_id]
          );
        }
      }

      if (tx.status === 'DECLINED' || tx.status === 'VOIDED') {
        newStatus = 'cancelado';
      }

      if (newStatus !== order.status) {
        await pool.query(
          'UPDATE orders SET status = ? WHERE id = ?',
          [newStatus, orderId]
        );

        const user = { name: order.name, email: order.email };
        setImmediate(async () => {
          await sendEmail(
            user.email,
            orderStatusEmail(user, { ...order, status: newStatus })
          );
        });
      }

      console.log(`Webhook: Orden ${orderId} → ${newStatus}`);
    }

    res.json({ received: true });
  } catch (err) {
    console.error('Webhook error:', err.message);
    res.status(500).json({ error: err.message });
  }
};

// Reembolso / cancelación
const refundOrder = async (req, res) => {
  try {
    const { id } = req.params;

    const [orders] = await pool.query(
      `SELECT o.*, u.name, u.email
       FROM orders o
       JOIN users u ON o.user_id = u.id
       WHERE o.id = ?`,
      [id]
    );

    if (!orders.length)
      return res.status(404).json({ error: 'Orden no encontrada' });

    const order = orders[0];

    if (!['pagado', 'enviado'].includes(order.status))
      return res.status(400).json({ error: 'Solo se pueden reembolsar órdenes pagadas o enviadas' });

    if (!order.payment_reference)
      return res.status(400).json({ error: 'Esta orden no tiene referencia de pago' });

    // Obtener transaction_id de Wompi
    const txRes = await axios.get(
      `${WOMPI_API}/transactions?reference=${order.payment_reference}`,
      { headers: { Authorization: `Bearer ${process.env.WOMPI_PRIVATE_KEY}` } }
    );

    const transactions = txRes.data.data;
    const approvedTx = transactions.find(t => t.status === 'APPROVED');

    if (!approvedTx)
      return res.status(400).json({ error: 'No se encontró transacción aprobada para reembolsar' });

    // Solicitar reembolso en Wompi
    await axios.post(
      `${WOMPI_API}/transactions/${approvedTx.id}/void`,
      {},
      { headers: { Authorization: `Bearer ${process.env.WOMPI_PRIVATE_KEY}` } }
    );

    // Restaurar stock
    const [items] = await pool.query(
      'SELECT * FROM order_items WHERE order_id = ?', [id]
    );
    for (const item of items) {
      await pool.query(
        'UPDATE products SET stock = stock + ? WHERE id = ?',
        [item.quantity, item.product_id]
      );
    }

    // Marcar como cancelado y reembolsado
    await pool.query(
      'UPDATE orders SET status = ?, refunded = 1 WHERE id = ?',
      ['cancelado', id]
    );

    const user = { name: order.name, email: order.email };
    setImmediate(async () => {
      await sendEmail(user.email, orderStatusEmail(user, { ...order, status: 'cancelado' }));
    });

    res.json({ message: 'Orden cancelada y reembolso iniciado en Wompi' });
  } catch (err) {
    const detail = err.response?.data || err.message;
    console.error('ERROR refund:', JSON.stringify(detail, null, 2));
    res.status(500).json({ error: 'Error al procesar reembolso', detail });
  }
};

module.exports = { createTransaction, webhook, refundOrder };