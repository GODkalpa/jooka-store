import React from 'react';
import Link from 'next/link';
import Image from 'next/image';

interface JookaLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export default function JookaLogo({
  className = '',
  size = 'md'
}: JookaLogoProps) {
  const heights = {
    sm: 'h-8 sm:h-9',
    md: 'h-10 sm:h-12 md:h-14',
    lg: 'h-12 sm:h-14 md:h-18'
  };

  return (
    <Link href="/" className={`inline-flex items-center transition-transform hover:opacity-90 ${className}`}>
      <Image
        src="/logo.png"
        alt="JOOKA Official Logo"
        width={400}
        height={100}
        className={`${heights[size]} w-auto object-contain py-0.5`}
        priority
      />
    </Link>
  );
}
