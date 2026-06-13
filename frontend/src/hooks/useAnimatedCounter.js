import { useState, useEffect } from 'react';

export const useAnimatedCounter = (targetValue, durationMs = 800) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let start = 0;
    const end = parseInt(targetValue, 10);
    if (isNaN(end) || end <= 0) {
      setCount(0);
      return;
    }

    if (start === end) {
      setCount(end);
      return;
    }

    // Determine intervals
    const totalSteps = 30;
    const stepTime = Math.max(10, Math.floor(durationMs / totalSteps));
    const increment = Math.ceil(end / totalSteps);

    const timer = setInterval(() => {
      start += increment;
      if (start >= end) {
        setCount(end);
        clearInterval(timer);
      } else {
        setCount(start);
      }
    }, stepTime);

    return () => clearInterval(timer);
  }, [targetValue, durationMs]);

  return count;
};
