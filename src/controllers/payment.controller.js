const axios = require('axios');
const pool = require('../config/db');
require('dotenv').config();

const WOMPI_API = 'https://sandbox.wompi.co/v1';

// Obtener token de aceptación de Wompi
const getAcceptanceToken = async () => {
  const res = await axios.get(
    `${WOMPI_API}/merchants/${process.env.WOMPI_PUBLIC_KEY}`
  );
  return res.data.data.presigned_acceptance.acceptance_token;
};

// Crear transacción en Wompi
const createTransaction = async (req, res) => {
  try {
    const { order_id, token, card_holder, installments = 1 } = req.body;

    if (!order_id || !token)
      return res.status(400).json({ error: 'order_id y token son requeridos' });

    // Obtener la orden
    const [orders] = await pool.query(
      'SELECT * FROM orders WHERE id = ? AND user_id = ?',
      [order_id, req.user.id]
    );

    if (!orders.length)
      return res.status(404).json({ error: 'Orden no encontrada' });

    const order = orders[0];

    if (order.status !== 'pendiente')
      return res.status(400).json({ error: 'Esta orden ya fue procesada' });

    const acceptanceToken = await getAcceptanceToken();
    const amountInCents = Math.round(Number(order.total) * 100);
    const reference = `shopflow-${order_id}-${Date.now()}`;

    // Crear transacción en Wompi
    const transaction = await axios.post(
      `${WOMPI_API}/transactions`,
      {
        amount_in_cents: amountInCents,
        currency: 'COP',
        customer_email: req.user.email,
        payment_method: {
          type: 'CARD',
          installments,
          token,
        },
        reference,
        acceptance_token: acceptanceToken,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.WOMPI_PRIVATE_KEY}`,
        },
      }
    );

    const tx = transaction.data.data;

    // Guardar referencia en la orden
    await pool.query(
      'UPDATE orders SET status = ?, payment_reference = ? WHERE id = ?',
      [
        tx.status === 'APPROVED' ? 'pagado' : 'pendiente',
        reference,
        order_id,
      ]
    );

    res.json({
      message: 'Transacción procesada',
      status: tx.status,
      reference,
      transaction_id: tx.id,
    });

  } catch (err) {
    console.error('ERROR payment:', err.response?.data || err.message);
    res.status(500).json({
      error: 'Error al procesar pago',
      detail: err.response?.data?.error || err.message,
    });
  }
};

// Webhook de Wompi — notificaciones automáticas
const webhook = async (req, res) => {
  try {
    const { event, data } = req.body;

    if (event === 'transaction.updated') {
      const tx = data.transaction;
      const reference = tx.reference;
      const orderId = reference.split('-')[1];

      let newStatus = 'pendiente';
      if (tx.status === 'APPROVED') newStatus = 'pagado';
      if (tx.status === 'DECLINED') newStatus = 'cancelado';
      if (tx.status === 'VOIDED') newStatus = 'cancelado';

      await pool.query(
        'UPDATE orders SET status = ? WHERE id = ?',
        [newStatus, orderId]
      );

      console.log(`Orden ${orderId} actualizada a ${newStatus}`);
    }

    res.json({ received: true });
  } catch (err) {
    console.error('Webhook error:', err.message);
    res.status(500).json({ error: err.message });
  }
};

module.exports = { createTransaction, webhook };