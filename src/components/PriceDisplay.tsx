'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { AXIS_PRICES } from '@/lib/constants';

type Axis = 'front' | 'rear' | 'both';

interface PriceDisplayProps {
  axis: Axis;
}

export default function PriceDisplay({ axis }: PriceDisplayProps) {
  const price = AXIS_PRICES[axis];

  return (
    <div className="flex items-center justify-between bg-gray-50 rounded-2xl px-4 py-3">
      <span className="text-sm text-gray-500">Стоимость диагностики</span>
      <AnimatePresence mode="wait">
        <motion.span
          key={price}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.8, opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="text-xl font-bold text-brand"
        >
          {price.toLocaleString('ru-RU')} ₽
        </motion.span>
      </AnimatePresence>
    </div>
  );
}
