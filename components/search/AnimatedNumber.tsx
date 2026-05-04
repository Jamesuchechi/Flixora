'use client';

import { useState, useEffect } from 'react';

export function AnimatedNumber({ value }: { value: number }) {
  const [displayValue, setDisplayValue] = useState(0);

  // Sync state with props during render (Avoids cascading render warnings)
  if (value === 0 && displayValue !== 0) {
    setDisplayValue(0);
  }

  // Effect: Handle the counting animation
  useEffect(() => {
    if (value <= 0) return;

    let start = 0;
    const end = value;
    const totalDuration = 800;
    const incrementTime = 30;
    const totalSteps = totalDuration / incrementTime;
    const stepValue = Math.max(Math.ceil(end / totalSteps), 1);

    const timer = setInterval(() => {
      start += stepValue;
      if (start >= end) {
        setDisplayValue(end);
        clearInterval(timer);
      } else {
        setDisplayValue(start);
      }
    }, incrementTime);

    return () => clearInterval(timer);
  }, [value]);

  return <span>{displayValue}</span>;
}
