# API eCommerce (Node + Express + Mongo + Handlebars + WebSockets)
Proyecto Full Stack que implementa un eCommerce básico con vistas renderizadas, conexión a MongoDB Atlas y comunicación en tiempo real.


## 📦 Requisitos
- Node 18+ o superior
- Cuenta en MongoDB Atlas (o Mongo local)
- Navegador compatible con ES6

## ⚙️ Variables de entorno
Crea un archivo `.env` (basate en `.env.example`):
MONGO_URI=mongodb+srv://<usuario>:<contraseña>@<cluster>/<nombre_db>?retryWrites=true&w=majority
PORT=8080

## 🚀 Instalación y ejecución
npm install
npm run dev
Luego abrí http://localhost:8080

## 📚 Endpoints principales
# Productos
GET /api/products?limit=&page=&sort=&query=
GET /api/products/:pid
POST /api/products
PUT /api/products/:pid
DELETE /api/products/:pid

# Carritos
POST /api/carts
GET /api/carts/:cid
POST /api/carts/:cid/product/:pid
PUT /api/carts/:cid
PUT /api/carts/:cid/products/:pid
DELETE /api/carts/:cid/products/:pid
DELETE /api/carts/:cid

## 🧩 Funcionalidades destacadas
- MongoDB Atlas como sistema de persistencia principal.
- Paginación, filtros y orden dinámico de productos.
- Carrito completamente funcional (alta, baja, modificación).
- Interfaz en tiempo real con Socket.IO.
- Handlebars como motor de plantillas SSR.
- Eliminación de productos con actualización instantánea.
- Manejo de errores y validaciones.
- Diseño mejorado con botones por color y navbar estilizado.
- Las imágenes subidas por los usuarios se almacenan localmente (en `src/public/uploads`) y están ignoradas, por lo que no se subirán al repositorio.

## 🧑‍💻 Autor
Rodrigo Pastrana
Proyecto académico - Coderhouse / 2025