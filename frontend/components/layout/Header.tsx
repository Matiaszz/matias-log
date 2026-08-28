"use client";

import React, { useState } from "react";
import { LogOut, User as UserIcon, Shield, Sparkles } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { UserAvatar } from "@/components/profile/UserAvatar";
import { GoogleLoginButton } from "@/components/auth/GoogleLoginButton";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { ProfileModal } from "@/components/profile/ProfileModal";

export function Header() {
  const { user, loading, signInWithGoogle, signOut } = useAuth();
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b border-zinc-800/80 bg-zinc-950/80 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          {/* Logo / Brand */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-zinc-900 border border-zinc-700/80 flex items-center justify-center text-white shadow-xs">
              <Sparkles className="w-4.5 h-4.5 text-zinc-100" />
            </div>
            <div className="flex flex-col">
              <span className="text-base font-bold tracking-tight text-white leading-tight">
                Matias Log
              </span>
              <span className="text-[11px] text-zinc-400 leading-tight">
                Portal de Acesso & Recrutamento
              </span>
            </div>
          </div>

          {/* User Auth Section */}
          <div className="flex items-center gap-3">
            {loading ? (
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-zinc-800 animate-pulse" />
                <div className="w-20 h-4 bg-zinc-800 rounded-md animate-pulse hidden sm:block" />
              </div>
            ) : user ? (
              <div className="flex items-center gap-3">
                {/* Discrete Profile Completeness Tag */}
                {!user.isProfileComplete && (
                  <button
                    type="button"
                    onClick={() => setIsProfileModalOpen(true)}
                    className="hidden sm:inline-flex"
                  >
                    <Badge variant="warning" size="sm" className="cursor-pointer hover:bg-amber-900/40 transition-colors">
                      Perfil Incompleto
                    </Badge>
                  </button>
                )}

                {/* User greeting and avatar */}
                <button
                  type="button"
                  onClick={() => setIsProfileModalOpen(true)}
                  className="flex items-center gap-2.5 p-1 sm:px-2.5 sm:py-1.5 rounded-full sm:rounded-xl bg-zinc-900/80 hover:bg-zinc-850 border border-zinc-800 transition-colors cursor-pointer text-left"
                >
                  <UserAvatar
                    photoUrl={user.photoUrl}
                    firstName={user.firstName}
                    lastName={user.lastName}
                    isProfileComplete={user.isProfileComplete}
                    size="sm"
                  />
                  <div className="hidden sm:flex flex-col text-xs leading-tight">
                    <span className="font-semibold text-zinc-100">
                      {user.firstName} {user.lastName}
                    </span>
                    <span className="text-[11px] text-zinc-400 truncate max-w-[120px]">
                      {user.occupation}
                    </span>
                  </div>
                </button>

                {/* Sign out button */}
                <Button
                  variant="ghost"
                  size="sm"
                  aria-label="Sair da conta"
                  onClick={signOut}
                  className="text-zinc-400 hover:text-zinc-200"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="hidden md:inline">Sair</span>
                </Button>
              </div>
            ) : (
              <div className="w-48">
                <GoogleLoginButton
                  onClick={signInWithGoogle}
                  size="md"
                  text="Entrar"
                />
              </div>
            )}
          </div>
        </div>
      </header>

      {user && (
        <ProfileModal
          isOpen={isProfileModalOpen}
          onClose={() => setIsProfileModalOpen(false)}
        />
      )}
    </>
  );
}
