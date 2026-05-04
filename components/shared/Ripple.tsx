'use client';

import { useState, useLayoutEffect } from 'react';

interface RippleProps {
  color?: string;
  duration?: number;
}

/**
 * High-fidelity Ripple effect for buttons and interactive elements.
 */
export function Ripple({ color = 'rgba(255, 255, 255, 0.3)', duration = 600 }: RippleProps) {
  const [rippleArray, setRippleArray] = useState<{ x: number; y: number; size: number }[]>([]);

  useLayoutEffect(() => {
    const parent = document.querySelector('.ripple-container') as HTMLElement;
    if (!parent) return;

    const showRipple = (e: MouseEvent) => {
      const container = parent.getBoundingClientRect();
      const size = Math.max(container.width, container.height);
      const x = e.clientX - container.left - size / 2;
      const y = e.clientY - container.top - size / 2;

      const newRipple = { x, y, size };
      setRippleArray((prev) => [...prev, newRipple]);
    };

    parent.addEventListener('mousedown', showRipple);
    return () => parent.removeEventListener('mousedown', showRipple);
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none rounded-[inherit]">
      {rippleArray.map((ripple, index) => (
        <span
          key={index}
          className="ripple"
          style={{
            top: ripple.y,
            left: ripple.x,
            width: ripple.size,
            height: ripple.size,
            backgroundColor: color,
            animationDuration: `${duration}ms`,
          }}
          onAnimationEnd={() => setRippleArray((prev) => prev.filter((_, i) => i !== index))}
        />
      ))}
    </div>
  );
}
