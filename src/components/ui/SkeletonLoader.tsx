
import React from 'react';

interface SkeletonLoaderProps {
  className?: string;
  width?: string | number;
  height?: string | number;
}

export const SkeletonLoader = ({ className = '', width, height }: SkeletonLoaderProps) => {
  return (
    <div
      className={`relative overflow-hidden bg-neutral-200 dark:bg-neutral-800 rounded-md ${className}`}
      style={{ 
        width: width, 
        height: height,
      }}
    >
      {/* Shimmer Effect */}
      <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/50 dark:via-white/10 to-transparent"></div>
    </div>
  );
};
