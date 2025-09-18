import express from 'express';
import productsRouter from './routes/products.router.js';
import cartsRouter from './routes/carts.router.js';

const app = express();

app.use(express.json());

// Prefijos requeridos
app.use('/api/products', productsRouter);
app.use('/api/carts', cartsRouter);

// Healthcheck opcional
app.get('/', (req, res) => {
  res.json({ ok: true, msg: 'API up' });
});

// Manejo de errores centralizado
app.use((err, req, res, next) => {
  console.error(err);
  const status = err.status || 500;
  res.status(status).json({ error: err.message || 'Error interno' });
});

const PORT = 8080;
app.listen(PORT, () => {
  console.log(`Servidor escuchando en http://localhost:${PORT}`);
});