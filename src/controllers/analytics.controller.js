const pool = require('../config/db');

const getDashboard = async (req, res) => {
  try {
    const { period = '30' } = req.query;
    const days = parseInt(period);

    const [totalRevenue] = await pool.query(`
      SELECT 
        COALESCE(SUM(total), 0) as revenue,
        COUNT(*) as total_orders
      FROM orders 
      WHERE status NOT IN ('cancelado') 
      AND created_at >= DATE_SUB(NOW(), INTERVAL ? DAY)
    `, [days]);

    const [refunds] = await pool.query(`
      SELECT COALESCE(SUM(total), 0) as refunded
      FROM orders 
      WHERE status = 'cancelado' AND refunded = 1
      AND created_at >= DATE_SUB(NOW(), INTERVAL ? DAY)
    `, [days]);

    const [newUsers] = await pool.query(`
      SELECT COUNT(*) as count 
      FROM users 
      WHERE created_at >= DATE_SUB(NOW(), INTERVAL ? DAY)
    `, [days]);

    const [salesByDay] = await pool.query(`
      SELECT 
        DATE(created_at) as date,
        SUM(total) as revenue,
        COUNT(*) as orders
      FROM orders
      WHERE status NOT IN ('cancelado')
      AND created_at >= DATE_SUB(NOW(), INTERVAL ? DAY)
      GROUP BY DATE(created_at)
      ORDER BY date ASC
    `, [days]);

    const [topProducts] = await pool.query(`
      SELECT 
        p.name,
        p.price,
        p.image_url,
        SUM(oi.quantity) as total_sold,
        SUM(oi.quantity * oi.unit_price) as revenue
      FROM order_items oi
      JOIN products p ON oi.product_id = p.id
      JOIN orders o ON oi.order_id = o.id
      WHERE o.status NOT IN ('cancelado')
      AND o.created_at >= DATE_SUB(NOW(), INTERVAL ? DAY)
      GROUP BY p.id, p.name, p.price, p.image_url
      ORDER BY total_sold DESC
      LIMIT 5
    `, [days]);

    const [ordersByStatus] = await pool.query(`
      SELECT status, COUNT(*) as count
      FROM orders
      WHERE created_at >= DATE_SUB(NOW(), INTERVAL ? DAY)
      GROUP BY status
    `, [days]);

    const [topCategories] = await pool.query(`
      SELECT 
        c.name as category,
        SUM(oi.quantity) as total_sold,
        SUM(oi.quantity * oi.unit_price) as revenue
      FROM order_items oi
      JOIN products p ON oi.product_id = p.id
      JOIN categories c ON p.category_id = c.id
      JOIN orders o ON oi.order_id = o.id
      WHERE o.status NOT IN ('cancelado')
      AND o.created_at >= DATE_SUB(NOW(), INTERVAL ? DAY)
      GROUP BY c.id, c.name
      ORDER BY revenue DESC
      LIMIT 5
    `, [days]);

    const [couponStats] = await pool.query(`
      SELECT 
        c.code,
        c.type,
        c.value,
        COUNT(o.id) as times_used,
        SUM(o.discount) as total_discount
      FROM coupons c
      LEFT JOIN orders o ON o.coupon_id = c.id
      AND o.created_at >= DATE_SUB(NOW(), INTERVAL ? DAY)
      GROUP BY c.id, c.code, c.type, c.value
      ORDER BY times_used DESC
      LIMIT 5
    `, [days]);

    const net_revenue = (Number(totalRevenue[0].revenue) - Number(refunds[0].refunded)).toFixed(2);

    res.json({
      period: days,
      summary: {
        revenue: Number(totalRevenue[0].revenue).toFixed(2),
        net_revenue,
        refunded: Number(refunds[0].refunded).toFixed(2),
        total_orders: totalRevenue[0].total_orders,
        new_users: newUsers[0].count,
      },
      sales_by_day: salesByDay,
      top_products: topProducts,
      orders_by_status: ordersByStatus,
      top_categories: topCategories,
      coupon_stats: couponStats,
    });
  } catch (err) {
    console.error('Analytics error:', err.message);
    res.status(500).json({ error: 'Error al obtener analytics', detail: err.message });
  }
};

const exportOrders = async (req, res) => {
  try {
    const { period = '30' } = req.query;
    const days = parseInt(period);

    const [orders] = await pool.query(`
      SELECT 
        o.id,
        u.name as cliente,
        u.email,
        o.total,
        o.discount,
        o.status,
        o.coupon_id,
        o.shipping_company,
        o.shipping_tracking,
        o.created_at
      FROM orders o
      JOIN users u ON o.user_id = u.id
      WHERE o.created_at >= DATE_SUB(NOW(), INTERVAL ? DAY)
      ORDER BY o.created_at DESC
    `, [days]);

    const headers = ['ID','Cliente','Email','Total','Descuento','Estado','Transportadora','Tracking','Fecha'];
    const rows = orders.map(o => [
      o.id,
      o.cliente,
      o.email,
      o.total,
      o.discount || 0,
      o.status,
      o.shipping_company || '',
      o.shipping_tracking || '',
      new Date(o.created_at).toLocaleDateString('es-CO'),
    ]);

    const csv = [headers, ...rows].map(r => r.join(',')).join('\n');

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="ordenes-${days}dias.csv"`);
    res.send('\uFEFF' + csv); // BOM para que Excel abra bien tildes
  } catch (err) {
    res.status(500).json({ error: 'Error al exportar', detail: err.message });
  }
};

module.exports = { getDashboard, exportOrders };