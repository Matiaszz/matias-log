"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Globe,
  Building,
  Upload,
  CheckCircle2,
  AlertCircle,
  Camera,
} from "lucide-react";
import { LinkedinIcon, GithubIcon } from "@/components/ui/Icons";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { UserAvatar } from "@/components/profile/UserAvatar";
import { useAuth } from "@/context/AuthContext";
import { OCCUPATION_OPTIONS } from "@/types/user.types";

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ProfileModal({ isOpen, onClose }: ProfileModalProps) {
  const { user, updateProfile, uploadProfilePicture, loading, error, clearError } = useAuth();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [occupation, setOccupation] = useState("");
  const [company, setCompany] = useState("");
  const [linkedinUrl, setLinkedinUrl] = useState("");
  const [githubUrl, setGithubUrl] = useState("");
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (user && isOpen) {
      setFirstName(user.firstName || "");
      setLastName(user.lastName || "");
      setOccupation(user.occupation || "");
      setCompany(user.company || "");
      setLinkedinUrl(user.linkedinUrl || "");
      setGithubUrl(user.githubUrl || "");
      setWebsiteUrl(user.websiteUrl || "");
      setFormErrors({});
      setSuccessMessage(null);
      clearError();
    }
  }, [user, isOpen, clearError]);

  if (!user) return null;

  const validateUrl = (url: string): boolean => {
    if (!url.trim()) return true;
    try {
      new URL(url.trim());
      return true;
    } catch {
      return false;
    }
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const ext = file.name.split(".").pop()?.toLowerCase();
    if (!ext || !["png", "jpg", "jpeg"].includes(ext)) {
      setFormErrors((prev) => ({
        ...prev,
        photo: "Apenas imagens PNG, JPG ou JPEG são permitidas.",
      }));
      return;
    }

    const success = await uploadProfilePicture(file);
    if (success) {
      setSuccessMessage("Foto de perfil atualizada com sucesso!");
      setTimeout(() => setSuccessMessage(null), 3000);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errors: Record<string, string> = {};

    if (!firstName.trim()) errors.firstName = "Nome é obrigatório.";
    if (!lastName.trim()) errors.lastName = "Sobrenome é obrigatório.";
    if (!occupation.trim()) errors.occupation = "Cargo é obrigatório.";
    if (!company.trim()) errors.company = "Empresa é obrigatória.";

    if (linkedinUrl && !validateUrl(linkedinUrl)) {
      errors.linkedinUrl = "URL do LinkedIn inválida (inclua https://).";
    }
    if (githubUrl && !validateUrl(githubUrl)) {
      errors.githubUrl = "URL do GitHub inválida (inclua https://).";
    }
    if (websiteUrl && !validateUrl(websiteUrl)) {
      errors.websiteUrl = "URL do Website inválida (inclua https://).";
    }

    setFormErrors(errors);
    if (Object.keys(errors).length > 0) return;

    const ok = await updateProfile({
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      occupation: occupation.trim(),
      company: company.trim(),
      linkedinUrl: linkedinUrl.trim() || undefined,
      githubUrl: githubUrl.trim() || undefined,
      websiteUrl: websiteUrl.trim() || undefined,
    });

    if (ok) {
      setSuccessMessage("Perfil atualizado com sucesso!");
      setTimeout(() => {
        setSuccessMessage(null);
        onClose();
      }, 1200);
    }
  };

  const hasLinkedin = Boolean(linkedinUrl.trim());
  const hasGithub = Boolean(githubUrl.trim());
  const hasWebsite = Boolean(websiteUrl.trim());
  const willBeComplete = hasLinkedin && hasGithub && hasWebsite;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Editar Perfil"
      description="Gerencie suas informações profissionais e links de contato."
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Profile Status Banner */}
        <div
          className={`p-3.5 rounded-xl border flex items-start gap-3 text-xs ${
            user.isProfileComplete
              ? "bg-emerald-950/30 border-emerald-800/60 text-emerald-300"
              : "bg-amber-950/30 border-amber-800/60 text-amber-300"
          }`}
        >
          {user.isProfileComplete ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
          ) : (
            <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          )}
          <div className="space-y-1">
            <p className="font-semibold">
              {user.isProfileComplete
                ? "Perfil 100% Completo"
                : "Perfil Incompleto (Borda amarela na foto)"}
            </p>
            <p className="text-zinc-400">
              {user.isProfileComplete
                ? "Seus links sociais e dados profissionais estão preenchidos."
                : "Para remover a marcação discreta de perfil incompleto, preencha os 3 links sociais: LinkedIn, GitHub e Site."}
            </p>
          </div>
        </div>

        {/* Success / Error Feedback */}
        {successMessage && (
          <div className="p-3 bg-emerald-950/50 border border-emerald-800 text-emerald-200 text-xs rounded-xl flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        {error && (
          <div className="p-3 bg-red-950/50 border border-red-800 text-red-200 text-xs rounded-xl flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Photo change area */}
        <div className="flex items-center gap-4 p-4 bg-zinc-950/60 border border-zinc-800 rounded-xl">
          <div className="relative">
            <UserAvatar
              photoUrl={user.photoUrl}
              firstName={user.firstName}
              lastName={user.lastName}
              isProfileComplete={user.isProfileComplete}
              size="xl"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="absolute -bottom-1 -right-1 p-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-full border border-zinc-700 shadow-md transition-colors cursor-pointer"
              title="Trocar foto de perfil"
            >
              <Camera className="w-3.5 h-3.5" />
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".png,.jpg,.jpeg,image/png,image/jpeg"
              onChange={handlePhotoUpload}
              className="hidden"
            />
          </div>

          <div className="flex-1 space-y-1">
            <p className="text-sm font-medium text-zinc-200">Foto de Perfil</p>
            <p className="text-xs text-zinc-400">
              Salva no Cloud Storage com formato PNG, JPG ou JPEG.
            </p>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              leftIcon={<Upload className="w-3.5 h-3.5" />}
              onClick={() => fileInputRef.current?.click()}
              isLoading={loading}
            >
              Carregar nova foto
            </Button>
          </div>
        </div>

        {/* Basic Info */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input
            label="Nome"
            required
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            error={formErrors.firstName}
          />
          <Input
            label="Sobrenome"
            required
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            error={formErrors.lastName}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Select
            label="Cargo / Ocupação"
            required
            options={OCCUPATION_OPTIONS}
            value={occupation}
            onChange={(e) => setOccupation(e.target.value)}
            error={formErrors.occupation}
          />
          <Input
            label="Empresa"
            required
            value={company}
            onChange={(e) => setCompany(e.target.value)}
            error={formErrors.company}
            leftIcon={<Building className="w-4 h-4" />}
          />
        </div>

        {/* Social / Portfolio Links for Recruiter Insights */}
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold uppercase tracking-wider text-zinc-300">
              Links Profissionais & Portfólio
            </label>
            <Badge
              variant={willBeComplete ? "success" : "warning"}
              size="sm"
            >
              {[hasLinkedin, hasGithub, hasWebsite].filter(Boolean).length}/3 Links
            </Badge>
          </div>

          <Input
            label="LinkedIn URL"
            placeholder="https://linkedin.com/in/seuperfil"
            value={linkedinUrl}
            onChange={(e) => setLinkedinUrl(e.target.value)}
            error={formErrors.linkedinUrl}
            leftIcon={<LinkedinIcon className="w-4 h-4 text-sky-400" />}
          />

          <Input
            label="GitHub URL"
            placeholder="https://github.com/seuperfil"
            value={githubUrl}
            onChange={(e) => setGithubUrl(e.target.value)}
            error={formErrors.githubUrl}
            leftIcon={<GithubIcon className="w-4 h-4 text-zinc-300" />}
          />

          <Input
            label="Site / Portfólio URL"
            placeholder="https://seusite.com"
            value={websiteUrl}
            onChange={(e) => setWebsiteUrl(e.target.value)}
            error={formErrors.websiteUrl}
            leftIcon={<Globe className="w-4 h-4 text-emerald-400" />}
          />
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-zinc-800/80">
          <Button type="button" variant="outline" onClick={onClose}>
            Fechar
          </Button>
          <Button type="submit" variant="primary" isLoading={loading}>
            Salvar Alterações
          </Button>
        </div>
      </form>
    </Modal>
  );
}
