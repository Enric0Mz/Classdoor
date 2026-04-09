"use client";

import { useState, useCallback, useMemo } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function ImageCarousel({
  images,
  alt,
  fallback,
  className = "",
  showArrows = true,
  showDots = true,
}) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [failedUrls, setFailedUrls] = useState(new Set());

  const validImages = useMemo(
    () => (images || []).filter((image) => !failedUrls.has(image.url)),
    [images, failedUrls],
  );

  const handleImageError = useCallback((failedUrl) => {
    setFailedUrls((prev) => new Set(prev).add(failedUrl));
    setCurrentIndex(0);
  }, []);

  const goToPrevious = useCallback(
    (event) => {
      event.preventDefault();
      event.stopPropagation();
      setCurrentIndex((prev) =>
        prev === 0 ? validImages.length - 1 : prev - 1,
      );
    },
    [validImages.length],
  );

  const goToNext = useCallback(
    (event) => {
      event.preventDefault();
      event.stopPropagation();
      setCurrentIndex((prev) =>
        prev === validImages.length - 1 ? 0 : prev + 1,
      );
    },
    [validImages.length],
  );

  if (validImages.length === 0) {
    return fallback || null;
  }

  if (validImages.length === 1) {
    return (
      <Image
        src={validImages[0].url}
        alt={alt}
        fill
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        className={`object-cover ${className}`}
        onError={() => handleImageError(validImages[0].url)}
      />
    );
  }

  return (
    <div className="relative h-full w-full">
      <Image
        src={validImages[currentIndex].url}
        alt={`${alt} - ${currentIndex + 1}`}
        fill
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        className={`object-cover ${className}`}
        onError={() => handleImageError(validImages[currentIndex].url)}
      />

      {/* Navigation Arrows */}
      {showArrows && (
        <>
          <button
            onClick={goToPrevious}
            className="absolute left-2 top-1/2 z-10 flex h-7 w-7 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-sm transition-all hover:bg-black/60"
          >
            <ChevronLeft size={16} />
          </button>
          <button
            onClick={goToNext}
            className="absolute right-2 top-1/2 z-10 flex h-7 w-7 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-sm transition-all hover:bg-black/60"
          >
            <ChevronRight size={16} />
          </button>
        </>
      )}

      {/* Dot Indicators */}
      {showDots && (
        <div className="absolute bottom-2 left-1/2 z-10 flex -translate-x-1/2 gap-1.5">
          {validImages.map((_, index) => (
            <button
              key={index}
              onClick={(event) => {
                event.preventDefault();
                event.stopPropagation();
                setCurrentIndex(index);
              }}
              className={`h-1.5 cursor-pointer rounded-full transition-all ${
                index === currentIndex
                  ? "w-4 bg-white"
                  : "w-1.5 bg-white/50 hover:bg-white/75"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
