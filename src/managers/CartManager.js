import Cart from '../models/Cart.model.js';
import Product from '../models/Product.model.js';

export default class CartManager {
  static async create() {
    return Cart.create({ products: [] });
  }

  static async listProductsPopulated(cid) {
    const cart = await Cart.findById(cid).populate('products.product').lean();
    if (!cart) { const e = new Error('Carrito no encontrado'); e.status = 404; throw e; }
    return cart.products;
  }

  static async addProduct(cid, pid) {
    const cart = await Cart.findById(cid);
    if (!cart) { const e = new Error('Carrito no encontrado'); e.status = 404; throw e; }

    const prod = await Product.findById(pid);
    if (!prod) { const e = new Error('Producto no encontrado'); e.status = 404; throw e; }

    const item = cart.products.find(p => String(p.product) === String(pid));
    if (item) item.quantity += 1;
    else cart.products.push({ product: pid, quantity: 1 });

    await cart.save();
    return cart;
  }

  
  static async removeProduct(cid, pid) {
    const cart = await Cart.findById(cid);
    if (!cart) { const e = new Error('Carrito no encontrado'); e.status = 404; throw e; }
    cart.products = cart.products.filter(p => String(p.product) !== String(pid));
    await cart.save();
    return cart;
  }

 
  static async replaceProducts(cid, productsArray) {
    const cart = await Cart.findById(cid);
    if (!cart) { const e = new Error('Carrito no encontrado'); e.status = 404; throw e; }

    cart.products = (productsArray || []).map(p => ({
      product: p.product,
      quantity: Number(p.quantity) > 0 ? Number(p.quantity) : 1
    }));

    await cart.save();
    return cart;
  }

  
  static async setProductQuantity(cid, pid, quantity) {
    const cart = await Cart.findById(cid);
    if (!cart) { const e = new Error('Carrito no encontrado'); e.status = 404; throw e; }
    const item = cart.products.find(p => String(p.product) === String(pid));
    if (!item) { const e = new Error('Producto no está en el carrito'); e.status = 404; throw e; }
    item.quantity = Number(quantity);
    await cart.save();
    return cart;
  }

 
  static async clear(cid) {
    const cart = await Cart.findById(cid);
    if (!cart) { const e = new Error('Carrito no encontrado'); e.status = 404; throw e; }
    cart.products = [];
    await cart.save();
    return cart;
  }
}
