import { readJSON, writeJSON } from '../utils/file.js';
import ProductManager from './ProductManager.js';

const FILE = 'carts.json';

export default class CartManager {
  static async getAll() {
    return readJSON(FILE);
  }

  static async getById(id) {
    const all = await this.getAll();
    return all.find(c => String(c.id) === String(id)) || null;
  }

  static async create() {
    const all = await this.getAll();
    const nextId = all.length ? (Math.max(...all.map(c => Number(c.id) || 0)) + 1) : 1;
    const cart = { id: nextId, products: [] };
    all.push(cart);
    await writeJSON(FILE, all);
    return cart;
  }

  static async listProducts(cid) {
    const cart = await this.getById(cid);
    if (!cart) {
      const e = new Error('Carrito no encontrado');
      e.status = 404;
      throw e;
    }
    return cart.products;
  }

  static async addProduct(cid, pid) {
    const all = await this.getAll();
    const idx = all.findIndex(c => String(c.id) === String(cid));
    if (idx === -1) {
      const e = new Error('Carrito no encontrado');
      e.status = 404;
      throw e;
    }

    const product = await ProductManager.getById(pid);
    if (!product) {
      const e = new Error('Producto no existe');
      e.status = 404;
      throw e;
    }

    const cart = all[idx];
    const item = cart.products.find(it => String(it.product) === String(pid));
    if (item) {
      item.quantity += 1;
    } else {
      cart.products.push({ product: product.id, quantity: 1 });
    }
    all[idx] = cart;
    await writeJSON(FILE, all);
    return cart;
  }
}