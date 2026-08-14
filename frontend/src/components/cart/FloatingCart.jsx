import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, Sparkles } from 'lucide-react';
import { useCart } from '../../context/CartContext';

export default function FloatingCart() {
  const { totalCount, totalPrice, openCart, isOpen, lastAddedId } = useCart();
  const [bumping, setBumping] = useState(false);

  // Trigger pulse/bump when item count changes or lastAddedId changes
  useEffect(() => {
    if (totalCount > 0 || lastAddedId) {
      setBumping(true);
      const timer = setTimeout(() => setBumping(false), 800);
      return () => clearTimeout(timer);
    }
  }, [totalCount, lastAddedId]);

  // If drawer is open, keep floating trigger clean or visible as close state
  return (
    <div className="fixed bottom-5 right-5 sm:bottom-6 sm:right-6 z-40">
      <motion.button
        type="button"
        onClick={openCart}
        aria-label={`Open shopping cart with ${totalCount} items`}
        initial={{ scale: 0, opacity: 0 }}
        animate={{
          scale: bumping ? [1, 1.18, 0.95, 1.05, 1] : 1,
          opacity: 1,
        }}
        whileHover={{ scale: 1.08, y: -2 }}
        whileTap={{ scale: 0.92 }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
        className="group relative flex items-center gap-2.5 p-3.5 sm:p-4 rounded-2xl sm:rounded-3xl shadow-2xl border transition-all duration-300 cursor-pointer touch-manipulation"
        style={{
          background: 'linear-gradient(135deg, #07261b 0%, #03140d 100%)',
          borderColor: totalCount > 0 ? 'rgba(191,161,95,0.6)' : 'rgba(191,161,95,0.3)',
          boxShadow: totalCount > 0
            ? '0 12px 36px rgba(0,0,0,0.5), 0 0 20px rgba(191,161,95,0.3)'
            : '0 10px 30px rgba(0,0,0,0.4)',
        }}
      >
        {/* Glow pulse behind button when items added */}
        {bumping && (
          <motion.div
            initial={{ scale: 0.8, opacity: 0.8 }}
            animate={{ scale: 1.6, opacity: 0 }}
            transition={{ duration: 0.7, ease: 'easeOut' }}
            className="absolute inset-0 rounded-full bg-[#bfa15f] pointer-events-none -z-10 blur-md"
          />
        )}

        {/* Icon & Count Badge */}
        <div className="relative">
          <ShoppingBag className="w-5 h-5 sm:w-6 sm:h-6 text-[#d4b87a] group-hover:scale-105 transition-transform" />
          
          <AnimatePresence>
            {totalCount > 0 && (
              <motion.span
                key={totalCount}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                transition={{ type: 'spring', stiffness: 500, damping: 25 }}
                className="absolute -top-2.5 -right-2.5 min-w-[20px] h-5 px-1.5 rounded-full flex items-center justify-center text-[10px] font-black bg-gradient-to-r from-[#bfa15f] to-[#e8cc8a] text-[#041e16] border border-[#041e16] shadow-md"
              >
                {totalCount}
              </motion.span>
            )}
          </AnimatePresence>
        </div>

        {/* Text Pill (Desktop / Tablet) */}
        <div className="hidden sm:flex flex-col items-start leading-tight pr-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-200/70">
            Cart
          </span>
          <span className="text-xs font-black text-white">
            {totalCount > 0 ? `₱${totalPrice.toLocaleString()}` : '0 items'}
          </span>
        </div>

        {/* Sparkle subtle decoration */}
        {totalCount > 0 && (
          <Sparkles className="hidden md:block w-3 h-3 text-[#bfa15f] animate-pulse" />
        )}
      </motion.button>
    </div>
  );
}
