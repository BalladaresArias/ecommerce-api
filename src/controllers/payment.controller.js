const axios = require('axios');
const crypto = require('crypto');
const pool = require('../config/db');
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

    // Obtener acceptance_token
    const merchantRes = await axios.get(
      `${WOMPI_API}/merchants/${process.env.WOMPI_PUBLIC_KEY}`
    );
    const acceptanceToken = merchantRes.data.data.presigned_acceptance.acceptance_token;

    const amountInCents = Math.round(Number(order.total) * 4000 * 100);
    const currency = 'COP';
    const reference = `shopflow-${order_id}-${Date.now()}`;

    // Generar firma de integridad
    const integrityString = `${reference}${amountInCents}${currency}${process.env.WOMPI_INTEGRITY_KEY}`;
    const signature = crypto
      .createHash('sha256')
      .update(integrityString)
      .digest('hex');

    console.log('Transacción:', { amountInCents, currency, reference, signature: signature.slice(0, 10) + '...' });

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
        headers: {
          Authorization: `Bearer ${process.env.WOMPI_PRIVATE_KEY}`,
        },
      }
    );

    const tx = transactionRes.data.data;
    console.log('Transacción creada:', tx.id, tx.status);

    const newStatus = tx.status === 'APPROVED' ? 'pagado' : 'pendiente';
    await pool.query(
      'UPDATE orders SET status = ?, payment_reference = ? WHERE id = ?',
      [newStatus, reference, order_id]
    );

    res.json({
      message: 'Transacción procesada',
      status: tx.status,
      reference,
      transaction_id: tx.id,
    });

  } catch (err) {
    const detail = err.response?.data || err.message;
    console.error('ERROR payment completo:', JSON.stringify(detail, null, 2));
    res.status(500).json({ error: 'Error al procesar pago', detail });
  }
};

const webhook = async (req, res) => {
  try {
    const { event, data } = req.body;
    if (event === 'transaction.updated') {
      const tx = data.transaction;
      const orderId = tx.reference.split('-')[1];
      let newStatus = 'pendiente';
      if (tx.status === 'APPROVED') newStatus = 'pagado';
      if (tx.status === 'DECLINED' || tx.status === 'VOIDED') newStatus = 'cancelado';
      await pool.query('UPDATE orders SET status = ? WHERE id = ?', [newStatus, orderId]);
    }
    res.json({ received: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = { createTransaction, webhook };