import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import path from 'path';
import { fileURLToPath } from 'url';
import exphbs from 'express-handlebars';

import productsRouter from './routes/products.router.js';
import cartsRouter from './routes/carts.router.js';
import viewsRouter from './routes/views.router.js';
import ProductManager from './managers/ProductManager.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer);

// para emitir también desde HTTP (POST/PUT/DELETE)
app.set('io', io);

app.use(express.json());

// Handlebars
app.engine('handlebars', exphbs.engine({
  defaultLayout: 'main',
  layoutsDir: path.join(__dirname, 'views', 'layouts'),
  partialsDir: path.join(__dirname, 'views', 'partials'),
}));
app.set('view engine', 'handlebars');
app.set('views', path.join(__dirname, 'views'));

// Vistas
app.use('/', viewsRouter);

// APIs
app.use('/api/products', productsRouter);
app.use('/api/carts', cartsRouter);

// Health
app.get('/health', (req, res) => res.json({ ok: true }));

// --- Socket.IO (sin logs ruidosos) ---
io.on('connection', async (socket) => {
  // console.log('Cliente conectado:', socket.id);
  socket.emit('productsUpdated', await ProductManager.getAll());

  socket.on('createProduct', async (payload) => {
    try {
      await ProductManager.create(payload);
      io.emit('productsUpdated', await ProductManager.getAll());
    } catch (err) {
      socket.emit('errorMessage', err.message || 'Error al crear producto');
    }
  });

  socket.on('deleteProduct', async (id) => {
    try {
      await ProductManager.delete(id);
      io.emit('productsUpdated', await ProductManager.getAll());
    } catch (err) {
      socket.emit('errorMessage', err.message || 'Error al eliminar producto');
    }
  });
});

// Errores
app.use((err, req, res, next) => {
  // log mínimo de errores
  console.error(err.message || err);
  res.status(err.status || 500).json({ error: err.message || 'Error interno' });
});

const PORT = 8080; // o 4040 si lo venías usando
httpServer.listen(PORT, () => {
  console.log(`Servidor iniciado: http://localhost:${PORT}`);
});
