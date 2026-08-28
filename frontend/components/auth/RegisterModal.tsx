"use client";

import React, { useState, useEffect, useRef } from "react";
import { Upload, Trash2, Building, Briefcase, User as UserIcon, AlertCircle } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/context/AuthContext";
import { OCCUPATION_OPTIONS } from "@/types/user.types";

export function RegisterModal() {
  const {
    isPendingRegistration,
    pendingGoogleUser,
    completeRegistration,
    cancelRegistration,
    loading,
    error,
    clearError,
  } = useAuth();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [occupation, setOccupation] = useState("");
  const [company, setCompany] = useState("");
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (pendingGoogleUser) {
      setFirstName(pendingGoogleUser.suggestedFirstName || "");
      setLastName(pendingGoogleUser.suggestedLastName || "");
      setPhotoPreview(pendingGoogleUser.photoUrl || null);
      setOccupation("");
      setCompany("");
      setPhotoFile(null);
      setFormErrors({});
      clearError();
    }
  }, [pendingGoogleUser, clearError]);

  if (!isPendingRegistration || !pendingGoogleUser) {
    return null;
  }

  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const ext = file.name.split(".").pop()?.toLowerCase();
    if (!ext || !["png", "jpg", "jpeg"].includes(ext)) {
      setFormErrors((prev) => ({
        ...prev,
        photo: "Formato inválido. Apenas arquivos PNG, JPG e JPEG são suportados.",
      }));
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setFormErrors((prev) => ({
        ...prev,
        photo: "O arquivo é muito grande. O limite é de 5MB.",
      }));
      return;
    }

    setPhotoFile(file);
    setFormErrors((prev) => {
      const copy = { ...prev };
      delete copy.photo;
      return copy;
    });

    const reader = new FileReader();
    reader.onload = () => {
      setPhotoPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleRemovePhoto = () => {
    setPhotoFile(null);
    setPhotoPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const validate = () => {
    const errors: Record<string, string> = {};
    if (!firstName.trim()) errors.firstName = "O nome é obrigatório.";
    if (!lastName.trim()) errors.lastName = "O sobrenome é obrigatório.";
    if (!occupation.trim()) errors.occupation = "Selecione o seu cargo ou ocupação.";
    if (!company.trim()) errors.company = "Informe a sua empresa ou status atual.";

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    await completeRegistration({
      firstName,
      lastName,
      occupation,
      company,
      photoFile,
      photoPreview,
    });
  };

  return (
    <Modal
      isOpen={isPendingRegistration}
      onClose={cancelRegistration}
      title="Complete seu Cadastro"
      description="Conectado com o Google. Preencha seus dados para finalizar o perfil."
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Email banner */}
        {pendingGoogleUser.email && (
          <div className="flex items-center gap-2 p-3 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-zinc-400">
            <span className="text-zinc-500">Google:</span>
            <span className="text-zinc-200 font-mono truncate">{pendingGoogleUser.email}</span>
          </div>
        )}

        {/* General Error Banner */}
        {error && (
          <div className="flex items-start gap-2.5 p-3.5 bg-red-950/40 border border-red-800/80 rounded-xl text-xs text-red-300">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-400 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Profile Picture Upload (Optional) */}
        <div className="space-y-2">
          <label className="block text-xs font-medium uppercase tracking-wider text-zinc-300">
            Foto de Perfil (Opcional)
          </label>
          <div className="flex items-center gap-4 p-3.5 bg-zinc-950/80 border border-zinc-800 rounded-xl">
            <div className="w-14 h-14 rounded-full overflow-hidden bg-zinc-800 border border-zinc-700 flex items-center justify-center shrink-0">
              {photoPreview ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={photoPreview}
                  alt="Prévia da foto"
                  className="w-full h-full object-cover"
                />
              ) : (
                <UserIcon className="w-7 h-7 text-zinc-500" />
              )}
            </div>

            <div className="flex-1 space-y-1.5">
              <input
                ref={fileInputRef}
                type="file"
                accept=".png,.jpg,.jpeg,image/png,image/jpeg"
                onChange={handlePhotoSelect}
                className="hidden"
                id="profile-picture-upload"
              />
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  leftIcon={<Upload className="w-3.5 h-3.5" />}
                  onClick={() => fileInputRef.current?.click()}
                >
                  {photoPreview ? "Trocar foto" : "Escolher foto"}
                </Button>
                {photoPreview && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="text-red-400 hover:text-red-300"
                    leftIcon={<Trash2 className="w-3.5 h-3.5" />}
                    onClick={handleRemovePhoto}
                  >
                    Remover
                  </Button>
                )}
              </div>
              <p className="text-[11px] text-zinc-500">
                Formatos permitidos: PNG, JPG ou JPEG (máx. 5MB)
              </p>
            </div>
          </div>
          {formErrors.photo && (
            <p className="text-xs text-red-400">{formErrors.photo}</p>
          )}
        </div>

        {/* First & Last Name */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input
            label="Nome"
            required
            placeholder="Ex: João"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            error={formErrors.firstName}
            leftIcon={<UserIcon className="w-4 h-4" />}
          />
          <Input
            label="Sobrenome"
            required
            placeholder="Ex: Silva"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            error={formErrors.lastName}
          />
        </div>

        {/* Cargo / Ocupação */}
        <Select
          label="Cargo / Ocupação"
          required
          placeholder="Selecione sua ocupação..."
          options={OCCUPATION_OPTIONS}
          value={occupation}
          onChange={(e) => setOccupation(e.target.value)}
          error={formErrors.occupation}
          hint="Usado para conectar potenciais recrutadores e profissionais"
        />

        {/* Empresa */}
        <Input
          label="Empresa Atual"
          required
          placeholder="Ex: Tech Corp, Freelancer, Estudante..."
          value={company}
          onChange={(e) => setCompany(e.target.value)}
          error={formErrors.company}
          leftIcon={<Building className="w-4 h-4" />}
        />

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-zinc-800/80">
          <Button
            type="button"
            variant="outline"
            onClick={cancelRegistration}
            disabled={loading}
          >
            Cancelar
          </Button>
          <Button type="submit" variant="primary" isLoading={loading}>
            Concluir Cadastro
          </Button>
        </div>
      </form>
    </Modal>
  );
}
