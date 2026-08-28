"use client";

import React from "react";

export interface BadgeProps {
  children: React.ReactNode;
  variant?: "default" | "warning" | "success" | "info" | "outline";
  size?: "sm" | "md";
  className?: string;
}

export function Badge({
  children,
  variant = "default",
  size = "md",
  className = "",
}: BadgeProps) {
  const sizeStyles = {
    sm: "text-[11px] px-2 py-0.5",
    md: "text-xs px-2.5 py-1",
  };

  const variantStyles = {
    default: "bg-zinc-800 text-zinc-300 border border-zinc-700/60",
    warning: "bg-amber-950/60 text-amber-300 border border-amber-800/60",
    success: "bg-emerald-950/60 text-emerald-300 border border-emerald-800/60",
    info: "bg-sky-950/60 text-sky-300 border border-sky-800/60",
    outline: "bg-transparent text-zinc-400 border border-zinc-700",
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-medium rounded-full ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
    >
      {children}
    </span>
  );
}
