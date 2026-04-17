import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate, Trend } from 'k6/metrics';

const BASE_URL = 'https://ecommerce-api-rgsa.onrender.com/api';

const errorRate = new Rate('errors');
const orderDuration = new Trend('order_duration');

// Configuración de etapas de carga
export const options = {
  stages: [
    { duration: '30s', target: 10 }, // Rampa inicial suave
    { duration: '1m',  target: 20 }, // Subida controlada
    { duration: '1m',  target: 50 }, // Meseta de carga media
    { duration: '30s', target: 0  }, // Descenso
  ],
  thresholds: {
    http_req_duration: ['p(95)<2000'], // 95% de requests < 2 segundos
    http_req_failed:   ['rate<0.05'],  // menos del 5% de errores
    errors:            ['rate<0.05'],
  },
};

// Tokens pre-generados para no hacer login en cada request
let clientToken = '';
let adminToken  = '';

export function setup() {
  const loginClient = http.post(`${BASE_URL}/auth/login`,
    JSON.stringify({ email: 'cliente@test.com', password: 'password123' }),
    { headers: { 'Content-Type': 'application/json' } }
  );
  const loginAdmin = http.post(`${BASE_URL}/auth/login`,
    JSON.stringify({ email: 'admin@test.com', password: 'password123' }),
    { headers: { 'Content-Type': 'application/json' } }
  );
  return {
    clientToken: JSON.parse(loginClient.body).token,
    adminToken:  JSON.parse(loginAdmin.body).token,
  };
}

export default function (data) {
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${data.clientToken}`,
  };
  const adminHeaders = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${data.adminToken}`,
  };

  // Escenario 1 — Navegar el catálogo (40% del tráfico)
  if (Math.random() < 0.4) {
    const res = http.get(`${BASE_URL}/products?page=1&limit=12`, { headers });
    check(res, {
      'productos cargaron': r => r.status === 200,
      'tiene productos': r => JSON.parse(r.body).products?.length > 0,
    });
    errorRate.add(res.status !== 200);
    sleep(1);
  }

  // Escenario 2 — Ver un producto (30% del tráfico)
  else if (Math.random() < 0.7) {
    const res = http.get(`${BASE_URL}/products/1`, { headers });
    check(res, { 'producto encontrado': r => r.status === 200 || r.status === 404 });
    errorRate.add(res.status >= 500);
    sleep(0.5);
  }

  // Escenario 3 — Ver mis órdenes (20% del tráfico)
  else if (Math.random() < 0.9) {
    const res = http.get(`${BASE_URL}/orders/my-orders`, { headers });
    check(res, { 'órdenes cargaron': r => r.status === 200 });
    errorRate.add(res.status !== 200);
    sleep(1);
  }

  // Escenario 4 — Admin ve todas las órdenes (10% del tráfico)
  else {
    const start = Date.now();
    const res = http.get(`${BASE_URL}/orders?page=1&limit=20`, { headers: adminHeaders });
    orderDuration.add(Date.now() - start);
    check(res, { 'admin ve órdenes': r => r.status === 200 });
    errorRate.add(res.status !== 200);
    sleep(2);
  }
}