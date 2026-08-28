"use client";

import React, { useState } from "react";
import { User, AlertCircle } from "lucide-react";
import { DEFAULT_PROFILE_PICTURE } from "@/types/user.types";

interface UserAvatarProps {
  photoUrl?: string | null;
  firstName?: string;
  lastName?: string;
  isProfileComplete?: boolean;
  size?: "sm" | "md" | "lg" | "xl" | "2xl";
  className?: string;
  showIncompleteBadge?: boolean;
  onClick?: () => void;
}

const sizeConfig = {
  sm: {
    container: "w-8 h-8 text-xs",
    icon: "w-4 h-4",
    badge: "w-3.5 h-3.5 -bottom-0.5 -right-0.5 text-[9px]",
    badgeOffset: "border",
  },
  md: {
    container: "w-10 h-10 text-sm",
    icon: "w-5 h-5",
    badge: "w-4 h-4 -bottom-0.5 -right-0.5 text-[10px]",
    badgeOffset: "border-2",
  },
  lg: {
    container: "w-14 h-14 text-base",
    icon: "w-7 h-7",
    badge: "w-5 h-5 bottom-0 right-0 text-xs",
    badgeOffset: "border-2",
  },
  xl: {
    container: "w-20 h-20 text-xl",
    icon: "w-10 h-10",
    badge: "w-6 h-6 bottom-0.5 right-0.5 text-xs font-bold",
    badgeOffset: "border-2",
  },
  "2xl": {
    container: "w-28 h-28 text-2xl",
    icon: "w-14 h-14",
    badge: "w-8 h-8 bottom-1 right-1 text-sm font-bold",
    badgeOffset: "border-2",
  },
};

export function UserAvatar({
  photoUrl,
  firstName = "",
  lastName = "",
  isProfileComplete = true,
  size = "md",
  className = "",
  showIncompleteBadge = true,
  onClick,
}: UserAvatarProps) {
  const [imageError, setImageError] = useState(false);
  const cfg = sizeConfig[size];

  const hasRealPhoto =
    Boolean(photoUrl) &&
    photoUrl !== DEFAULT_PROFILE_PICTURE &&
    (photoUrl?.startsWith("http://") || photoUrl?.startsWith("https://") || photoUrl?.startsWith("data:image")) &&
    !imageError;

  const initials = `${firstName ? firstName.charAt(0).toUpperCase() : ""}${
    lastName ? lastName.charAt(0).toUpperCase() : ""
  }` || "U";

  const isIncomplete = isProfileComplete === false;

  return (
    <div
      className={`relative inline-flex items-center justify-center shrink-0 ${
        onClick ? "cursor-pointer group" : ""
      } ${className}`}
      onClick={onClick}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      title={
        isIncomplete
          ? "Perfil incompleto (adicione links de LinkedIn, GitHub e Site)"
          : `${firstName} ${lastName}`.trim() || "Usuário"
      }
    >
      <div
        className={`${cfg.container} rounded-full overflow-hidden flex items-center justify-center transition-all bg-zinc-800 text-zinc-200 select-none ${
          isIncomplete
            ? "ring-2 ring-amber-400 ring-offset-2 ring-offset-zinc-950 shadow-sm shadow-amber-500/20"
            : "ring-1 ring-zinc-700/80"
        } ${onClick ? "group-hover:ring-zinc-500" : ""}`}
      >
        {hasRealPhoto ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={photoUrl!}
            alt={`${firstName} ${lastName}`.trim() || "Foto de perfil"}
            onError={() => setImageError(true)}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-linear-to-br from-zinc-750 to-zinc-850 font-semibold text-zinc-300">
            {initials.length > 0 && firstName ? (
              <span>{initials}</span>
            ) : (
              <User className={`${cfg.icon} text-zinc-400`} />
            )}
          </div>
        )}
      </div>

      {/* Discrete yellow border exclamation indicator for incomplete profiles */}
      {isIncomplete && showIncompleteBadge && (
        <span
          className={`absolute ${cfg.badge} rounded-full bg-amber-400 text-zinc-950 font-black flex items-center justify-center ${cfg.badgeOffset} border-zinc-950 shadow-xs ring-1 ring-amber-500/50`}
          aria-label="Perfil incompleto"
        >
          !
        </span>
      )}
    </div>
  );
}
