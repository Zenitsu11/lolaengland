'use client';

import { useState } from 'react';

type SafeImageProps = React.ImgHTMLAttributes<HTMLImageElement> & {
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
