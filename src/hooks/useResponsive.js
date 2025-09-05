"use client";
import { useState, useEffect } from "react";

export function useResponsive() {
  const [windowWidth, setWindowWidth] = useState(0);

  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    // Set initial width
    if (typeof window !== 'undefined') {
      setWindowWidth(window.innerWidth);
      window.addEventListener('resize', handleResize);
    }

    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('resize', handleResize);
      }
    };
  }, []);

  const breakpoints = {
    isMobile: windowWidth <= 768,
    isSmallMobile: windowWidth <= 480,
    isTablet: windowWidth <= 1024,
    isDesktop: windowWidth > 1024,
    windowWidth
  };

  return breakpoints;
}
