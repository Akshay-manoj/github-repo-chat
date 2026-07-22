"use client";
import React from "react";
import { cn } from "@/lib/utils";

export const ShimmerButton = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement> & {
    shimmerColor?: string;
    shimmerSize?: string;
    borderRadius?: string;
    shimmerDuration?: string;
    background?: string;
    className?: string;
    children?: React.ReactNode;
  }
>(
  (
    {
      shimmerColor = "#adc6ff",
      shimmerSize = "0.08em",
      shimmerDuration = "1.5s",
      borderRadius = "100px",
      background = "rgba(0, 46, 106, 1)",
      className,
      children,
      ...props
    },
    ref
  ) => {
    return (
      <button
        style={
          {
            "--spread": "90deg",
            "--shimmer-color": shimmerColor,
            "--radius": borderRadius,
            "--speed": shimmerDuration,
            "--cut": shimmerSize,
            "--bg": background,
          } as React.CSSProperties
        }
        className={cn(
          "group relative z-0 flex cursor-pointer items-center justify-center gap-2 overflow-hidden whitespace-nowrap border border-white/10 px-6 py-3 text-white [border-radius:var(--radius)]",
          "transform-gpu transition-transform duration-300 ease-in-out active:translate-y-px",
          className
        )}
        ref={ref}
        {...props}
      >
        {/* Spark container */}
        <div
          className={cn(
            "-z-30 blur-[2px]",
            "absolute inset-0 overflow-visible [container-type:size]"
          )}
        >
          {/* Spark */}
          <div className="absolute inset-0 h-[100cqh] animate-shimmer-slide [aspect-ratio:1] [border-radius:0] [mask:none]">
            <div className="absolute -inset-full w-auto rotate-0 [background:conic-gradient(from_calc(270deg-(var(--spread)*0.5)),transparent_0,var(--shimmer-color)_var(--spread),transparent_var(--spread))] [translate:0_0]" />
          </div>
        </div>
        {/* Background fill */}
        <div
          className={cn(
            "absolute bottom-[var(--cut)] left-[var(--cut)] right-[var(--cut)] top-[var(--cut)] z-[-1] [border-radius:calc(var(--radius)-var(--cut))] [background:var(--bg)]"
          )}
        />
        {children}
      </button>
    );
  }
);
ShimmerButton.displayName = "ShimmerButton";
