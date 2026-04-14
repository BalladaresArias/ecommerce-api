const request = require('supertest');
const app = require('../src/app');
const pool = require('../src/config/db');

let adminToken, clientToken, productId, orderId, couponCode;

beforeAll(async () => {
  await pool.query('DELETE FROM users WHERE email LIKE "%@test.com"');
  await pool.query('DELETE FROM coupons WHERE code LIKE "TEST%"');

  await request(app).post('/api/auth/register').send({ name: 'Admin', email: 'admin@test.com', password: 'password123', role: 'admin' });
  await request(app).post('/api/auth/register').send({ name: 'Cliente', email: 'cliente@test.com', password: 'password123' });

  const adminRes = await request(app).post('/api/auth/login').send({ email: 'admin@test.com', password: 'password123' });
  adminToken = adminRes.body.token;

  const clientRes = await request(app).post('/api/auth/login').send({ email: 'cliente@test.com', password: 'password123' });
  clientToken = clientRes.body.token;

  // Crear producto de prueba
  const prodRes = await request(app)
    .post('/api/products')
    .set('Authorization', `Bearer ${adminToken}`)
    .send({ name: 'Producto Orden Test', price: 100000, stock: 50 });
  productId = prodRes.body.product.id;

  // Crear cupón de prueba
  const [result] = await pool.query(
    'INSERT INTO coupons (code, type, value, active) VALUES (?, ?, ?, ?)',
    ['TESTDESC10', 'percentage', 10, 1]
  );
  couponCode = 'TESTDESC10';
});

afterAll(async () => {
  await pool.query('DELETE FROM order_items WHERE product_id = ?', [productId]);
  await pool.query('DELETE FROM orders WHERE user_id IN (SELECT id FROM users WHERE email LIKE "%@test.com")');
  if (productId) await pool.query('DELETE FROM products WHERE id = ?', [productId]);
  await pool.query('DELETE FROM coupons WHERE code LIKE "TEST%"');
  await pool.query('DELETE FROM users WHERE email LIKE "%@test.com"');
  await pool.end();
});

describe('POST /api/orders — crear orden', () => {
  test('cliente puede crear orden', async () => {
    const res = await request(app)
      .post('/api/orders')
      .set('Authorization', `Bearer ${clientToken}`)
      .send({ items: [{ product_id: productId, quantity: 2 }] });
    expect(res.status).toBe(201);
    expect(res.body.order_id).toBeDefined();
    expect(Number(res.body.total)).toBe(200000);
    orderId = res.body.order_id;
  });

  test('aplica cupón de porcentaje correctamente', async () => {
    const res = await request(app)
      .post('/api/orders')
      .set('Authorization', `Bearer ${clientToken}`)
      .send({ items: [{ product_id: productId, quantity: 1 }], coupon_code: couponCode });
    expect(res.status).toBe(201);
    expect(res.body.coupon_applied).toBe(true);
    expect(Number(res.body.discount)).toBe(10000); // 10% de 100000
    expect(Number(res.body.total)).toBe(90000);
  });

  test('falla si la orden está vacía', async () => {
    const res = await request(app)
      .post('/api/orders')
      .set('Authorization', `Bearer ${clientToken}`)
      .send({ items: [] });
    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/al menos un producto/i);
  });

  test('falla si el producto no existe', async () => {
    const res = await request(app)
      .post('/api/orders')
      .set('Authorization', `Bearer ${clientToken}`)
      .send({ items: [{ product_id: 999999, quantity: 1 }] });
    expect(res.status).toBe(404);
  });

  test('falla si no hay stock suficiente', async () => {
    const res = await request(app)
      .post('/api/orders')
      .set('Authorization', `Bearer ${clientToken}`)
      .send({ items: [{ product_id: productId, quantity: 9999 }] });
    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/stock/i);
  });

  test('falla sin token', async () => {
    const res = await request(app)
      .post('/api/orders')
      .send({ items: [{ product_id: productId, quantity: 1 }] });
    expect(res.status).toBe(401);
  });
});

describe('GET /api/orders/my-orders', () => {
  test('cliente ve sus propias órdenes', async () => {
    const res = await request(app)
      .get('/api/orders/my-orders')
      .set('Authorization', `Bearer ${clientToken}`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.orders)).toBe(true);
    expect(res.body.orders.length).toBeGreaterThan(0);
  });

  test('falla sin token', async () => {
    const res = await request(app).get('/api/orders/my-orders');
    expect(res.status).toBe(401);
  });
});

describe('GET /api/orders — solo admin', () => {
  test('admin puede ver todas las órdenes', async () => {
    const res = await request(app)
      .get('/api/orders')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.orders)).toBe(true);
  });

  test('cliente NO puede ver todas las órdenes', async () => {
    const res = await request(app)
      .get('/api/orders')
      .set('Authorization', `Bearer ${clientToken}`);
    expect(res.status).toBe(403);
  });
});

describe('PUT /api/orders/:id/status — cambio de estado', () => {
  test('admin puede cambiar estado a pagado', async () => {
    const res = await request(app)
      .put(`/api/orders/${orderId}/status`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ status: 'pagado' });
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('pagado');
  });

  test('admin puede cambiar estado a enviado con tracking', async () => {
    const res = await request(app)
      .put(`/api/orders/${orderId}/status`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ status: 'enviado', shipping_company: 'Servientrega', shipping_tracking: 'SE123456' });
    expect(res.status).toBe(200);
  });

  test('falla enviado sin shipping_company', async () => {
    const res = await request(app)
      .put(`/api/orders/${orderId}/status`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ status: 'enviado' });
    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/transportadora/i);
  });

  test('falla con estado inválido', async () => {
    const res = await request(app)
      .put(`/api/orders/${orderId}/status`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ status: 'inventado' });
    expect(res.status).toBe(400);
  });

  test('cliente NO puede cambiar estado', async () => {
    const res = await request(app)
      .put(`/api/orders/${orderId}/status`)
      .set('Authorization', `Bearer ${clientToken}`)
      .send({ status: 'entregado' });
    expect(res.status).toBe(403);
  });
});

describe('Lógica — restauración de stock al cancelar', () => {
  test('cancelar orden restaura el stock', async () => {
    // Stock antes
    const [before] = await pool.query('SELECT stock FROM products WHERE id = ?', [productId]);
    const stockBefore = before[0].stock;

    // Crear orden con 2 unidades
    const orderRes = await request(app)
      .post('/api/orders')
      .set('Authorization', `Bearer ${clientToken}`)
      .send({ items: [{ product_id: productId, quantity: 2 }] });
    const newOrderId = orderRes.body.order_id;

    // Pasar a pagado
    await request(app)
      .put(`/api/orders/${newOrderId}/status`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ status: 'pagado' });

    // Cancelar
    await request(app)
      .put(`/api/orders/${newOrderId}/status`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ status: 'cancelado' });

    // Stock después — debe ser igual al de antes
    const [after] = await pool.query('SELECT stock FROM products WHERE id = ?', [productId]);
    expect(after[0].stock).toBe(stockBefore);
  });
});