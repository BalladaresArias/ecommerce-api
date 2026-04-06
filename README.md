# 🛒 ShopFlow — Ecommerce API + Frontend

Proyecto fullstack de ecommerce con backend REST en Node.js/Express y frontend en React + Vite.

---

## 📁 Estructura del proyecto

```
ecommerce-api/           ← Backend (Node.js + Express + MySQL)
shopflow-frontend/       ← Frontend (React + Vite)
```

---

## 🚀 Backend — Ecommerce API

### Tecnologías

- **Node.js** + **Express 5**
- **MySQL 2** — base de datos relacional
- **JWT** — autenticación con tokens
- **bcryptjs** — hashing de contraseñas
- **Swagger UI** — documentación interactiva
- **Helmet + CORS + Morgan** — seguridad y logging
- **Nodemailer** — envío de correos
- **Nodemon** — recarga automática en desarrollo

### Endpoints disponibles

| Módulo       | Prefijo            |
|--------------|--------------------|
| Auth         | `/api/auth`        |
| Productos    | `/api/products`    |
| Categorías   | `/api/categories`  |
| Órdenes      | `/api/orders`      |
| Pagos        | `/api/payments`    |
| Documentación| `/api/docs`        |

### Variables de entorno

Crea un archivo `.env` en la raíz del backend con las siguientes variables:

```env
PORT=3000
DB_HOST=localhost
DB_PORT=3306
DB_USER=tu_usuario
DB_PASSWORD=tu_contraseña
DB_NAME=ecommerce_db
JWT_SECRET=tu_secreto_jwt
```

### Instalación y uso

```bash
# Instalar dependencias
npm install

# Modo desarrollo (con recarga automática)
npm run dev

# Modo producción
npm start
```

El servidor quedará disponible en `http://localhost:3000`  
La documentación Swagger en `http://localhost:3000/api/docs`

---

## 💻 Frontend — ShopFlow

### Tecnologías

- **React 19** + **Vite 8**
- **React Router DOM 7** — navegación
- **Axios** — peticiones HTTP
- **Lucide React** — iconos
- **React Hot Toast** — notificaciones
- **Tailwind CSS** — estilos

### Páginas

- `/` — Home
- `/products` — Catálogo de productos
- `/products/:id` — Detalle de producto
- `/login` / `/register` — Autenticación
- `/checkout` — Proceso de compra
- `/payment` — Pago
- `/orders` — Mis órdenes
- `/admin` — Panel de administración

### Variables de entorno

Crea un archivo `.env` en `shopflow-frontend/` con:

```env
VITE_API_URL=http://localhost:3000/api
```

### Instalación y uso

```bash
cd shopflow-frontend

# Instalar dependencias
npm install

# Modo desarrollo
npm run dev

# Build para producción
npm run build
```

El frontend estará disponible en `http://localhost:5173`

---

## ⚡ Inicio rápido (ambos servicios)

```bash
# Terminal 1 — Backend
npm run dev

# Terminal 2 — Frontend
cd shopflow-frontend && npm run dev
```

---

## 📄 Documentación de la API

Una vez el servidor esté corriendo, accede a la documentación interactiva generada con Swagger:

👉 `http://localhost:3000/api/docs`
