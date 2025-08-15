import React, { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  glass?: boolean;
}

const Card: React.FC<CardProps> = ({
  children,
  className = '',
  hover = false,
  glass = false,
}) => {
  const baseClasses = 'rounded-xl border border-gray-200 transition-all duration-300';
  const hoverClasses = hover ? 'hover:shadow-elegant hover:-translate-y-1 cursor-pointer' : '';
  const glassClasses = glass 
    ? 'bg-bleu/70 backdrop-blur-sm shadow-glass border-white/20' 
    : 'bg-bleu shadow-sm hover:shadow-md';

  return (
    <div className={`${baseClasses} ${hoverClasses} ${glassClasses} ${className}`}>
      {children}
    </div>
  );
};

export default Card;