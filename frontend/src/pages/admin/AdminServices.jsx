import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import AdminLayout from './AdminLayout';
import API from '../../api/axios';
import { Sparkles, Clock, DollarSign } from 'lucide-react';

const AdminServices = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    API.get('/admin/dashboard')
      .then((r) => setServices(r.data.services || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const serviceIcons = ['🌿', '💆', '🌸', '🪨', '✨', '🧖'];

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-white">Services Management</h2>
          <button className="py-2.5 px-5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold rounded-xl text-sm transition duration-200">
            + Add Service
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-48">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-amber-500" />
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 xl:grid-cols-2 gap-4">
            {services.map((svc, i) => (
              <motion.div
                key={svc.id}
                initial={{ opacity: 0, scale: 0.97 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.08, duration: 0.5 }}
                whileHover={{ scale: 1.02 }}
                className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex items-center space-x-5 hover:border-slate-700 transition"
              >
                <span className="text-4xl">{serviceIcons[i % serviceIcons.length]}</span>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-white text-lg">{svc.name}</p>
                  <div className="flex items-center space-x-4 mt-1.5 text-sm">
                    <span className="flex items-center space-x-1 text-amber-400 font-semibold">
                      <DollarSign className="w-4 h-4" />
                      <span>{svc.price.toFixed(2)}</span>
                    </span>
                    <span className="flex items-center space-x-1 text-slate-400">
                      <Clock className="w-4 h-4" />
                      <span>{svc.duration}</span>
                    </span>
                  </div>
                </div>
                <button className="text-xs text-slate-500 hover:text-amber-400 transition font-medium">Edit</button>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminServices;
