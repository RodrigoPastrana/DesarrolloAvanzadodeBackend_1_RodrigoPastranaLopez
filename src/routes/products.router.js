import { Router } from 'express';
import ProductManager from '../managers/ProductManager.js';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';

const router = Router();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadDir = path.join(__dirname, '..', 'public', 'uploads');

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname || '');
    const name = Date.now() + '_' + Math.random().toString(36).slice(2) + ext;
    cb(null, name);
  }
});
const upload = multer({ storage });

/* =============================
   GET /api/products
   ============================= */
router.get('/', async (req, res, next) => {
  try {
    const { limit = 10, page = 1, sort, query } = req.query;
    const result = await ProductManager.getAllPaginated({ limit, page, sort, query });

    const baseUrl = `${req.protocol}://${req.get('host')}${req.baseUrl}`;
    const makeLink = (p) =>
      `${baseUrl}?limit=${limit}&page=${p}` +
      (sort ? `&sort=${sort}` : '') +
      (query ? `&query=${encodeURIComponent(query)}` : '');

    res.json({
      status: 'success',
      payload: result.docs,
      totalPages: result.totalPages,
      prevPage: result.hasPrevPage ? result.prevPage : null,
      nextPage: result.hasNextPage ? result.nextPage : null,
      page: result.page,
      hasPrevPage: result.hasPrevPage,
      hasNextPage: result.hasNextPage,
      prevLink: result.hasPrevPage ? makeLink(result.prevPage) : null,
      nextLink: result.hasNextPage ? makeLink(result.nextPage) : null
    });
  } catch (err) { next(err); }
});

/* =============================
   GET /api/products/:pid
   ============================= */
router.get('/:pid', async (req, res, next) => {
  try {
    const prod = await ProductManager.getById(req.params.pid);
    if (!prod) return res.status(404).json({ error: 'Producto no encontrado' });
    res.json({ status: 'success', payload: prod });
  } catch (err) { next(err); }
});

/* =============================
   POST /api/products  (con imágenes)
   ============================= */
router.post('/', upload.array('thumbnails', 6), async (req, res, next) => {
  try {
    const uploaded = (req.files || []).map(f => `/static/uploads/${f.filename}`);

    const urls = [];
    if (req.body.thumbnails) {
      const raw = Array.isArray(req.body.thumbnails) ? req.body.thumbnails : [req.body.thumbnails];
      raw.forEach(s => { const v = String(s).trim(); if (v) urls.push(v); });
    }

    const payload = {
      title: String(req.body.title),
      description: String(req.body.description),
      code: String(req.body.code),
      price: Number(req.body.price),
      status: req.body.status === 'true' || req.body.status === true,
      stock: Number(req.body.stock),
      category: String(req.body.category),
      thumbnails: [...urls, ...uploaded],
    };

    const created = await ProductManager.create(payload);

    try {
      const io = req.app.get('io');
      io.emit('productsUpdated', await ProductManager.getAll());
    } catch (_) {}

    res.status(201).json({ status: 'success', payload: created });
  } catch (err) { next(err); }
});

/* =============================
   PUT /api/products/:pid
   ============================= */
router.put('/:pid', async (req, res, next) => {
  try {
    const updated = await ProductManager.update(req.params.pid, req.body);

    try {
      const io = req.app.get('io');
      io.emit('productsUpdated', await ProductManager.getAll());
    } catch (e) {}

    res.json({ status: 'success', payload: updated });
  } catch (err) { next(err); }
});

/* =============================
   DELETE /api/products/:pid
   ============================= */
router.delete('/:pid', async (req, res, next) => {
  try {
    const removed = await ProductManager.delete(req.params.pid);

    try {
      const io = req.app.get('io');
      io.emit('productsUpdated', await ProductManager.getAll());
    } catch (e) {}

    res.json({ status: 'success', payload: removed });
  } catch (err) { next(err); }
});

export default router;
