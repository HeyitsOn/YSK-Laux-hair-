import { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { photoSrc, photoSrcSet, photoView } from '../../utils/photos';
import { Icon } from '../ui/Icon';
import './Lightbox.css';

interface LightboxProps {
  title: string;
  images: string[];
  startIndex?: number;
  onClose: () => void;
}

export function Lightbox({ title, images, startIndex = 0, onClose }: LightboxProps) {
  const [index, setIndex] = useState(startIndex);
  const closeRef = useRef<HTMLButtonElement>(null);
  const touchX = useRef<number | null>(null);
  const count = images.length;

  const go = useCallback((step: number) => setIndex((i) => (i + step + count) % count), [count]);

  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    document.body.classList.add('is-locked');
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      else if (e.key === 'ArrowRight') go(1);
      else if (e.key === 'ArrowLeft') go(-1);
    };
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.classList.remove('is-locked');
      window.removeEventListener('keydown', onKey);
      previous?.focus();
    };
  }, [go, onClose]);

  const current = images[index];

  return createPortal(
    <div className="lightbox" role="dialog" aria-modal="true" aria-label={`${title} photos`}>
      <div className="lightbox__backdrop" onClick={onClose} />

      <div className="lightbox__top">
        <p className="lightbox__title">
          {title}
          <span aria-live="polite">
            {index + 1} / {count}
          </span>
        </p>
        <button ref={closeRef} type="button" className="lightbox__btn" onClick={onClose} aria-label="Close photos">
          <Icon name="close" size={22} />
        </button>
      </div>

      <figure
        className="lightbox__stage"
        onTouchStart={(e) => (touchX.current = e.touches[0].clientX)}
        onTouchEnd={(e) => {
          if (touchX.current === null) return;
          const dx = e.changedTouches[0].clientX - touchX.current;
          if (Math.abs(dx) > 40) go(dx < 0 ? 1 : -1);
          touchX.current = null;
        }}
      >
        <img
          key={current}
          className="lightbox__img"
          src={photoSrc(current)}
          srcSet={photoSrcSet(current)}
          sizes="(max-width: 700px) 100vw, 70vh"
          alt={`${title}, ${photoView(current)}`}
        />
      </figure>

      {count > 1 && (
        <>
          <button type="button" className="lightbox__btn lightbox__nav lightbox__nav--prev" onClick={() => go(-1)} aria-label="Previous photo">
            <Icon name="arrowLeft" size={22} />
          </button>
          <button type="button" className="lightbox__btn lightbox__nav lightbox__nav--next" onClick={() => go(1)} aria-label="Next photo">
            <Icon name="arrow" size={22} />
          </button>
          <div className="lightbox__thumbs">
            {images.map((img, i) => (
              <button
                key={img}
                type="button"
                className={`lightbox__thumb ${i === index ? 'is-active' : ''}`}
                onClick={() => setIndex(i)}
                aria-label={`Show ${photoView(img)}`}
                aria-current={i === index}
              >
                <img src={photoSrc(img, 480)} alt="" loading="lazy" />
              </button>
            ))}
          </div>
        </>
      )}
    </div>,
    document.body,
  );
}
