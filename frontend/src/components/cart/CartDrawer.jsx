import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  ShoppingBag,
  X,
  Plus,
  Minus,
  Trash2,
  ArrowRight,
  Sparkles,
  Clock,
  ShieldCheck,
} from 'lucide-react';
import { useCart } from '../../context/CartContext';

export default function CartDrawer() {
  const {
    items,
    isOpen,
    closeCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    totalCount,
    totalPrice,
  } = useCart();

  const drawerRef = useRef(null);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        closeCart();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, closeCart]);

  // Lock body scroll when cart is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const handleExploreMenu = () => {
    closeCart();
    const servicesEl = document.getElementById('services');
    if (servicesEl) {
      servicesEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex justify-end">
          {/* Backdrop overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            onClick={closeCart}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            aria-hidden="true"
          />

          {/* Drawer Panel */}
          <motion.div
            ref={drawerRef}
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 280 }}
            role="dialog"
            aria-modal="true"
            aria-label="Shopping Cart"
            className="relative z-10 w-full max-w-full sm:max-w-md md:w-[420px] h-full flex flex-col bg-[#0b1b13] text-slate-100 shadow-2xl border-l border-[rgba(191,161,95,0.2)] overflow-hidden"
            style={{
              background: 'linear-gradient(180deg, #071911 0%, #04120c 100%)',
            }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-[rgba(191,161,95,0.15)] bg-[#04120c]/80 backdrop-blur-md">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[rgba(191,161,95,0.15)] border border-[rgba(191,161,95,0.3)] flex items-center justify-center text-[#d4b87a]">
                  <ShoppingBag className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2
                      className="text-lg font-black text-white tracking-wide"
                      style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
                    >
                      Your Cart
                    </h2>
                    {totalCount > 0 && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-gradient-to-r from-[#bfa15f] to-[#d4b87a] text-[#041e16]">
                        {totalCount} {totalCount === 1 ? 'item' : 'items'}
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-emerald-200/60 font-medium">
                    Cozy Blissful Salon & Spa
                  </p>
                </div>
              </div>

              {/* Close Button */}
              <button
                type="button"
                onClick={closeCart}
                aria-label="Close cart"
                className="w-9 h-9 rounded-xl flex items-center justify-center text-slate-300 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 transition-all duration-200 active:scale-95 touch-manipulation"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Cart Items List / Empty State */}
            <div className="flex-1 overflow-y-auto px-5 sm:px-6 py-4 space-y-4 no-scrollbar">
              {items.length === 0 ? (
                <div className="h-full min-h-[300px] flex flex-col items-center justify-center text-center px-4">
                  <div className="w-20 h-20 rounded-3xl bg-[rgba(191,161,95,0.08)] border border-[rgba(191,161,95,0.2)] flex items-center justify-center mb-5 text-[#bfa15f]">
                    <ShoppingBag className="w-9 h-9 opacity-75" />
                  </div>
                  <h3
                    className="text-xl font-bold text-white mb-2"
                    style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
                  >
                    Your cart is empty
                  </h3>
                  <p className="text-xs text-slate-400 max-w-xs mb-6 leading-relaxed">
                    Explore our curated treatments, massages, and nail care services to build your personalized spa session.
                  </p>
                  <button
                    type="button"
                    onClick={handleExploreMenu}
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-xs text-[#041e16] bg-gradient-to-r from-[#bfa15f] to-[#d4b87a] hover:brightness-110 active:scale-95 transition-all shadow-lg shadow-[rgba(191,161,95,0.25)]"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    Explore Our Menu
                  </button>
                </div>
              ) : (
                <div className="space-y-3.5">
                  {items.map((item) => (
                    <motion.div
                      layout
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      key={item.id}
                      className="group relative p-3.5 rounded-2xl bg-[#0d2319]/80 border border-[rgba(191,161,95,0.18)] hover:border-[rgba(191,161,95,0.35)] transition-all duration-200 flex gap-3.5"
                    >
                      {/* Image Thumbnail */}
                      <div className="relative w-18 h-18 sm:w-20 sm:h-20 rounded-xl overflow-hidden flex-shrink-0 bg-[#04120c] border border-white/5">
                        {item.photo ? (
                          <img
                            src={item.photo}
                            alt={item.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            loading="lazy"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                            }}
                          />
                        ) : null}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent pointer-events-none" />
                        <span className="absolute bottom-1 left-1 text-[9px] font-bold text-white/90 px-1.5 py-0.5 rounded bg-black/60 backdrop-blur-xs flex items-center gap-0.5">
                          <Clock className="w-2.5 h-2.5 text-[#d4b87a]" />
                          {item.duration}
                        </span>
                      </div>

                      {/* Content & Controls */}
                      <div className="flex-1 flex flex-col justify-between min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <h4 className="text-sm font-bold text-white truncate group-hover:text-[#d4b87a] transition-colors">
                            {item.name}
                          </h4>
                          <button
                            type="button"
                            onClick={() => removeFromCart(item.id)}
                            aria-label={`Remove ${item.name} from cart`}
                            className="text-slate-400 hover:text-rose-400 p-1 rounded-lg hover:bg-rose-500/10 transition-colors active:scale-90"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <div className="flex items-center justify-between mt-1">
                          <span className="text-xs font-semibold text-[#d4b87a]">
                            {item.price > 0 ? `₱${item.price.toLocaleString()}` : item.priceLabel}
                          </span>
                        </div>

                        {/* Quantity Controls & Line Total */}
                        <div className="flex items-center justify-between mt-2.5 pt-2 border-t border-white/5">
                          <div className="flex items-center gap-1 bg-[#04120c] p-0.5 rounded-lg border border-[rgba(191,161,95,0.18)]">
                            <button
                              type="button"
                              onClick={() => updateQuantity(item.id, -1)}
                              aria-label="Decrease quantity"
                              className="w-6 h-6 rounded flex items-center justify-center text-slate-300 hover:text-white hover:bg-white/10 active:scale-90 transition-all"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="w-7 text-center text-xs font-bold text-white">
                              {item.quantity}
                            </span>
                            <button
                              type="button"
                              onClick={() => updateQuantity(item.id, 1)}
                              aria-label="Increase quantity"
                              className="w-6 h-6 rounded flex items-center justify-center text-slate-300 hover:text-white hover:bg-white/10 active:scale-90 transition-all"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>

                          <span className="text-xs font-extrabold text-emerald-300">
                            {item.price > 0
                              ? `₱${(item.price * item.quantity).toLocaleString()}`
                              : item.priceLabel}
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer / Summary / Checkout */}
            {items.length > 0 && (
              <div className="p-5 sm:p-6 border-t border-[rgba(191,161,95,0.2)] bg-[#040e09]/95 backdrop-blur-md space-y-4">
                {/* Summary lines */}
                <div className="space-y-1.5 text-xs text-slate-300">
                  <div className="flex justify-between items-center text-slate-400">
                    <span>Subtotal ({totalCount} items)</span>
                    <span className="text-slate-200 font-semibold">
                      ₱{totalPrice.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-slate-400">
                    <span>Private Suite & Sanitization</span>
                    <span className="text-emerald-400 font-semibold">Included</span>
                  </div>
                  <div className="flex justify-between items-center pt-2 border-t border-white/10 text-base font-black text-white">
                    <span>Total</span>
                    <span className="text-[#d4b87a] text-lg font-black">
                      ₱{totalPrice.toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* Guarantee badge */}
                <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/[0.03] border border-white/5 text-[11px] text-emerald-200/70">
                  <ShieldCheck className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <span>Sanitized tools, private suite & certified therapists.</span>
                </div>

                {/* Checkout CTA */}
                <div className="space-y-2">
                  <Link
                    to="/register"
                    onClick={closeCart}
                    className="w-full py-3.5 px-6 rounded-xl font-bold text-sm text-[#041e16] flex items-center justify-center gap-2.5 bg-gradient-to-r from-[#bfa15f] to-[#d4b87a] hover:brightness-110 active:scale-[0.98] transition-all shadow-xl shadow-[rgba(191,161,95,0.3)] text-center cursor-pointer"
                  >
                    <span>Proceed to Checkout</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>

                  <div className="flex items-center justify-between px-1 pt-1">
                    <button
                      type="button"
                      onClick={clearCart}
                      className="text-[11px] text-slate-400 hover:text-rose-400 transition-colors"
                    >
                      Clear all items
                    </button>
                    <button
                      type="button"
                      onClick={handleExploreMenu}
                      className="text-[11px] text-[#d4b87a] hover:underline"
                    >
                      + Add more treatments
                    </button>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
