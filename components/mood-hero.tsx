'use client';

import Link from 'next/link';
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { useEffect, useRef, useState, type KeyboardEvent, type TouchEvent } from 'react';
import { SafeImage } from '@/components/safe-image';

const slides = [
  { image:'/products/lola-brown-front.webp?v=8', kicker:'LOLA ENGLAND · WOMEN’S EDIT', title:'Wear your', italic:'mood.', copy:'Trendy, comfortable and made for every version of you. Express yourself with women’s T-shirts that speak louder.', quote:'“Good outfits. Brighter days.”', note:'THE NEW', label:'LOLA GIRL', href:'/collection/all' },
  { image:'/products/lola-mint-front.webp?v=6', kicker:'01 · SOFT MINT', title:'Soft looks.', italic:'strong mood.', copy:'Soft colour, relaxed energy and an easy tee made for everyday plans, coffee runs and little adventures.', quote:'“Pretty, playful, effortless.”', note:'SOFT EDIT', label:'LOLA GIRL', href:'/collection/soft-pink' },
  { image:'/products/lola-navy-front.webp?v=6', kicker:'02 · AFTER DARK', title:'Own the', italic:'night.', copy:'A deeper mood for evenings, city walks and everything after sunset. Easy fit, bold energy.', quote:'“Bold looks. Easy confidence.”', note:'NIGHT EDIT', label:'AFTER DARK', href:'/collection/after-dark' },
  { image:'/products/lola-olive-front.webp?v=6', kicker:'03 · GRAPHIC GIRL', title:'Say it with', italic:'your tee.', copy:'Statement graphics, relaxed silhouettes and main-character energy without trying too hard.', quote:'“Style that feels like you.”', note:'GRAPHIC EDIT', label:'GRAPHIC GIRL', href:'/collection/graphic-girl' },
];

const INTERVAL = 5000;

type MoodHeroProps = {
  imageUrls?: string[];
  videoUrls?: string[];
};

export function MoodHero({ imageUrls = [], videoUrls = [] }: MoodHeroProps) {
  const mediaSlides = [
    ...slides.map((slide,index) => ({ ...slide, image: imageUrls[index] || slide.image, video: '' })),
    ...videoUrls.slice(0,2).map((video,index) => ({
      image: '',
      video,
      kicker: `05 · LOLA FILM ${index + 1}`,
      title: 'Move with', italic: 'the mood.',
      copy: 'A little motion, a little attitude — discover the LOLA edit in motion.',
      quote: '“Wear it. Feel it. Own it.”',
      note: 'LOLA FILM', label: 'LOLA GIRL', href: '/collection/all'
    }))
  ];
  const [active,setActive] = useState(0);
  const touchStart = useRef<number|null>(null);

  useEffect(() => {
    const timer = window.setTimeout(() => setActive(current => (current + 1) % mediaSlides.length), INTERVAL);
    return () => window.clearTimeout(timer);
  }, [active]);

  const goTo = (index:number) => setActive((index + mediaSlides.length) % mediaSlides.length);

  const onKeyDown = (event:KeyboardEvent<HTMLElement>) => {
    if(event.key === 'ArrowRight') goTo(active + 1);
    if(event.key === 'ArrowLeft') goTo(active - 1);
  };

  const onTouchStart = (event:TouchEvent<HTMLElement>) => {
    touchStart.current = event.touches[0]?.clientX ?? null;
  };
  const onTouchEnd = (event:TouchEvent<HTMLElement>) => {
    if(touchStart.current === null) return;
    const end = event.changedTouches[0]?.clientX ?? touchStart.current;
    const delta = end - touchStart.current;
    touchStart.current = null;
    if(Math.abs(delta) < 45) return;
    goTo(active + (delta < 0 ? 1 : -1));
  };

  return (
    <section className="mood-hero" aria-label="LOLA ENGLAND mood collection" onTouchStart={onTouchStart} onTouchEnd={onTouchEnd} onKeyDown={onKeyDown} tabIndex={0}>
      <div className="mood-hero-slides">
        {mediaSlides.map((slide,index) => (
          <article className={'mood-hero-slide ' + (index === active ? 'is-active' : '')} key={slide.kicker}>
            <div className="mood-hero-copy">
              <p className="editorial-kicker">{slide.kicker}</p>
              <h1>{slide.title}<br/><em>{slide.italic}</em></h1>
              <p>{slide.copy}</p>
              <div className="editorial-hero-quote"><span>✦</span><div><strong>{slide.quote}</strong><small>More than just a tee.</small></div></div>
              <Link className="btn btn-dark" href={slide.href}>SHOP THE EDIT <ArrowRight/></Link>
            </div>
            <Link className="mood-hero-image image-safe" href={slide.href} aria-label={'Shop ' + slide.label}>
              {slide.video ? (
                <video className="mood-hero-video" src={slide.video} autoPlay muted loop playsInline preload={index===4 ? 'metadata' : 'none'} />
              ) : (
                <SafeImage src={slide.image} fallbackSrc={slide.image} alt={'LOLA ENGLAND ' + slide.label + ' women’s T-shirt'} width={1071} height={1536} fetchPriority={index===0 ? 'high' : undefined} />
              )}
              <div className="mood-hero-note"><span>{slide.note}</span><strong>{slide.label}</strong></div>
            </Link>
          </article>
        ))}
      </div>
      <div className="mood-hero-controls">
        <button type="button" onClick={() => goTo(active - 1)} aria-label="Previous mood"><ChevronLeft/></button>
        <div className="mood-progress" aria-label={'Slide ' + (active+1) + ' of ' + mediaSlides.length}>
          <svg viewBox="0 0 44 44" aria-hidden="true">
            <circle className="mood-progress-track" cx="22" cy="22" r="18"/>
            <circle key={active} className="mood-progress-fill" cx="22" cy="22" r="18"/>
          </svg>
        </div>
        <button type="button" onClick={() => goTo(active + 1)} aria-label="Next mood"><ChevronRight/></button>
      </div>
      <div className="mood-dots" aria-hidden="true">{mediaSlides.map((slide,index)=><span key={slide.kicker} className={index===active?'is-active':''}/>)}</div>
    </section>
  );
}
