import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import AdminLayout from './AdminLayout';
import {
  Package, Plus, Search, AlertTriangle, Edit2, Trash2,
  Truck, Boxes, PackageCheck, Clock,
} from 'lucide-react';

const INITIAL_PRODUCTS = [
  { id: 1, name: 'Lavender Essential Oil (100ml)', type: 'Internal Supplies', stock: 12, minStock: 15, supplier: 'GreenLeaf Botanicals', price: null },
  { id: 2, name: 'Organic Aloe Vera Lotion (250ml)', type: 'Retail Products', stock: 45, minStock: 20, supplier: 'NatureGlow Co.', price: 549 },
  { id: 3, name: 'Premium Bamboo Massage Roller', type: 'Internal Supplies', stock: 8, minStock: 5, supplier: 'ZenTools Inc.', price: null },
  { id: 4, name: 'Sanitized Cotton Bath Towels', type: 'Internal Supplies', stock: 110, minStock: 50, supplier: 'EcoTextiles Phil', price: null },
  { id: 5, name: 'Signature Spa Aromatherapy Diffuser', type: 'Retail Products', stock: 18, minStock: 10, supplier: 'GreenLeaf Botanicals', price: 1299 },
  { id: 6, name: 'Soothe Organic Chamomile Tea (Box)', type: 'Retail Products', stock: 4, minStock: 10, supplier: 'TeaHaven Suppliers', price: 349 },
];

/* ── Mock incoming purchase orders ───────────────────────────────── */
const MOCK_ORDERS = [
  { id: 1, supplier: 'GreenLeaf Botanicals', items: 'Lavender Essential Oil x30', status: 'In Transit', eta: '2026-07-21' },
  { id: 2, supplier: 'TeaHaven Suppliers', items: 'Chamomile Tea Box x25', status: 'Pending', eta: '2026-07-24' },
  { id: 3, supplier: 'ZenTools Inc.', items: 'Bamboo Massage Roller x15', status: 'Delivered', eta: '2026-07-12' },
];

const ORDER_STATUS_STYLES = {
  'In Transit': 'bg-blue-50 text-blue-800 border-blue-100',
  Pending:      'bg-amber-50 text-amber-800 border-amber-100',
  Delivered:    'bg-emerald-50 text-emerald-800 border-emerald-100',
};

