import Product from '../models/Product.model.js';

export default class ProductManager {
  
  static async getAll() {
    return Product.find().lean();
  }

  static async getById(id) {
    return Product.findById(id).lean();
  }

  static async create(data) {
    const doc = await Product.create(data);
    return doc.toObject ? doc.toObject() : doc;
  }

  static async update(id, updates) {
   
    delete updates._id;
    return Product.findByIdAndUpdate(id, updates, {
      new: true, runValidators: true, lean: true
    });
  }

  static async delete(id) {
    return Product.findByIdAndDelete(id).lean();
  }


  static async getAllPaginated({ limit = 10, page = 1, sort, query }) {
    const filter = {};
    const q = (query ?? '').trim();

    if (q) {
      if (q.includes(':')) {
        
        const [key, raw] = q.split(':');
        if (key === 'category' && raw) {
          filter.category = new RegExp(`^${raw}$`, 'i'); 
        }
        if (key === 'status' && raw !== undefined) {
          filter.status = (raw === 'true');
        }
      } else {
        
        filter.category = new RegExp(`^${q}$`, 'i');
      }
    }

    const sortOpt = {};
    if (sort === 'asc') sortOpt.price = 1;
    if (sort === 'desc') sortOpt.price = -1;

    const result = await Product.paginate(filter, {
      limit: Number(limit) || 10,
      page: Number(page) || 1,
      sort: Object.keys(sortOpt).length ? sortOpt : undefined,
      lean: true
    });

    return result;
  }

}
