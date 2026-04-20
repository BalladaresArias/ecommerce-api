const pointsModel = require('../models/points.model');

// GET /api/points — ver mis puntos
const getMyPoints = async (req, res) => {
  try {
    const total = await pointsModel.getPoints(req.user.id);
    const value_in_pesos = total * pointsModel.POINTS_VALUE;
    res.json({
      points: total,
      value_in_pesos,
      message: `Tienes ${total} puntos (equivale a $${value_in_pesos.toLocaleString('es-CO')} COP de descuento)`,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener puntos' });
  }
};

// GET /api/points/history — historial de movimientos
const getHistory = async (req, res) => {
  const page  = parseInt(req.query.page)  || 1;
  const limit = parseInt(req.query.limit) || 20;
  try {
    const data = await pointsModel.getHistory(req.user.id, page, limit);
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener historial' });
  }
};

// POST /api/points/redeem — canjear puntos
const redeemPoints = async (req, res) => {
  const { points } = req.body;
  if (!points || points <= 0 || !Number.isInteger(points))
    return res.status(400).json({ error: 'Cantidad de puntos inválida' });

  try {
    const discount = await pointsModel.redeemPoints(req.user.id, points);
    res.json({
      message: `Canjeaste ${points} puntos`,
      discount_applied: discount,
    });
  } catch (err) {
    if (err.message === 'Puntos insuficientes')
      return res.status(400).json({ error: err.message });
    console.error(err);
    res.status(500).json({ error: 'Error al canjear puntos' });
  }
};

module.exports = { getMyPoints, getHistory, redeemPoints };