const AdminProducts = () => {
  const [searchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'retail';

  const [products] = useState(INITIAL_PRODUCTS);
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('All');
  const [sortField, setSortField] = useState('stock');
  const [sortOrder, setSortOrder] = useState('asc');

  const filteredProducts = products
    .filter(p => {
      const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) || p.supplier.toLowerCase().includes(search.toLowerCase());
      const matchType = filterType === 'All' || p.type === filterType;
      return matchSearch && matchType;
    })
    .sort((a, b) => {
      let fieldA = a[sortField];
      let fieldB = b[sortField];
      if (typeof fieldA === 'string') {
        fieldA = fieldA.toLowerCase();
        fieldB = fieldB.toLowerCase();
      }
      if (fieldA < fieldB) return sortOrder === 'asc' ? -1 : 1;
      if (fieldA > fieldB) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

  const toggleSort = (field) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const lowStockProducts = products.filter(p => p.stock < p.minStock).sort((a, b) => a.stock - b.stock);

  const suppliers = Array.from(new Set(products.map(p => p.supplier))).map(name => ({
    name,
    itemCount: products.filter(p => p.supplier === name).length,
    lowStockCount: products.filter(p => p.supplier === name && p.stock < p.minStock).length,
  }));

  const getPageTitle = () => {
    switch (activeTab) {
      case 'stock': return 'Stock Control';
      case 'suppliers': return 'Suppliers & Orders';
      case 'retail':
      default: return 'Product Catalog';
    }
  };

  return (
    <AdminLayout title="Inventory" subtitle={getPageTitle()}>
      <div className="space-y-6">

        {/* ── Tab Content: Product Catalog ── */}
        {activeTab === 'retail' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
              <div className="flex items-center gap-2 w-full sm:w-auto flex-wrap">
                <div className="relative flex-1 sm:w-64">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search products or suppliers..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-800"
                    style={{ background: '#faf9f6' }}
                  />
                </div>
                <div className="flex gap-1.5">
                  {['All', 'Retail Products', 'Internal Supplies'].map((type) => (
                    <button
                      key={type}
                      onClick={() => setFilterType(type)}
                      className={`px-3 py-2 rounded-xl text-xs font-semibold transition ${
                        filterType === type
                          ? 'bg-emerald-950 text-white'
                          : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>
              <button className="flex items-center gap-1.5 px-4 py-2 bg-emerald-950 text-white rounded-xl text-xs font-bold hover:bg-emerald-900 transition-all self-end sm:self-auto">
                <Plus className="w-3.5 h-3.5" /> Add Product
              </button>
            </div>

            <div className="bg-white border border-slate-100 rounded-3xl overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-100 text-slate-400 text-[10px] font-bold uppercase tracking-wider bg-slate-50/50">
                      <th className="py-4 px-6">Product Name</th>
                      <th className="py-4 px-6 cursor-pointer" onClick={() => toggleSort('type')}>Type</th>
                      <th className="py-4 px-6 cursor-pointer" onClick={() => toggleSort('stock')}>Stock Status</th>
                      <th className="py-4 px-6">Supplier</th>
                      <th className="py-4 px-6 cursor-pointer" onClick={() => toggleSort('price')}>Retail Price</th>
                      <th className="py-4 px-6 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                    {filteredProducts.length === 0 ? (
                      <tr>
                        <td colSpan="6" className="py-12 text-center text-slate-400">
                          <Package className="w-12 h-12 text-slate-200 mx-auto mb-3" />
                          <p className="font-bold">No products found</p>
                          <p className="text-[11px] mt-0.5">Try adjusting your filters or search keywords.</p>
                        </td>
                      </tr>
                    ) : (
                      filteredProducts.map((p) => {
                        const isLow = p.stock < p.minStock;
                        return (
                          <tr key={p.id} className="hover:bg-slate-50/50 transition">
                            <td className="py-4 px-6 font-bold text-slate-800">{p.name}</td>
                            <td className="py-4 px-6">
                              <span className={`px-2 py-0.5 rounded-full font-semibold text-[10px] ${
                                p.type === 'Retail Products' ? 'bg-amber-50 text-amber-800 border border-amber-100' : 'bg-blue-50 text-blue-800 border border-blue-100'
                              }`}>
                                {p.type}
                              </span>
                            </td>
                            <td className="py-4 px-6">
                              <div className="flex items-center gap-2">
                                <span className={`font-black ${isLow ? 'text-red-500' : 'text-slate-700'}`}>
                                  {p.stock}
                                </span>
                                <span className="text-slate-400">/ {p.minStock} min</span>
                                {isLow && (
                                  <span className="flex items-center gap-0.5 text-[10px] text-red-600 bg-red-50 px-2 py-0.5 rounded-full font-bold">
                                    <AlertTriangle className="w-3 h-3" /> Low Stock
                                  </span>
                                )}
                              </div>
                            </td>
                            <td className="py-4 px-6 text-slate-500">{p.supplier}</td>
                            <td className="py-4 px-6 font-bold">
                              {p.price ? `₱${p.price.toLocaleString()}` : <span className="text-slate-300">—</span>}
                            </td>
                            <td className="py-4 px-6 text-right space-x-2">
                              <button className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-500 hover:text-slate-700 transition">
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              <button className="p-1.5 hover:bg-red-50 rounded-lg text-slate-400 hover:text-red-600 transition">
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ── Tab Content: Stock Control ── */}
        {activeTab === 'stock' && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              <div className="bg-white border border-slate-100 rounded-3xl p-5 shadow-sm">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Total SKUs</p>
                <p className="text-2xl font-black text-slate-800 mt-1">{products.length}</p>
              </div>
              <div className="bg-white border border-slate-100 rounded-3xl p-5 shadow-sm">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Low Stock Alerts</p>
                <p className="text-2xl font-black text-red-500 mt-1">{lowStockProducts.length}</p>
              </div>
              <div className="bg-white border border-slate-100 rounded-3xl p-5 shadow-sm col-span-2 sm:col-span-1">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Healthy Stock</p>
                <p className="text-2xl font-black text-emerald-800 mt-1">{products.length - lowStockProducts.length}</p>
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-red-500" /> Items Below Minimum Stock
              </h3>
              {lowStockProducts.length === 0 ? (
                <div className="bg-white border border-slate-100 rounded-3xl p-8 text-center shadow-sm">
                  <PackageCheck className="w-10 h-10 text-emerald-400 mx-auto mb-2" />
                  <p className="text-sm font-bold text-slate-700">All stock levels are healthy</p>
                </div>
              ) : (
                <div className="grid gap-3">
                  {lowStockProducts.map(p => (
                    <div key={p.id} className="bg-white border border-slate-100 rounded-3xl p-4 shadow-sm flex items-center justify-between gap-4 hover:shadow-md transition">
                      <div>
                        <p className="font-bold text-slate-800 text-sm">{p.name}</p>
                        <p className="text-[11px] text-slate-400 mt-0.5">Supplied by {p.supplier}</p>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <span className="font-black text-red-500 text-sm">{p.stock}</span>
                        <span className="text-slate-400 text-xs">/ {p.minStock} min</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── Tab Content: Suppliers & Orders ── */}
        {activeTab === 'suppliers' && (
          <div className="space-y-6">
            <div className="space-y-3">
              <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                <Boxes className="w-4 h-4 text-slate-500" /> Supplier Directory
              </h3>
              <div className="grid gap-4 sm:grid-cols-2">
                {suppliers.map(s => (
                  <div key={s.name} className="bg-white border border-slate-100 rounded-3xl p-5 shadow-sm flex items-center justify-between gap-4 hover:shadow-md transition">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-slate-50 text-slate-500 flex items-center justify-center flex-shrink-0">
                        <Truck className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="font-bold text-slate-800 text-sm">{s.name}</p>
                        <p className="text-[11px] text-slate-400 mt-0.5">{s.itemCount} product{s.itemCount !== 1 ? 's' : ''} supplied</p>
                      </div>
                    </div>
                    {s.lowStockCount > 0 && (
                      <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-red-50 text-red-600 border border-red-100 flex-shrink-0">
                        {s.lowStockCount} low
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                  <Clock className="w-4 h-4 text-slate-500" /> Incoming Purchase Orders
                </h3>
                <button className="flex items-center gap-1.5 px-4 py-2 bg-emerald-950 text-white rounded-xl text-xs font-bold hover:bg-emerald-900 transition-all">
                  <Plus className="w-3.5 h-3.5" /> New Order
                </button>
              </div>
              <div className="bg-white border border-slate-100 rounded-3xl overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-slate-100 text-slate-400 text-[10px] font-bold uppercase tracking-wider bg-slate-50/50">
                        <th className="py-4 px-6">Supplier</th>
                        <th className="py-4 px-6">Items</th>
                        <th className="py-4 px-6">ETA</th>
                        <th className="py-4 px-6">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                      {MOCK_ORDERS.map(o => (
                        <tr key={o.id} className="hover:bg-slate-50/50 transition">
                          <td className="py-4 px-6 font-bold text-slate-800">{o.supplier}</td>
                          <td className="py-4 px-6 text-slate-500">{o.items}</td>
                          <td className="py-4 px-6 text-slate-500">{o.eta}</td>
                          <td className="py-4 px-6">
                            <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${ORDER_STATUS_STYLES[o.status]}`}>
                              {o.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </AdminLayout>
  );
};

export default AdminProducts;
