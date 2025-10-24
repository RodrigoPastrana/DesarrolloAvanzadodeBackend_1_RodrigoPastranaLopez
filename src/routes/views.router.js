import { Router } from 'express';
import ProductManager from '../managers/ProductManager.js';
import CartManager from '../managers/CartManager.js';
import Product from '../models/Product.model.js'; 

const router = Router();


router.get('/', (req, res) => res.redirect('/products'));


router.get('/realtimeproducts', async (req, res, next) => {
  try {
    const products = await ProductManager.getAll();
    res.render('realTimeProducts', { title: 'Control de Productos', products });
  } catch (err) { next(err); }
});


router.get('/products', async (req, res, next) => {
  try {
    const { limit = 10, page = 1, sort, query } = req.query;
    const result = await ProductManager.getAllPaginated({ limit, page, sort, query });

    const buildQ = (p) =>
      `/products?limit=${limit}&page=${p}` +
      (sort ? `&sort=${sort}` : '') +
      (query ? `&query=${encodeURIComponent(query)}` : '');

    res.render('products', {
      title: 'Productos',
      products: result.docs,
      page: result.page,
      totalPages: result.totalPages,
      hasPrevPage: result.hasPrevPage,
      hasNextPage: result.hasNextPage,
      prevLink: result.hasPrevPage ? buildQ(result.prevPage) : null,
      nextLink: result.hasNextPage ? buildQ(result.nextPage) : null,
      sort,
      query,
      limit
    });
  } catch (err) { next(err); }
});


router.get('/carts/:cid', async (req, res, next) => {
  try {
    const products = await CartManager.listProductsPopulated(req.params.cid);
    res.render('cart', { title: 'Carrito', products, cid: req.params.cid });
  } catch (err) { next(err); }
});

router.get('/products/:pid', async (req, res, next) => {
  try {
    const prod = await Product.findById(req.params.pid).lean();
    if (!prod) return res.status(404).render('home', { title: 'Producto no encontrado', products: [] });
    res.render('productDetail', { title: prod.title, product: prod });
  } catch (err) { next(err); }
});

export default router;
