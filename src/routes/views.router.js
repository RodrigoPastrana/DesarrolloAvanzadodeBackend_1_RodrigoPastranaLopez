import { Router } from 'express';
import ProductManager from '../managers/ProductManager.js';

const router = Router();

// GET "/" — lista por SSR (sin realtime)
router.get('/', async (req, res, next) => {
  try {
    const products = await ProductManager.getAll();
    res.render('home', { title: 'Inicio', products });
  } catch (err) { next(err); }
});

// GET "/realtimeproducts" — vista con sockets
router.get('/realtimeproducts', async (req, res, next) => {
  try {
    const products = await ProductManager.getAll();
    res.render('realTimeProducts', { title: 'Control de Productos', products });
  } catch (err) { next(err); }
});

export default router;
