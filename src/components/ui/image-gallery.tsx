import { cn } from "@/lib/utils";
import { useState } from "react";

interface ImageGalleryProps {
  images: { src: string; alt: string }[];
  title?: string;
  subtitle?: string;
  className?: string;
}

export default function ImageGallery({ images, title, subtitle, className }: ImageGalleryProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  return (
    <div className={cn("w-full", className)}>
      {(title || subtitle) && (
        <div className="text-center mb-12">
          {title && (
            <h2 className="font-display text-4xl md:text-5xl font-bold tracking-tight">
              {title}
            </h2>
          )}
          {subtitle && (
            <p className="mt-4 text-muted-foreground text-lg max-w-2xl mx-auto">
              {subtitle}
            </p>
          )}
        </div>
      )}

      <div className="flex h-[500px] md:h-[600px] gap-2 overflow-x-auto">
        {images.map((image, idx) => {
          const isHovered = hoveredIndex === idx;
          const isDefault = hoveredIndex === null && idx === 0;
          const isExpanded = isHovered || isDefault;

          return (
            <div
              key={idx}
              className={cn(
                "relative overflow-hidden rounded-xl cursor-pointer transition-all duration-700 ease-in-out flex-shrink-0",
                isExpanded ? "w-[60%] md:w-[50%]" : "w-[15%] md:w-[12%]"
              )}
              onMouseEnter={() => setHoveredIndex(idx)}
              onMouseLeave={() => setHoveredIndex(null)}
            >
              <img
                src={image.src}
                alt={image.alt}
                loading="lazy"
                className="w-full h-full object-cover"
              />
              <div
                className={cn(
                  "absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent transition-opacity duration-500",
                  isExpanded ? "opacity-100" : "opacity-40"
                )}
              />
              <div
                className={cn(
                  "absolute bottom-0 left-0 right-0 p-4 transition-all duration-500",
                  isExpanded ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
                )}
              >
                <p className="text-white text-sm font-medium">{image.alt}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
