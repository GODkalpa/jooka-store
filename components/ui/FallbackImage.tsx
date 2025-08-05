'use client'

import Image from 'next/image'
import { useState } from 'react'

interface FallbackImageProps {
  src: string
  alt: string
  fallbackSrc: string
  width?: number
  height?: number
  fill?: boolean
  className?: string
  priority?: boolean
  sizes?: string
  quality?: number
}

export default function FallbackImage({
  src,
  alt,
  fallbackSrc,
  width,
  height,
  fill = false,
  className = '',
  priority = false,
  sizes,
  quality = 75
}: FallbackImageProps) {
  const [imgSrc, setImgSrc] = useState(src)
  const [hasError, setHasError] = useState(false)

  const handleError = () => {
    if (!hasError) {
      setHasError(true)
      setImgSrc(fallbackSrc)
    }
  }

  const imageProps = {
    src: imgSrc,
    alt,
    className,
    priority,
    quality,
    onError: handleError,
    ...(fill ? { fill: true } : { width, height }),
    ...(sizes && { sizes })
  }

  return <Image {...imageProps} />
}
