const request = require('supertest');
const app = require('../src/app');
const pool = require('../src/config/db');

let adminToken, clientToken, productId;

beforeAll(async () => {
  await pool.query('DELETE FROM users WHERE email LIKE "%@test.com"');

  await request(app).post('/api/auth/register').send({ name: 'Admin', email: 'admin@test.com', password: 'password123', role: 'admin' });
  await request(app).post('/api/auth/register').send({ name: 'Cliente', email: 'cliente@test.com', password: 'password123' });

  const adminRes = await request(app).post('/api/auth/login').send({ email: 'admin@test.com', password: 'password123' });
  adminToken = adminRes.body.token;

  const clientRes = await request(app).post('/api/auth/login').send({ email: 'cliente@test.com', password: 'password123' });
  clientToken = clientRes.body.token;
});

afterAll(async () => {
  if (productId) await pool.query('DELETE FROM products WHERE id = ?', [productId]);
  await pool.query('DELETE FROM users WHERE email LIKE "%@test.com"');
  await pool.end();
});

describe('GET /api/products', () => {
  test('retorna lista paginada de productos', async () => {
    const res = await request(app).get('/api/products');
    expect(res.status).toBe(200);
    expect(res.body.products).toBeDefined();
    expect(Array.isArray(res.body.products)).toBe(true);
    expect(res.body.total).toBeDefined();
    expect(res.body.pages).toBeDefined();
  });

  test('acepta parámetros de paginación', async () => {
    const res = await request(app).get('/api/products?page=1&limit=5');
    expect(res.status).toBe(200);
    expect(res.body.products.length).toBeLessThanOrEqual(5);
  });

  test('filtra por búsqueda', async () => {
    const res = await request(app).get('/api/products?search=camiseta');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.products)).toBe(true);
  });
});

describe('POST /api/products', () => {
  test('admin puede crear producto', async () => {
    const res = await request(app)
      .post('/api/products')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ name: 'Producto Test Jest', description: 'Descripción test', price: 99900, stock: 10 });
    expect(res.status).toBe(201);
    expect(res.body.product.name).toBe('Producto Test Jest');
    productId = res.body.product.id;
  });

  test('cliente NO puede crear producto', async () => {
    const res = await request(app)
      .post('/api/products')
      .set('Authorization', `Bearer ${clientToken}`)
      .send({ name: 'Intento Cliente', price: 50000, stock: 5 });
    expect(res.status).toBe(403);
  });

  test('falla sin nombre', async () => {
    const res = await request(app)
      .post('/api/products')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ price: 99900, stock: 10 });
    expect(res.status).toBe(400);
  });

  test('falla sin precio', async () => {
    const res = await request(app)
      .post('/api/products')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ name: 'Sin Precio', stock: 10 });
    expect(res.status).toBe(400);
  });

  test('falla sin token', async () => {
    const res = await request(app)
      .post('/api/products')
      .send({ name: 'Sin Token', price: 99900 });
    expect(res.status).toBe(401);
  });
});

describe('PUT /api/products/:id', () => {
  test('admin puede actualizar producto', async () => {
    const res = await request(app)
      .put(`/api/products/${productId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ name: 'Producto Actualizado', price: 149900, stock: 20 });
    expect(res.status).toBe(200);
    expect(res.body.product.name).toBe('Producto Actualizado');
  });

  test('cliente NO puede actualizar producto', async () => {
    const res = await request(app)
      .put(`/api/products/${productId}`)
      .set('Authorization', `Bearer ${clientToken}`)
      .send({ name: 'Hackeo', price: 1 });
    expect(res.status).toBe(403);
  });

  test('retorna 404 si el producto no existe', async () => {
    const res = await request(app)
      .put('/api/products/999999')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ name: 'No existe', price: 1000, stock: 1 });
    expect(res.status).toBe(404);
  });
});

describe('DELETE /api/products/:id', () => {
  test('cliente NO puede eliminar producto', async () => {
    const res = await request(app)
      .delete(`/api/products/${productId}`)
      .set('Authorization', `Bearer ${clientToken}`);
    expect(res.status).toBe(403);
  });

  test('admin puede eliminar producto', async () => {
    const res = await request(app)
      .delete(`/api/products/${productId}`)
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
    productId = null;
  });

  test('retorna 404 al eliminar producto inexistente', async () => {
    const res = await request(app)
      .delete('/api/products/999999')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(404);
  });
});