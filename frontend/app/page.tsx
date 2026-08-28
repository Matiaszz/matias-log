"use client";

import React, { useState } from "react";
import {
  Globe,
  Building,
  Briefcase,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Edit3,
  Sparkles,
} from "lucide-react";
import { LinkedinIcon, GithubIcon } from "@/components/ui/Icons";
import { useAuth } from "@/context/AuthContext";
import { GoogleLoginButton } from "@/components/auth/GoogleLoginButton";
import { UserAvatar } from "@/components/profile/UserAvatar";
import { ProfileModal } from "@/components/profile/ProfileModal";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";

export default function HomePage() {
  const { user, loading, signInWithGoogle, signOut } = useAuth();
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-3 border-zinc-700 border-t-white rounded-full animate-spin" />
          <p className="text-sm text-zinc-400 font-medium">Carregando...</p>
        </div>
      </div>
    );
  }

  // LOGGED-IN STATE
  if (user) {
    return (
      <div className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-10 space-y-8">
        {/* Welcome Greeting */}
        <section className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-xs font-medium text-zinc-400">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Sessão Ativa</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-white">
            Olá, {user.firstName}! 👋
          </h1>
          <p className="text-base text-zinc-400">
            Que bom ver você por aqui. Seu perfil profissional está pronto no sistema.
          </p>
        </section>

        {/* Incomplete Profile Discrete Banner */}
        {!user.isProfileComplete && (
          <div className="p-4 sm:p-5 rounded-2xl bg-amber-950/20 border border-amber-800/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3.5">
              <div className="p-2 rounded-xl bg-amber-900/40 border border-amber-700/50 text-amber-400 shrink-0 mt-0.5 sm:mt-0">
                <AlertCircle className="w-5 h-5" />
              </div>
              <div className="space-y-0.5">
                <h3 className="text-sm font-semibold text-amber-200">
                  Complete seu perfil para maior visibilidade
                </h3>
                <p className="text-xs text-zinc-400">
                  Adicione seus links de LinkedIn, GitHub e Site pessoal para remover o aviso e se destacar para recrutadores.
                </p>
              </div>
            </div>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setIsProfileModalOpen(true)}
              className="shrink-0 bg-amber-900/30 text-amber-200 border-amber-700/60 hover:bg-amber-900/60 font-medium"
            >
              Completar Perfil
            </Button>
          </div>
        )}

        {/* Profile Card */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Main User Info Card */}
          <div className="md:col-span-2 bg-zinc-900/70 border border-zinc-800 rounded-2xl p-6 sm:p-8 space-y-6 shadow-xs">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-zinc-800/80">
              <div className="flex items-center gap-4">
                <UserAvatar
                  photoUrl={user.photoUrl}
                  firstName={user.firstName}
                  lastName={user.lastName}
                  isProfileComplete={user.isProfileComplete}
                  size="xl"
                  onClick={() => setIsProfileModalOpen(true)}
                />
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h2 className="text-xl font-bold text-white">
                      {user.firstName} {user.lastName}
                    </h2>
                    <Badge
                      variant={user.isProfileComplete ? "success" : "warning"}
                      size="sm"
                    >
                      {user.isProfileComplete ? "Perfil Completo" : "Perfil Incompleto"}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-zinc-400">
                    <Briefcase className="w-4 h-4 text-zinc-500 shrink-0" />
                    <span className="font-medium text-zinc-200">{user.occupation}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-zinc-400">
                    <Building className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
                    <span>{user.company}</span>
                  </div>
                </div>
              </div>

              <Button
                variant="secondary"
                size="sm"
                leftIcon={<Edit3 className="w-3.5 h-3.5" />}
                onClick={() => setIsProfileModalOpen(true)}
                className="w-full sm:w-auto"
              >
                Editar Perfil
              </Button>
            </div>

            {/* Social / Recruiter Links */}
            <div className="space-y-3">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                Links & Portfólio
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* LinkedIn */}
                {user.linkedinUrl ? (
                  <a
                    href={user.linkedinUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-3 rounded-xl bg-zinc-950/80 border border-zinc-800 hover:border-zinc-700 transition-colors group"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <LinkedinIcon className="w-4 h-4 text-sky-400 shrink-0" />
                      <span className="text-xs font-medium text-zinc-200 truncate">
                        LinkedIn
                      </span>
                    </div>
                    <ExternalLink className="w-3.5 h-3.5 text-zinc-500 group-hover:text-zinc-300 shrink-0" />
                  </a>
                ) : (
                  <button
                    type="button"
                    onClick={() => setIsProfileModalOpen(true)}
                    className="flex items-center justify-between p-3 rounded-xl bg-zinc-950/40 border border-dashed border-zinc-800 hover:border-zinc-700 transition-colors text-left"
                  >
                    <div className="flex items-center gap-2.5">
                      <LinkedinIcon className="w-4 h-4 text-zinc-600 shrink-0" />
                      <span className="text-xs text-zinc-500">+ Adicionar LinkedIn</span>
                    </div>
                  </button>
                )}

                {/* GitHub */}
                {user.githubUrl ? (
                  <a
                    href={user.githubUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-3 rounded-xl bg-zinc-950/80 border border-zinc-800 hover:border-zinc-700 transition-colors group"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <GithubIcon className="w-4 h-4 text-zinc-100 shrink-0" />
                      <span className="text-xs font-medium text-zinc-200 truncate">
                        GitHub
                      </span>
                    </div>
                    <ExternalLink className="w-3.5 h-3.5 text-zinc-500 group-hover:text-zinc-300 shrink-0" />
                  </a>
                ) : (
                  <button
                    type="button"
                    onClick={() => setIsProfileModalOpen(true)}
                    className="flex items-center justify-between p-3 rounded-xl bg-zinc-950/40 border border-dashed border-zinc-800 hover:border-zinc-700 transition-colors text-left"
                  >
                    <div className="flex items-center gap-2.5">
                      <GithubIcon className="w-4 h-4 text-zinc-600 shrink-0" />
                      <span className="text-xs text-zinc-500">+ Adicionar GitHub</span>
                    </div>
                  </button>
                )}

                {/* Website */}
                {user.websiteUrl ? (
                  <a
                    href={user.websiteUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-3 rounded-xl bg-zinc-950/80 border border-zinc-800 hover:border-zinc-700 transition-colors group"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <Globe className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span className="text-xs font-medium text-zinc-200 truncate">
                        Site
                      </span>
                    </div>
                    <ExternalLink className="w-3.5 h-3.5 text-zinc-500 group-hover:text-zinc-300 shrink-0" />
                  </a>
                ) : (
                  <button
                    type="button"
                    onClick={() => setIsProfileModalOpen(true)}
                    className="flex items-center justify-between p-3 rounded-xl bg-zinc-950/40 border border-dashed border-zinc-800 hover:border-zinc-700 transition-colors text-left"
                  >
                    <div className="flex items-center gap-2.5">
                      <Globe className="w-4 h-4 text-zinc-600 shrink-0" />
                      <span className="text-xs text-zinc-500">+ Adicionar Site</span>
                    </div>
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Account Details & Metadata Card */}
          <div className="bg-zinc-900/70 border border-zinc-800 rounded-2xl p-6 flex flex-col justify-between gap-6">
            <div className="space-y-4">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                Informações da Conta
              </h3>

              <div className="space-y-3 text-xs">
                <div>
                  <span className="text-zinc-500 block">Identificador Único (UUID)</span>
                  <span className="font-mono text-zinc-300 text-[11px] break-all">
                    {user.id}
                  </span>
                </div>

                <div>
                  <span className="text-zinc-500 block">Cadastrado em</span>
                  <span className="text-zinc-300">
                    {new Date(user.createdAt).toLocaleDateString("pt-BR", {
                      day: "2-digit",
                      month: "long",
                      year: "numeric",
                    })}
                  </span>
                </div>

                <div>
                  <span className="text-zinc-500 block">Status de Recrutamento</span>
                  <span className="text-zinc-300">
                    Mapeado como: <strong className="text-white">{user.occupation}</strong>
                  </span>
                </div>
              </div>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={signOut}
              className="w-full text-zinc-400 hover:text-zinc-100"
            >
              Desconectar
            </Button>
          </div>
        </div>

        <ProfileModal
          isOpen={isProfileModalOpen}
          onClose={() => setIsProfileModalOpen(false)}
        />
      </div>
    );
  }

  // LOGGED-OUT STATE
  return (
    <div className="flex-1 flex items-center justify-center p-4 sm:p-6 my-auto">
      <div className="w-full max-w-md bg-zinc-900/80 border border-zinc-800 rounded-3xl p-8 sm:p-10 shadow-2xl space-y-8 text-center">
        {/* Header Icon */}
        <div className="mx-auto w-14 h-14 rounded-2xl bg-zinc-800 border border-zinc-700/80 flex items-center justify-center shadow-inner">
          <Sparkles className="w-7 h-7 text-white" />
        </div>

        {/* Title & Description */}
        <div className="space-y-2">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
            Acesse sua Conta
          </h1>
          <p className="text-sm text-zinc-400 max-w-xs mx-auto">
            Entre com sua conta Google para gerenciar seu perfil e conectar-se à rede de recrutadores.
          </p>
        </div>

        {/* Google Login Action */}
        <div className="space-y-4">
          <GoogleLoginButton onClick={signInWithGoogle} size="lg" />
          <p className="text-[11px] text-zinc-500">
            Autenticação segura via Google OAuth 2.0.
          </p>
        </div>

        {/* Features Checklist */}
        <div className="pt-6 border-t border-zinc-800/80 space-y-2.5 text-left text-xs text-zinc-400">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Cadastro simplificado com nome, cargo e empresa</span>
          </div>
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Foto de perfil com suporte a PNG, JPG e JPEG</span>
          </div>
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Mapeamento de cargos para insights de recrutamento</span>
          </div>
        </div>
      </div>
    </div>
  );
}
