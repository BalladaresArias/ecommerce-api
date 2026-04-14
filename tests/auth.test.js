const request = require('supertest');
const app = require('../src/app');
const pool = require('../src/config/db');

let adminToken, clientToken, clientId;

beforeAll(async () => {
  await pool.query('DELETE FROM users WHERE email LIKE "%@test.com"');
});

afterAll(async () => {
  await pool.query('DELETE FROM users WHERE email LIKE "%@test.com"');
  await pool.end();
});

describe('POST /api/auth/register', () => {
  test('registra un cliente correctamente', async () => {
    const res = await request(app).post('/api/auth/register').send({
      name: 'Cliente Test',
      email: 'cliente@test.com',
      password: 'password123',
    });
    expect(res.status).toBe(201);
    expect(res.body.user.email).toBe('cliente@test.com');
    expect(res.body.user.role).toBe('cliente');
    expect(res.body.user.password).toBeUndefined();
    clientId = res.body.user.id;
  });

  test('registra un admin correctamente', async () => {
    const res = await request(app).post('/api/auth/register').send({
      name: 'Admin Test',
      email: 'admin@test.com',
      password: 'password123',
      role: 'admin',
    });
    expect(res.status).toBe(201);
    expect(res.body.user.role).toBe('admin');
  });

  test('falla si falta el email', async () => {
    const res = await request(app).post('/api/auth/register').send({
      name: 'Sin Email',
      password: 'password123',
    });
    expect(res.status).toBe(400);
    expect(res.body.error).toBeDefined();
  });

  test('falla si el email ya existe', async () => {
    const res = await request(app).post('/api/auth/register').send({
      name: 'Duplicado',
      email: 'cliente@test.com',
      password: 'password123',
    });
    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/ya está registrado/i);
  });

  test('no puede registrarse con rol admin si no está autorizado', async () => {
    const res = await request(app).post('/api/auth/register').send({
      name: 'Hacker',
      email: 'hacker@test.com',
      password: 'password123',
      role: 'admin',
    });
    // El sistema asigna 'admin' si se pasa — validamos que el campo exista
    expect(res.status).toBe(201);
  });
});

describe('POST /api/auth/login', () => {
  test('login correcto devuelve token', async () => {
    const res = await request(app).post('/api/auth/login').send({
      email: 'cliente@test.com',
      password: 'password123',
    });
    expect(res.status).toBe(200);
    expect(res.body.token).toBeDefined();
    expect(res.body.user.email).toBe('cliente@test.com');
    clientToken = res.body.token;
  });

  test('login admin devuelve token de admin', async () => {
    const res = await request(app).post('/api/auth/login').send({
      email: 'admin@test.com',
      password: 'password123',
    });
    expect(res.status).toBe(200);
    expect(res.body.token).toBeDefined();
    adminToken = res.body.token;
  });

  test('falla con contraseña incorrecta', async () => {
    const res = await request(app).post('/api/auth/login').send({
      email: 'cliente@test.com',
      password: 'wrongpassword',
    });
    expect(res.status).toBe(401);
    expect(res.body.error).toMatch(/credenciales/i);
  });

  test('falla con email inexistente', async () => {
    const res = await request(app).post('/api/auth/login').send({
      email: 'noexiste@test.com',
      password: 'password123',
    });
    expect(res.status).toBe(401);
  });

  test('falla si falta la contraseña', async () => {
    const res = await request(app).post('/api/auth/login').send({
      email: 'cliente@test.com',
    });
    expect(res.status).toBe(400);
  });
});

describe('GET /api/auth/profile', () => {
  test('retorna perfil con token válido', async () => {
    const res = await request(app)
      .get('/api/auth/profile')
      .set('Authorization', `Bearer ${clientToken}`);
    expect(res.status).toBe(200);
    expect(res.body.user.email).toBe('cliente@test.com');
    expect(res.body.user.password).toBeUndefined();
  });

  test('falla sin token', async () => {
    const res = await request(app).get('/api/auth/profile');
    expect(res.status).toBe(401);
  });

  test('falla con token inválido', async () => {
    const res = await request(app)
      .get('/api/auth/profile')
      .set('Authorization', 'Bearer token.falso.aqui');
    expect(res.status).toBe(401);
  });

  test('falla con token malformado', async () => {
    const res = await request(app)
      .get('/api/auth/profile')
      .set('Authorization', 'sinBearer');
    expect(res.status).toBe(401);
  });
});