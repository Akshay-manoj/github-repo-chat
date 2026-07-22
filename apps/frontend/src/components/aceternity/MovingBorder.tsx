"use client";
import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export function MovingBorder({
  children,
  duration = 2000,
  rx,
  ry,
  className,
  containerClassName,
  borderClassName,
  as: Component = "button",
  ...otherProps
}: {
  children: React.ReactNode;
  as?: any;
  containerClassName?: string;
  borderClassName?: string;
  duration?: number;
  rx?: string;
  ry?: string;
  className?: string;
  [key: string]: any;
}) {
  const pathRef = React.useRef<SVGRectElement | null>(null);
  const progress = React.useRef(0);
  const [offset, setOffset] = React.useState({ x: 0, y: 0 });

  React.useEffect(() => {
    const rect = pathRef.current;
    if (!rect) return;
    const totalLength = 2 * (rect.getBoundingClientRect().width + rect.getBoundingClientRect().height);

    let animFrame: number;
    let start: number | null = null;

    const step = (timestamp: number) => {
      if (!start) start = timestamp;
      const elapsed = timestamp - start;
      progress.current = (elapsed % duration) / duration;
      const pos = progress.current * totalLength;
      const w = rect.getBoundingClientRect().width;
      const h = rect.getBoundingClientRect().height;

      let x: number, y: number;
      if (pos < w) { x = pos; y = 0; }
      else if (pos < w + h) { x = w; y = pos - w; }
      else if (pos < 2 * w + h) { x = w - (pos - w - h); y = h; }
      else { x = 0; y = h - (pos - 2 * w - h); }

      setOffset({ x, y });
      animFrame = requestAnimationFrame(step);
    };
    animFrame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(animFrame);
  }, [duration]);

  return (
    <Component
      className={cn(
        "relative h-16 w-full overflow-hidden rounded-xl bg-transparent p-[1px] text-xl",
        containerClassName
      )}
      {...otherProps}
    >
      <div className="absolute inset-0 rounded-xl" style={{ overflow: "hidden" }}>
        <div
          className="absolute"
          style={{
            width: "20px",
            height: "20px",
            left: offset.x - 10,
            top: offset.y - 10,
            background: "radial-gradient(circle, #adc6ff 0%, transparent 70%)",
            borderRadius: "50%",
          }}
        />
        <rect ref={pathRef} className="absolute inset-0 h-full w-full" style={{ visibility: "hidden" }} />
      </div>
      <div
        className={cn(
          "relative flex h-full w-full items-center justify-center rounded-xl text-sm antialiased",
          className
        )}
      >
        {children}
      </div>
    </Component>
  );
}
