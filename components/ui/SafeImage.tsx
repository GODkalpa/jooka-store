'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Package } from 'lucide-react';

interface SafeImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  fill?: boolean;
  className?: string;
  fallbackIcon?: React.ReactNode;
  fallbackClassName?: string;
}

export default function SafeImage({
  src,
  alt,
  width,
  height,
  fill = false,
  className = '',
  fallbackIcon,
  fallbackClassName = 'w-full h-full bg-gray-700 rounded-lg flex items-center justify-center'
}: SafeImageProps) {
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  if (hasError || !src) {
    return (
      <div className={fallbackClassName}>
        {fallbackIcon || <Package className="w-6 h-6 text-gray-500" />}
      </div>
    );
  }

  const imageProps = {
    src,
    alt,
    className: `${className} ${isLoading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`,
    onError: () => setHasError(true),
    onLoad: () => setIsLoading(false),
    ...(fill ? { fill: true } : { width, height })
  };

  return (
    <>
      {isLoading && (
        <div className={fallbackClassName}>
          <div className="animate-pulse bg-gray-600 w-6 h-6 rounded"></div>
        </div>
      )}
      <Image {...imageProps} />
    </>
  );
}
