import { motion } from 'motion/react';
import React from 'react';

interface TapEffectProps {
  children: React.ReactNode;
  className?: string;
  disabled?: boolean;
}

export function TapEffect({ children, className, disabled }: TapEffectProps) {
  return (
    <motion.div
      whileTap={disabled ? {} : { scale: 0.96 }}
      whileHover={disabled ? {} : { scale: 1.02 }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
