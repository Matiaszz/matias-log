"use client";

import React from "react";
import { Loader2 } from "lucide-react";
import { GoogleIcon } from "@/components/ui/Icons";

interface GoogleLoginButtonProps {
  onClick: () => void;
  isLoading?: boolean;
  disabled?: boolean;
  text?: string;
  size?: "md" | "lg";
  className?: string;
}

export function GoogleLoginButton({
  onClick,
  isLoading = false,
  disabled = false,
  text = "Entrar com Google",
  size = "lg",
  className = "",
}: GoogleLoginButtonProps) {
  const sizeClasses =
    size === "lg"
      ? "py-3 px-6 text-base font-medium"
      : "py-2 px-4 text-sm font-medium";

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled || isLoading}
      aria-label={text}
      className={`w-full relative inline-flex items-center justify-center gap-3 rounded-xl bg-white text-zinc-900 hover:bg-zinc-100 active:scale-[0.99] border border-zinc-200 transition-all shadow-xs hover:shadow-md focus:outline-none focus:ring-2 focus:ring-zinc-400 focus:ring-offset-2 focus:ring-offset-zinc-950 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer select-none ${sizeClasses} ${className}`}
    >
      {isLoading ? (
        <Loader2 className="w-5 h-5 animate-spin text-zinc-700" />
      ) : (
        <GoogleIcon className="w-5 h-5 shrink-0" />
      )}
      <span>{isLoading ? "Conectando..." : text}</span>
    </button>
  );
}
