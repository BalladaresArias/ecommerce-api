# 🛒 ShopFlow — Plataforma E-commerce

Plataforma de comercio electrónico fullstack lista para producción, construida con Node.js, React y MySQL.

## ✨ Características

- **Autenticación** con JWT y roles (admin / cliente)
- **Catálogo** con paginación, búsqueda y filtros por categoría
- **Carrito** y proceso de checkout completo
- **Pagos** integrados con Wompi
- **Cupones** de descuento (porcentaje o valor fijo)
- **Gestión de órdenes** con estados y tracking de envío
- **Facturación** en PDF por orden
- **Analytics** con gráficas de ventas, productos y categorías
- **Exportar** órdenes a CSV para contabilidad
- **Chatbot IA** integrado para atención al cliente
- **Importar productos** masivamente desde CSV
- **Panel admin** completo con gestión de productos, categorías, órdenes y cupones

## 🏗️ Stack tecnológico

| Capa | Tecnología |
|------|-----------|
| Backend | Node.js + Express 5 |
| Base de datos | MySQL 2 |
| Autenticación | JWT + bcryptjs |
| Frontend | React 19 + Vite |
| Estilos | Tailwind CSS + CSS custom |
| Pagos | Wompi |
| Email | Resend |
| IA | Gemini API |
| Deploy | Render |

## 🚀 Instalación local

### Requisitos
- Node.js 18+
- MySQL 8+

### Backend

```bash
git clone https://github.com/BalladaresArias/ecommerce-api
cd ecommerce-api
npm install
cp .env.example .env
# Edita .env con tus variables
npm run dev
```

### Base de datos

```bash
# Crea la base de datos
mysql -u root -p -e "CREATE DATABASE ecommerce_db;"
# Importa el schema
mysql -u root -p ecommerce_db < database/schema.sql
```

### Frontend

```bash
cd shopflow-frontend
npm install
cp .env.example .env
# Edita VITE_API_URL=http://localhost:3000/api
npm run dev
```

## 🌐 URLs

| Servicio | URL |
|---------|-----|
| Backend API | http://localhost:3000 |
| Frontend | http://localhost:5173 |
| Documentación Swagger | http://localhost:3000/api/docs |

## 📡 Endpoints principales

| Módulo | Prefijo | Auth |
|--------|---------|------|
| Autenticación | `/api/auth` | Público |
| Productos | `/api/products` | Público / Admin |
| Categorías | `/api/categories` | Público / Admin |
| Órdenes | `/api/orders` | Cliente / Admin |
| Pagos | `/api/payments` | Cliente |
| Cupones | `/api/coupons` | Admin |
| Analytics | `/api/analytics` | Admin |
| Facturas | `/api/invoices` | Cliente / Admin |
| Chat IA | `/api/chat` | Público |

## 🧪 Pruebas

```bash
# Pruebas unitarias y de integración
npm test

# Con reporte de cobertura
npm run test:coverage

# Pruebas de carga
k6 run tests/load/load.test.js
```

### Resultados esperados
- ✅ 44/44 pruebas de lógica
- ✅ 22/22 pruebas de seguridad  
- ✅ p(95) < 2s bajo 100 usuarios simultáneos
- ✅ 0 vulnerabilidades npm

## 🔐 Variables de entorno

Ver `.env.example` para la lista completa de variables requeridas.

## 📦 Deploy en Render

1. Conecta tu repositorio de GitHub en Render
2. Crea un Web Service apuntando a la raíz del proyecto
3. Build command: `npm install`
4. Start command: `node server.js`
5. Agrega todas las variables de `.env.example` en Environment

## 📄 Licencia
MIT
## PRUEBAS

## Pruebas de carga (k6)
- 50 usuarios simultáneos, 3.5 minutos
- 10,052 checks — 100% exitosos
- p(95) = 2.54ms
- 0% errores