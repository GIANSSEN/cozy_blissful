import React, { useState } from 'react';
import { motion } from 'framer-motion';
import AdminLayout from './AdminLayout';
import { Package, Plus, Search, Filter, AlertTriangle, ArrowUpDown, Edit2, Trash2 } from 'lucide-react';

const INITIAL_PRODUCTS = [
  { id: 1, name: 'Lavender Essential Oil (100ml)', type: 'Internal Supplies', stock: 12, minStock: 15, supplier: 'GreenLeaf Botanicals', price: null },
  { id: 2, name: 'Organic Aloe Vera Lotion (250ml)', type: 'Retail Products', stock: 45, minStock: 20, supplier: 'NatureGlow Co.', price: 549 },
  { id: 3, name: 'Premium Bamboo Massage Roller', type: 'Internal Supplies', stock: 8, minStock: 5, supplier: 'ZenTools Inc.', price: null },
  { id: 4, name: 'Sanitized Cotton Bath Towels', type: 'Internal Supplies', stock: 110, minStock: 50, supplier: 'EcoTextiles Phil', price: null },
  { id: 5, name: 'Signature Spa Aromatherapy Diffuser', type: 'Retail Products', stock: 18, minStock: 10, supplier: 'GreenLeaf Botanicals', price: 1299 },
  { id: 6, name: 'Soothe Organic Chamomile Tea (Box)', type: 'Retail Products', stock: 4, minStock: 10, supplier: 'TeaHaven Suppliers', price: 349 },
];

const AdminProducts = () => {
  const [products, setProducts] = useState(INITIAL_PRODUCTS);
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('All');
  const [sortField, setSortField] = useState('stock');
  const [sortOrder, setSortOrder] = useState('asc');

  const filteredProducts = products
    .filter(p => {
      const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) || p.supplier.toLowerCase().includes(search.toLowerCase());
      const matchType = filterType === 'All' || p.type === filterType || (filterType === 'Low Stock' && p.stock < p.minStock);
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

  return (
    <AdminLayout title="Product Maintenance" subtitle="Manage retail products, internal supplies, check inventory counts and handle supplier alerts">
      <div className="space-y-6">
        {/* Controls bar */}
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="flex items-center gap-2 w-full sm:w-auto">
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
              {['All', 'Retail Products', 'Internal Supplies', 'Low Stock'].map((type) => (
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

        {/* Inventory list */}
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
    </AdminLayout>
  );
};

export default AdminProducts;
