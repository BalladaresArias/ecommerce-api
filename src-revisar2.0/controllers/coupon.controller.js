const couponModel = require('../models/coupon.model');

const validate = async (req, res) => {
  try {
    const { code, order_total } = req.body;

    if (!code) return res.status(400).json({ error: 'Código requerido' });

    const coupon = await couponModel.findByCode(code);

    if (!coupon) return res.status(404).json({ error: 'Cupón no encontrado' });
    if (!coupon.active) return res.status(400).json({ error: 'Cupón inactivo' });
    if (coupon.expires_at && new Date(coupon.expires_at) < new Date())
      return res.status(400).json({ error: 'Cupón expirado' });
    if (coupon.max_uses && coupon.uses >= coupon.max_uses)
      return res.status(400).json({ error: 'Cupón agotado' });
    if (order_total && Number(order_total) < Number(coupon.min_order))
      return res.status(400).json({
        error: `Mínimo de compra: $${Number(coupon.min_order).toFixed(2)}`
      });

    const discount = coupon.type === 'percentage'
      ? (Number(order_total) * coupon.value / 100)
      : Number(coupon.value);

    const final_total = Math.max(0, Number(order_total) - discount).toFixed(2);

    res.json({
      valid: true,
      coupon_id: coupon.id,
      code: coupon.code,
      type: coupon.type,
      value: coupon.value,
      discount: discount.toFixed(2),
      final_total,
    });
  } catch (err) {
    res.status(500).json({ error: 'Error al validar cupón', detail: err.message });
  }
};

const getAll = async (req, res) => {
  try {
    const coupons = await couponModel.getAll();
    res.json({ coupons });
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener cupones', detail: err.message });
  }
};

const create = async (req, res) => {
  try {
    const { code, type, value, min_order, max_uses, expires_at } = req.body;
    if (!code || !type || !value)
      return res.status(400).json({ error: 'Código, tipo y valor son obligatorios' });
    if (!['percentage', 'fixed'].includes(type))
      return res.status(400).json({ error: 'Tipo debe ser percentage o fixed' });
    if (type === 'percentage' && (value <= 0 || value > 100))
      return res.status(400).json({ error: 'Porcentaje debe ser entre 1 y 100' });

    const id = await couponModel.create(code, type, value, min_order || 0, max_uses, expires_at);
    res.status(201).json({ message: 'Cupón creado', id });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY')
      return res.status(400).json({ error: 'Ya existe un cupón con ese código' });
    res.status(500).json({ error: 'Error al crear cupón', detail: err.message });
  }
};

const toggleActive = async (req, res) => {
  try {
    const { active } = req.body;
    await couponModel.toggleActive(req.params.id, active);
    res.json({ message: `Cupón ${active ? 'activado' : 'desactivado'}` });
  } catch (err) {
    res.status(500).json({ error: 'Error al actualizar cupón', detail: err.message });
  }
};

const remove = async (req, res) => {
  try {
    const affected = await couponModel.remove(req.params.id);
    if (!affected) return res.status(404).json({ error: 'Cupón no encontrado' });
    res.json({ message: 'Cupón eliminado' });
  } catch (err) {
    res.status(500).json({ error: 'Error al eliminar cupón', detail: err.message });
  }
};

module.exports = { validate, getAll, create, toggleActive, remove };