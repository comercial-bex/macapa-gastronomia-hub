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

      <div className="columns-2 md:columns-3 gap-4 space-y-4">
        {images.map((image, idx) => (
          <div
            key={idx}
            className="break-inside-avoid group relative overflow-hidden rounded-lg cursor-pointer"
            onMouseEnter={() => setHoveredIndex(idx)}
            onMouseLeave={() => setHoveredIndex(null)}
          >
            <img
              src={image.src}
              alt={image.alt}
              loading="lazy"
              className={cn(
                "w-full h-auto object-cover transition-all duration-700",
                hoveredIndex !== null && hoveredIndex !== idx
                  ? "scale-[1.02] brightness-50"
                  : "scale-100 brightness-100",
                hoveredIndex === idx && "scale-110"
              )}
            />
            <div
              className={cn(
                "absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent transition-opacity duration-500",
                hoveredIndex === idx ? "opacity-100" : "opacity-0"
              )}
            />
            <div
              className={cn(
                "absolute bottom-0 left-0 right-0 p-4 transition-all duration-500",
                hoveredIndex === idx
                  ? "translate-y-0 opacity-100"
                  : "translate-y-4 opacity-0"
              )}
            >
              <p className="text-white text-sm font-medium">{image.alt}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
