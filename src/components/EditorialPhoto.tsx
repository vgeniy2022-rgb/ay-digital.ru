import { motion } from 'framer-motion';
import type { ReactNode } from 'react';
import type { EditorialMedia } from '../data/editorialMedia';

type EditorialPhotoProps = {
  media: EditorialMedia;
  aspect?: 'hero' | 'wide' | 'landscape' | 'portrait';
  priority?: boolean;
  className?: string;
  caption?: string;
  children?: ReactNode;
};

const aspectClasses = {
  hero: 'aspect-[4/3] lg:aspect-[1.04/1]',
  wide: 'aspect-[16/9]',
  landscape: 'aspect-[3/2]',
  portrait: 'aspect-[4/5]',
};

export function EditorialPhoto({
  media,
  aspect = 'landscape',
  priority = false,
  className = '',
  caption,
  children,
}: EditorialPhotoProps) {
  return (
    <motion.figure
      className={`editorial-photo ${aspectClasses[aspect]} ${className}`}
      initial={{ opacity: 0, y: 20, scale: 0.985 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, amount: 0.18 }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
    >
      <motion.img
        src={media.src}
        alt={media.alt}
        width={1600}
        height={1100}
        loading={priority ? 'eager' : 'lazy'}
        decoding="async"
        fetchPriority={priority ? 'high' : 'auto'}
        style={{ objectPosition: media.focus || 'center' }}
        whileHover={{ scale: 1.025 }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      />
      <span className="editorial-photo__veil" aria-hidden="true" />
      <figcaption className="editorial-photo__caption">
        <span className="editorial-photo__signal" aria-hidden="true" />
        {caption || media.label}
      </figcaption>
      {children ? <div className="editorial-photo__overlay">{children}</div> : null}
    </motion.figure>
  );
}
