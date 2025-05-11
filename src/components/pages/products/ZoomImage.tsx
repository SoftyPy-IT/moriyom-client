// ZoomImage.tsx
import Image from "next/image";
import React, { useState, useCallback, useEffect } from "react";

interface ZoomImageProps {
  src: string;
  alt: string;
  disableOnMobile?: boolean;
}

function ZoomImage({ src, alt, disableOnMobile = false }: ZoomImageProps) {
  const [zoomPosition, setZoomPosition] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Check if device is mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);

    return () => {
      window.removeEventListener("resize", checkMobile);
    };
  }, []);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (disableOnMobile && isMobile) return;

      const { left, top, width, height } =
        e.currentTarget.getBoundingClientRect();
      const x = ((e.clientX - left) / width) * 100;
      const y = ((e.clientY - top) / height) * 100;

      setZoomPosition({ x, y });
    },
    [disableOnMobile, isMobile],
  );

  const handleMouseEnter = useCallback(() => {
    if (disableOnMobile && isMobile) return;
    setIsHovering(true);
  }, [disableOnMobile, isMobile]);

  const handleMouseLeave = useCallback(() => {
    setIsHovering(false);
  }, []);

  return (
    <div
      className={`zoom-image-container ${
        disableOnMobile && isMobile ? "zoom-disabled" : ""
      }`}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Base image */}
      <Image
        height={500}
        width={500}
        src={src}
        alt={alt}
        className="base-image"
        priority={true} // Load priority for main product image
        quality={85} // Optimized quality
      />

      {/* Zoom overlay with improved performance */}
      {isHovering && (
        <div
          className="zoom-overlay"
          style={{
            transform: `scale(2)`,
            transformOrigin: `${zoomPosition.x}% ${zoomPosition.y}%`,
          }}
        >
          <img src={src} alt="" className="zoom-image" aria-hidden="true" />
        </div>
      )}
    </div>
  );
}

export default React.memo(ZoomImage);
