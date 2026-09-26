'use client';

import { useRef, useState, type TouchEvent } from 'react';
import { Repeat2 } from 'lucide-react';
import { SafeImage } from '@/components/safe-image';

type ProductGalleryProps = {
  name: string;
  front?: string;
  back?: string;
  images?: string[];
  videos?: string[];
};

export function ProductGallery({ name, front, back, images: providedImages, videos: providedVideos }: ProductGalleryProps) {
  const [active, setActive] = useState(0);
  const startX = useRef<number | null>(null);

  const rawImages = providedImages?.length ? providedImages : [front, back].filter(Boolean) as string[];
  const labels = ['FRONT','BACK','SIDE','DETAIL 4','DETAIL 5','DETAIL 6','DETAIL 7','DETAIL 8','DETAIL 9','DETAIL 10','DETAIL 11','DETAIL 12'];
  const images = rawImages.map((src,index)=>({src,label:labels[index] ?? `VIEW ${index + 1}`,type:'image' as const})).filter((item): item is { src: string; label: string; type:'image' } => Boolean(item.src));
  const videos = (providedVideos ?? []).slice(0,2).filter(Boolean).map((src,index)=>({src,label:`VIDEO ${index + 1}`,type:'video' as const}));
  const media = [...images, ...videos];

  if (!media.length) {
    return <div className="product-detail-media"><SafeImage src="/products/lola-brown-front.webp?v=6" fallbackSrc="/products/lola-brown-front.webp?v=6" alt={name} width={900} height={1100}/></div>;
  }

  const handleTouchStart = (event: TouchEvent<HTMLDivElement>) => {
    startX.current = event.touches[0]?.clientX ?? null;
  };

  const handleTouchEnd = (event: TouchEvent<HTMLDivElement>) => {
    if (startX.current === null || media.length < 2) return;
    const endX = event.changedTouches[0]?.clientX ?? startX.current;
    const delta = endX - startX.current;
    startX.current = null;
    if (Math.abs(delta) < 35) return;
    setActive(current => delta < 0 ? Math.min(current + 1, media.length - 1) : Math.max(current - 1, 0));
  };

  return (
    <div
      className="product-detail-gallery"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      aria-label={'Product media for ' + name}
    >
      <div className="product-detail-slides">
        {media.map((item, index) => (
          <div className={'product-detail-slide' + (active === index ? ' is-active' : '')} key={item.label}>
            {item.type === 'video' ? <video className="product-detail-video" src={item.src} controls playsInline preload="metadata" aria-label={name + ' ' + item.label.toLowerCase()} /> : <SafeImage src={item.src} fallbackSrc={item.src} alt={name + ' ' + item.label.toLowerCase() + ' view'} width={900} height={1100} loading={index === 0 ? 'eager' : 'lazy'} decoding="async" />}
            <span className="product-detail-view-label"><Repeat2 size={14}/>{item.label}</span>
          </div>
        ))}
      </div>
      {media.length > 1 ? (
        <div className="product-detail-dots" aria-hidden="true">
          {media.map((item, index) => <span key={item.label} className={active === index ? 'is-active' : ''}/>)}
        </div>
      ) : null}
    </div>
  );
}
