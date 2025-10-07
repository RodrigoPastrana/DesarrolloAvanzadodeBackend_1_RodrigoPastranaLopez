import { Router } from 'express';
import ProductManager from '../managers/ProductManager.js';

const router = Router();

// GET /api/products
router.get('/', async (req, res, next) => {
  try {
    const products = await ProductManager.getAll();
    res.json({ status: 'success', payload: products });
  } catch (err) { next(err); }
});

// GET /api/products/:pid
router.get('/:pid', async (req, res, next) => {
  try {
    const prod = await ProductManager.getById(req.params.pid);
    if (!prod) return res.status(404).json({ error: 'Producto no encontrado' });
    res.json({ status: 'success', payload: prod });
  } catch (err) { next(err); }
});

// POST /api/products
router.post('/', async (req, res, next) => {
  try {
    const created = await ProductManager.create(req.body);

    // Emitir a clientes (para que /realtimeproducts se actualice también con HTTP)
    try {
      const io = req.app.get('io');
      io.emit('productsUpdated', await ProductManager.getAll());
    } catch (e) { /* noop */ }

    res.status(201).json({ status: 'success', payload: created });
  } catch (err) { next(err); }
});

// PUT /api/products/:pid  (opcional: emitir también si querés reflejar updates)
router.put('/:pid', async (req, res, next) => {
  try {
    const updated = await ProductManager.update(req.params.pid, req.body);

    try {
      const io = req.app.get('io');
      io.emit('productsUpdated', await ProductManager.getAll());
    } catch (e) { /* noop */ }

    res.json({ status: 'success', payload: updated });
  } catch (err) { next(err); }
});

// DELETE /api/products/:pid
router.delete('/:pid', async (req, res, next) => {
  try {
    const removed = await ProductManager.delete(req.params.pid);

    try {
      const io = req.app.get('io');
      io.emit('productsUpdated', await ProductManager.getAll());
    } catch (e) { /* noop */ }

    res.json({ status: 'success', payload: removed });
  } catch (err) { next(err); }
});

export default router;
