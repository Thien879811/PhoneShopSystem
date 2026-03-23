import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3000/api',
});

export interface Product {
  id: number;
  code: string;
  name: string;
  category: string;
  brand: string;
  categoryId?: number;
  brandId?: number;
  categoryRel?: Category;
  brandRel?: Brand;
  unit: string;
  barcode: string;
  sellPrice: number;
  minStock: number;
  image: string;
  status: string;
  createdAt: string;
}

export const productsApi = {
  getAll: async (params: any = {}) => {
    const res = await api.get('/products', { params });
    return res.data;
  },
  getById: async (id: number) => (await api.get(`/products/${id}`)).data,
  create: async (data: Partial<Product>) => (await api.post('/products', data)).data,
  update: async (id: number, data: Partial<Product>) => (await api.put(`/products/${id}`, data)).data,
  delete: async (id: number) => (await api.delete(`/products/${id}`)).data,
};

// ─── SUPPLIERS ────────────────────────────────
export interface Supplier {
  id: number;
  name: string;
  phone: string;
  email: string;
  address: string;
  note: string;
  createdAt: string;
}

export const suppliersApi = {
  getAll: async (params: any = {}) => {
    const res = await api.get('/suppliers', { params });
    return res.data;
  },
  getById: async (id: number) => (await api.get(`/suppliers/${id}`)).data,
  create: async (data: Partial<Supplier>) => (await api.post('/suppliers', data)).data,
  update: async (id: number, data: Partial<Supplier>) => (await api.put(`/suppliers/${id}`, data)).data,
  delete: async (id: number) => (await api.delete(`/suppliers/${id}`)).data,
};

// ─── IMPORT RECEIPTS ─────────────────────────
export interface ImportReceiptItem {
  id?: number;
  productId: number;
  productName?: string;
  quantity: number;
  importPrice: number;
  totalPrice?: number;
  imeis?: string[];
}

export interface ImportReceipt {
  id: number;
  code: string;
  supplierId: number;
  supplier?: Supplier;
  importDate: string;
  totalAmount: number;
  note: string;
  status: string;
  items: ImportReceiptItem[];
  createdAt: string;
}

export const importsApi = {
  getAll: async (params: any = {}) => {
    const res = await api.get('/imports', { params });
    return res.data;
  },
  getById: async (id: number) => (await api.get(`/imports/${id}`)).data,
  create: async (data: any) => (await api.post('/imports', data)).data,
  delete: async (id: number) => (await api.delete(`/imports/${id}`)).data,
};

// ─── STOCKS ──────────────────────────────────
export interface StockSummary {
  productId: number;
  productCode: string;
  productName: string;
  category: string;
  brand: string;
  minStock: number;
  totalRemaining: number;
  totalImported: number;
  lowStock: boolean;
}

export interface StockMovement {
  id: number;
  productId: number;
  productName: string;
  referenceType: string;
  referenceId: number;
  referenceCode: string;
  quantity: number;
  movementType: string;
  createdAt: string;
}

export interface DashboardStats {
  totalProducts: number;
  totalStock: number;
  lowStockCount: number;
  recentMovements: StockMovement[];
}

export const stocksApi = {
  getSummary: async (params: any = {}) => {
    const res = await api.get('/stocks/summary', { params });
    return res.data;
  },
  getDashboard: async () => {
    const res = await api.get('/stocks/dashboard');
    return res.data;
  },
  getMovements: async (params: any = {}) => {
    const res = await api.get('/stocks/movements', { params });
    return res.data;
  },
  getByProduct: async (productId: number) => {
    const res = await api.get(`/stocks/product/${productId}`);
    return res.data;
  },
};

// ─── SALES ───────────────────────────────────
export interface SalesInvoiceItem {
  id?: number;
  productId: number;
  productName?: string;
  quantity: number;
  price: number;
  total?: number;
  imeis?: string[];
}

export interface SalesInvoice {
  id: number;
  code: string;
  customerName: string;
  customerPhone: string;
  totalAmount: number;
  note: string;
  status: string;
  items: SalesInvoiceItem[];
  createdAt: string;
}

export const salesApi = {
  getAll: async (params: any = {}) => {
    const res = await api.get('/sales', { params });
    return res.data;
  },
  getById: async (id: number) => (await api.get(`/sales/${id}`)).data,
  create: async (data: any) => (await api.post('/sales', data)).data,
  delete: async (id: number) => (await api.delete(`/sales/${id}`)).data,
};

// ─── CATEGORIES ──────────────────────────────
export interface Category {
  id: number;
  name: string;
  prefix: string;
  description: string;
  createdAt: string;
}

export const categoriesApi = {
  getAll: async () => (await api.get('/categories')).data,
  create: async (data: Partial<Category>) => (await api.post('/categories', data)).data,
  update: async (id: number, data: Partial<Category>) => (await api.put(`/categories/${id}`, data)).data,
  delete: async (id: number) => (await api.delete(`/categories/${id}`)).data,
};

// ─── BRANDS ──────────────────────────────────
export interface Brand {
  id: number;
  name: string;
  origin: string;
  description: string;
  createdAt: string;
}

export const brandsApi = {
  getAll: async () => (await api.get('/brands')).data,
  create: async (data: Partial<Brand>) => (await api.post('/brands', data)).data,
  update: async (id: number, data: Partial<Brand>) => (await api.put(`/brands/${id}`, data)).data,
  delete: async (id: number) => (await api.delete(`/brands/${id}`)).data,
};

// ─── REPAIRS ─────────────────────────────────
export interface RepairOrderItem {
  id: number;
  serviceId: number;
  serviceName: string;
  serviceType: 'REPAIR' | 'REPLACEMENT';
  productId?: number;
  quantity: number;
  price: number;
  total: number;
  createdAt: string;
}

export interface RepairOrder {
  id: number;
  code: string;
  customerId?: number;
  customerName?: string;
  customerPhone?: string;
  deviceName: string;
  imei?: string;
  issueDescription?: string;
  receivedDate: string;
  expectedReturnDate?: string;
  totalAmount: number;
  status: string;
  note?: string;
  items: RepairOrderItem[];
  logs: any[];
  createdAt: string;
}

export interface RepairService {
  id: number;
  name: string;
  serviceType: 'REPAIR' | 'REPLACEMENT';
  defaultPrice: number;
  productId?: number;
  description?: string;
  status: string;
  createdAt: string;
}

export const repairsApi = {
  getAll: async (params: any = {}) => (await api.get('/repair-orders', { params })).data,
  getById: async (id: number) => (await api.get(`/repair-orders/${id}`)).data,
  create: async (data: any) => (await api.post('/repair-orders', data)).data,
  update: async (id: number, data: any) => (await api.put(`/repair-orders/${id}`, data)).data,
  addService: async (id: number, data: any) => (await api.post(`/repair-orders/${id}/add-service`, data)).data,
  addItem: async (id: number, item: any) => (await api.post(`/repair-orders/${id}/items`, item)).data, // Keep for backward compat
  removeItem: async (id: number, itemId: number) => (await api.delete(`/repair-orders/${id}/items/${itemId}`)).data,
  complete: async (id: number) => (await api.post(`/repair-orders/${id}/complete`)).data,
  quickImport: async (data: any) => (await api.post('/repair-orders/quick-import', data)).data,
  // Standard Services
  getAllServices: async () => (await api.get('/repair-orders/services')).data,
  createService: async (data: any) => (await api.post('/repair-orders/services', data)).data,
};

export default api;
