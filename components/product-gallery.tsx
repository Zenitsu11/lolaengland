'use client';

import { useRef, useState, type TouchEvent } from 'react';
import { Repeat2 } from 'lucide-react';
import { SafeImage } from '@/components/safe-image';

type ProductGalleryProps = {
  name: string;
  front?: string;
  back?: string;
};

export function ProductGallery({ name, front, back }: ProductGalleryProps) {
  const [active, setActive] = useState(0);
  const startX = useRef<number | null>(null);

  const images = [
    { src: front, label: 'FRONT' },
    ...(back ? [{ src: back, label: 'BACK' }] : []),
  ].filter((item): item is { src: string; label: string } => Boolean(item.src));

  if (!images.length) {
    return <div className="product-detail-media"><SafeImage src="/products/lola-brown-front.webp?v=6" fallbackSrc="/products/lola-brown-front.webp?v=6" alt={name} width={900} height={1100}/></div>;
  }

  const handleTouchStart = (event: TouchEvent<HTMLDivElement>) => {
    startX.current = event.touches[0]?.clientX ?? null;
  };

  const handleTouchEnd = (event: TouchEvent<HTMLDivElement>) => {
    if (startX.current === null || images.length < 2) return;
    const endX = event.changedTouches[0]?.clientX ?? startX.current;
    const delta = endX - startX.current;
    startX.current = null;
    if (Math.abs(delta) < 35) return;
    setActive(current => delta < 0 ? Math.min(current + 1, images.length - 1) : Math.max(current - 1, 0));
  };

  return (
    <div
      className="product-detail-gallery"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      aria-label={'Product images for ' + name}
    >
      <div className="product-detail-slides">
        {images.map((image, index) => (
          <div className={'product-detail-slide' + (active === index ? ' is-active' : '')} key={image.label}>
            <SafeImage
              src={image.src}
              fallbackSrc={image.src}
              alt={name + ' ' + image.label.toLowerCase() + ' view'}
              width={900}
              height={1100}
              loading={index === 0 ? 'eager' : 'lazy'}
              decoding="async"
            />
            <span className="product-detail-view-label"><Repeat2 size={14}/>{image.label}</span>
          </div>
        ))}
      </div>
      {images.length > 1 ? (
        <div className="product-detail-dots" aria-hidden="true">
          {images.map((image, index) => <span key={image.label} className={active === index ? 'is-active' : ''}/>)}
        </div>
      ) : null}
    </div>
  );
}
