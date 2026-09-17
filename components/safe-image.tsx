'use client';

import { useState, type ImgHTMLAttributes } from 'react';

type SafeImageProps = ImgHTMLAttributes<HTMLImageElement> & {
  fallbackSrc: string;
};

export function SafeImage({ src, fallbackSrc, alt, onError, ...props }: SafeImageProps) {
  const [currentSrc, setCurrentSrc] = useState(String(src ?? fallbackSrc));

  return (
    <img
      {...props}
      src={currentSrc}
      alt={alt}
      onError={(event) => {
        if (currentSrc !== fallbackSrc) setCurrentSrc(fallbackSrc);
        onError?.(event);
      }}
    />
  );
}
