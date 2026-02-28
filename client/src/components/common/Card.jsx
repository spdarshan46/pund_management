// src/components/common/Card.jsx
import React from 'react';
import { motion } from 'framer-motion';

const Card = ({ children, className = '', animate = true }) => {
  const cardClasses = `bg-white rounded-2xl shadow-lg p-6 ${className}`;

  if (animate) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className={cardClasses}
      >
        {children}
      </motion.div>
    );
  }

  return <div className={cardClasses}>{children}</div>;
};

export default Card;