'use client';

import { useRef, useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

type ScrollAnimatorProps = {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
};

const ScrollAnimator: React.FC<ScrollAnimatorProps> = ({ children, className, style }) => {
  const [isVisible, setIsVisible] = useState(false);
  const elementRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        } else {
          setIsVisible(false);
        }
      },
      {
        threshold: 0.1, // Trigger when 10% of the element is visible
      }
    );

    const currentElement = elementRef.current;
    if (currentElement) {
      observer.observe(currentElement);
    }

    return () => {
      if (currentElement) {
        observer.unobserve(currentElement);
      }
    };
  }, []);

  return (
    <div
      ref={elementRef}
      className={cn(
        'scroll-animate',
        isVisible ? 'scroll-animate-in' : '',
        className
      )}
      style={style}
    >
      {children}
    </div>
  );
};

export default ScrollAnimator;
