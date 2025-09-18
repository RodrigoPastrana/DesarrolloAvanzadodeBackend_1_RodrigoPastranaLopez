import { Router } from 'express';
import CartManager from '../managers/CartManager.js';

const router = Router();

// POST /api/carts
router.post('/', async (req, res, next) => {
  try {
    const cart = await CartManager.create();
    res.status(201).json({ status: 'success', payload: cart });
  } catch (err) { next(err); }
});

// GET /api/carts/:cid
router.get('/:cid', async (req, res, next) => {
  try {
    const products = await CartManager.listProducts(req.params.cid);
    res.json({ status: 'success', payload: products });
  } catch (err) { next(err); }
});

// POST /api/carts/:cid/product/:pid
router.post('/:cid/product/:pid', async (req, res, next) => {
  try {
    const cart = await CartManager.addProduct(req.params.cid, req.params.pid);
    res.status(201).json({ status: 'success', payload: cart });
  } catch (err) { next(err); }
});

export default router;