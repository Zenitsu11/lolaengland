'use client';

import { useEffect, useRef, useState, type TouchEvent } from 'react';
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
  const videoRefs = useRef<Record<number, HTMLVideoElement | null>>({});
  const [videoSound, setVideoSound] = useState<Record<number, boolean>>({});

  const rawImages = providedImages?.length ? providedImages : [front, back].filter(Boolean) as string[];
  const images = rawImages.map(src=>({src,type:'image' as const})).filter((item): item is { src: string; type:'image' } => Boolean(item.src));
  const videos = (providedVideos ?? []).slice(0,2).filter(Boolean).map(src=>({src,type:'video' as const}));
  const media = [...images, ...videos];

  useEffect(() => {
    Object.values(videoRefs.current).forEach(video => {
      if (!video) return;
      video.pause();
      video.currentTime = 0;
    });

    const activeItem = media[active];
    if (activeItem?.type !== 'video') return;

    const video = videoRefs.current[active];
    if (!video) return;

    // Start muted so desktop and mobile browsers can autoplay reliably.
    // Browsers generally block autoplay with sound until the shopper interacts.
    video.muted = !(videoSound[active] ?? false);
    void video.play().catch(() => {
      video.muted = true;
      void video.play().catch(() => {});
    });
  }, [active, media.length]);

  const toggleVideoSound = (index: number) => {
    const video = videoRefs.current[index];
    if (!video) return;
    const nextMuted = !video.muted;
    video.muted = nextMuted;
    setVideoSound(current => ({ ...current, [index]: !nextMuted }));
    void video.play().catch(() => {});
  };

  const handleGalleryPointerDown = () => {
    const activeItem = media[active];
    if (activeItem?.type !== 'video') return;
    const video = videoRefs.current[active];
    if (!video) return;
    // A real pointer gesture can unlock audio after autoplay was blocked.
    if (videoSound[active]) {
      video.muted = false;
    }
    void video.play().catch(() => {});
  };

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
      onPointerDown={handleGalleryPointerDown}
    >
      <div className="product-detail-slides">
        {media.map((item, index) => (
          <div className={'product-detail-slide' + (active === index ? ' is-active' : '') + (item.type === 'video' ? ' is-video' : '')} key={item.src}>
            {item.type === 'video' ? (
              <video
                ref={element => { videoRefs.current[index] = element; }}
                className="product-detail-video"
                src={item.src}
                autoPlay
                muted
                loop
                playsInline
                preload="auto"
                aria-label={name + ' product video'}
                onLoadedData={() => {
                  if (index !== active) return;
                  const current = videoRefs.current[index];
                  if (!current) return;
                  current.muted = !(videoSound[index] ?? false);
                  void current.play().catch(() => {});
                }}
                onClick={(event) => {
                  event.preventDefault();
                  event.stopPropagation();
                  toggleVideoSound(index);
                }}
              />
            ) : <SafeImage src={item.src} fallbackSrc={item.src} alt={name + ' product view'} width={900} height={1100} loading={index === 0 ? 'eager' : 'lazy'} decoding="async" />}
          </div>
        ))}
      </div>
      {media.length > 1 ? (
        <div className="product-detail-dots" aria-hidden="true">
          {media.map((item, index) => <span key={item.src} className={active === index ? 'is-active' : ''}/>)}
        </div>
      ) : null}
    </div>
  );
}
