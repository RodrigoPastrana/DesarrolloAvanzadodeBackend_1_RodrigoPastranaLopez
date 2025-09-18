import { readJSON, writeJSON } from '../utils/file.js';

const FILE = 'products.json';

export default class ProductManager {
  static async getAll() {
    return readJSON(FILE);
  }

  static async getById(id) {
    const all = await this.getAll();
    return all.find(p => String(p.id) === String(id)) || null;
  }

  static async create(data) {
    const all = await this.getAll();

    // Validaciones mínimas
    const required = ['title','description','code','price','status','stock','category'];
    for (const f of required) {
      if (data[f] === undefined) {
        const e = new Error(`Campo requerido faltante: ${f}`);
        e.status = 400;
        throw e;
      }
    }

    // code único
    if (all.some(p => p.code === data.code)) {
      const e = new Error(`El code "${data.code}" ya existe`);
      e.status = 409;
      throw e;
    }

    // Autoincremental simple
    const nextId = all.length ? (Math.max(...all.map(p => Number(p.id) || 0)) + 1) : 1;

    const product = {
      id: nextId,
      title: String(data.title),
      description: String(data.description),
      code: String(data.code),
      price: Number(data.price),
      status: Boolean(data.status),
      stock: Number(data.stock),
      category: String(data.category),
      thumbnails: Array.isArray(data.thumbnails) ? data.thumbnails.map(String) : []
    };

    all.push(product);
    await writeJSON(FILE, all);
    return product;
  }

  static async update(id, updates) {
    if ('id' in updates) {
      const e = new Error('No se permite actualizar el id');
      e.status = 400;
      throw e;
    }
    const all = await this.getAll();
    const idx = all.findIndex(p => String(p.id) === String(id));
    if (idx === -1) {
      const e = new Error('Producto no encontrado');
      e.status = 404;
      throw e;
    }

    // No permitir duplicar code al actualizar
    if ('code' in updates) {
      const dup = all.find(p => p.code === updates.code && String(p.id) !== String(id));
      if (dup) {
        const e = new Error(`El code "${updates.code}" ya está en uso`);
        e.status = 409;
        throw e;
      }
    }

    const updated = { ...all[idx], ...updates };
    all[idx] = updated;
    await writeJSON(FILE, all);
    return updated;
  }

  static async delete(id) {
    const all = await this.getAll();
    const idx = all.findIndex(p => String(p.id) === String(id));
    if (idx === -1) {
      const e = new Error('Producto no encontrado');
      e.status = 404;
      throw e;
    }
    const [removed] = all.splice(idx, 1);
    await writeJSON(FILE, all);
    return removed;
  }
}