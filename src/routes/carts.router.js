import { Router } from 'express';
import CartManager from '../managers/CartManager.js';

const router = Router();


router.post('/', async (req, res, next) => {
  try {
    const cart = await CartManager.create();
    res.status(201).json({ status: 'success', payload: cart });
  } catch (err) { next(err); }
});


router.get('/:cid', async (req, res, next) => {
  try {
    const products = await CartManager.listProductsPopulated(req.params.cid);
    res.json({ status: 'success', payload: products });
  } catch (err) { next(err); }
});


router.post('/:cid/product/:pid', async (req, res, next) => {
  try {
    const cart = await CartManager.addProduct(req.params.cid, req.params.pid);
    res.status(201).json({ status: 'success', payload: cart });
  } catch (err) { next(err); }
});

// DELETE api/carts/:cid/products/:pid — eliminar ese producto del carrito
router.delete('/:cid/products/:pid', async (req, res, next) => {
  try {
    const cart = await CartManager.removeProduct(req.params.cid, req.params.pid);
    res.json({ status: 'success', payload: cart });
  } catch (err) { next(err); }
});

// PUT api/carts/:cid — reemplazar TODOS los productos del carrito
router.put('/:cid', async (req, res, next) => {
  try {
    const cart = await CartManager.replaceProducts(req.params.cid, req.body.products || []);
    res.json({ status: 'success', payload: cart });
  } catch (err) { next(err); }
});

// PUT api/carts/:cid/products/:pid — setear cantidad del producto
router.put('/:cid/products/:pid', async (req, res, next) => {
  try {
    const { quantity } = req.body;
    const cart = await CartManager.setProductQuantity(req.params.cid, req.params.pid, quantity);
    res.json({ status: 'success', payload: cart });
  } catch (err) { next(err); }
});

// DELETE api/carts/:cid — vaciar carrito
router.delete('/:cid', async (req, res, next) => {
  try {
    const cart = await CartManager.clear(req.params.cid);
    res.json({ status: 'success', payload: cart });
  } catch (err) { next(err); }
});

export default router;
