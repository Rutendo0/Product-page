import { useState, useRef, useEffect } from 'react';

interface TiltOptions {
  max?: number;       // Maximum tilt rotation in degrees
  perspective?: number; // Perspective value for the 3D effect
  scale?: number;     // Scale factor on hover
  speed?: number;     // Transition speed
  easing?: string;    // CSS easing function
}

interface TiltResult {
  tiltRef: React.RefObject<HTMLDivElement>;
  tiltStyles: React.CSSProperties;
  handleMouseMove: (e: React.MouseEvent<HTMLDivElement>) => void;
  handleMouseEnter: () => void;
  handleMouseLeave: () => void;
}

/**
 * Hook to add 3D tilt effect to an element
 */
export function useTiltEffect({
  max = 10,
  perspective = 1000,
  scale = 1.05,
  speed = 400,
  easing = 'cubic-bezier(.03,.98,.52,.99)'
}: TiltOptions = {}): TiltResult {
  const tiltRef = useRef<HTMLDivElement>(null);
  const [tiltStyles, setTiltStyles] = useState<React.CSSProperties>({
    transform: `perspective(${perspective}px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)`,
    transition: `transform ${speed}ms ${easing}`,
  });

  // Reset the tilt effect when the component unmounts
  useEffect(() => {
    return () => {
      if (tiltRef.current) {
        setTiltStyles({
          transform: `perspective(${perspective}px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)`,
          transition: `transform ${speed}ms ${easing}`,
        });
      }
    };
  }, [perspective, speed, easing]);

  // Calculate the tilt rotation based on mouse position
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!tiltRef.current) return;

    const element = tiltRef.current;
    const rect = element.getBoundingClientRect();
    
    // Get position of mouse relative to element
    const x = e.clientX - rect.left; // x position within the element
    const y = e.clientY - rect.top;  // y position within the element
    
    // Calculate rotation based on mouse position
    // Normalize position to -1 to 1 range
    const xPercent = (x / rect.width) * 2 - 1;
    const yPercent = (y / rect.height) * 2 - 1;
    
    // Calculate rotation (reversed for natural feel)
    const rotateX = -yPercent * max;
    const rotateY = xPercent * max;
    
    // Apply the transform
    setTiltStyles({
      transform: `perspective(${perspective}px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(${scale}, ${scale}, ${scale})`,
      transition: `transform ${speed}ms ${easing}`,
    });
  };

  // Reset the transform on mouse leave
  const handleMouseLeave = () => {
    setTiltStyles({
      transform: `perspective(${perspective}px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)`,
      transition: `transform ${speed}ms ${easing}`,
    });
  };

  // Apply the scale transform on mouse enter (without tilt yet)
  const handleMouseEnter = () => {
    setTiltStyles({
      transform: `perspective(${perspective}px) rotateX(0deg) rotateY(0deg) scale3d(${scale}, ${scale}, ${scale})`,
      transition: `transform ${speed}ms ${easing}`,
    });
  };

  return {
    tiltRef,
    tiltStyles,
    handleMouseMove,
    handleMouseEnter,
    handleMouseLeave
  };
}