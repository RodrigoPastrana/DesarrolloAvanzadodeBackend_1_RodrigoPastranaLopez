import 'dotenv/config';
import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import exphbs from 'express-handlebars';
import path from 'path';
import { fileURLToPath } from 'url';

import { connectDB } from './config/db.js';
import productsRouter from './routes/products.router.js';
import cartsRouter from './routes/carts.router.js';
import viewsRouter from './routes/views.router.js';
import ProductManager from './managers/ProductManager.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer);


app.set('io', io);


app.use(express.json());
app.use(express.urlencoded({ extended: true }));


app.use('/static', express.static(path.join(__dirname, 'public')));


app.engine('handlebars', exphbs.engine({
  defaultLayout: 'main',
  layoutsDir: path.join(__dirname, 'views', 'layouts'),
  partialsDir: path.join(__dirname, 'views', 'partials'),
  helpers: {
    eq: (a, b) => String(a) === String(b),
  },
}));
app.set('view engine', 'handlebars');
app.set('views', path.join(__dirname, 'views'));


app.use('/', viewsRouter);


app.use('/api/products', productsRouter);
app.use('/api/carts', cartsRouter);


app.get('/health', (req, res) => res.json({ ok: true }));


io.on('connection', async (socket) => {
  
  socket.emit('productsUpdated', await ProductManager.getAll());

 
  socket.on('deleteProduct', async (id) => {
    try {
      await ProductManager.delete(id);
      io.emit('productsUpdated', await ProductManager.getAll());
    } catch (err) {
      socket.emit('errorMessage', err.message || 'Error al eliminar producto');
    }
  });

  socket.on('setStock', async ({ id, stock }) => {
    try {
      const s = Number(stock);
      if (Number.isNaN(s) || s < 0) throw new Error('Stock inválido');
      await ProductManager.update(id, { stock: s });
      io.emit('productsUpdated', await ProductManager.getAll());
    } catch (err) {
      socket.emit('errorMessage', err.message || 'Error al actualizar stock');
    }
  });
});

// Manejo de errores
app.use((err, req, res, next) => {
  console.error(err);

  if (err.name === 'CastError') {
    return res.status(400).json({ error: `Identificador inválido en el campo "${err.path}"` });
  }
  if (err.name === 'ValidationError') {
    const details = Object.values(err.errors).map(e => e.message);
    return res.status(400).json({ error: 'Validación fallida', details });
  }
  if (err.code === 11000) {
    return res.status(409).json({ error: 'El código ya existe', key: err.keyValue });
  }

  const status = err.status || 500;
  res.status(status).json({ error: err.message || 'Error interno' });
});


const PORT = process.env.PORT || 8080;
connectDB().then(() => {
  httpServer.listen(PORT, () => {
    console.log(`Servidor iniciado: http://localhost:${PORT}`);
  });
});
