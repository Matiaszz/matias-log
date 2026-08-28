"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  ReactNode,
} from "react";
import {
  GoogleAuthProvider,
  signInWithPopup,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User as FirebaseUser,
} from "firebase/auth";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { auth, storage } from "@/lib/firebase";
import { userService } from "@/lib/services/user.service";
import {
  UserResponseDto,
  GoogleLoginDto,
  UpdateProfileDto,
  DEFAULT_PROFILE_PICTURE,
} from "@/types/user.types";

export interface PendingGoogleUser {
  idToken: string;
  firebaseUid: string;
  email: string | null;
  suggestedFirstName: string;
  suggestedLastName: string;
  photoUrl?: string;
}

export interface RegisterFormData {
  firstName: string;
  lastName: string;
  occupation: string;
  company: string;
  photoFile?: File | null;
  photoPreview?: string | null;
}

interface AuthContextType {
  firebaseUser: FirebaseUser | null;
  user: UserResponseDto | null;
  idToken: string | null;
  loading: boolean;
  isPendingRegistration: boolean;
  pendingGoogleUser: PendingGoogleUser | null;
  error: string | null;
  signInWithGoogle: () => Promise<void>;
  completeRegistration: (data: RegisterFormData) => Promise<boolean>;
  cancelRegistration: () => Promise<void>;
  updateProfile: (data: UpdateProfileDto) => Promise<boolean>;
  uploadProfilePicture: (file: File) => Promise<boolean>;
  refreshUser: () => Promise<void>;
  signOut: () => Promise<void>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function getFileExtension(filename: string): "png" | "jpg" | "jpeg" | null {
  const ext = filename.split(".").pop()?.toLowerCase();
  if (ext === "png") return "png";
  if (ext === "jpg") return "jpg";
  if (ext === "jpeg") return "jpeg";
  return null;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [user, setUser] = useState<UserResponseDto | null>(null);
  const [idToken, setIdToken] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isPendingRegistration, setIsPendingRegistration] = useState<boolean>(false);
  const [pendingGoogleUser, setPendingGoogleUser] = useState<PendingGoogleUser | null>(null);
  const [error, setError] = useState<string | null>(null);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const syncBackendUser = useCallback(async (fUser: FirebaseUser) => {
    try {
      const token = await fUser.getIdToken();
      setIdToken(token);

      // Attempt to get existing user from backend
      const meResponse = await userService.getMe(token);

      if (meResponse.success && meResponse.data) {
        setUser(meResponse.data);
        setIsPendingRegistration(false);
        setPendingGoogleUser(null);
        return;
      }

      // If user not found on backend, prompt for registration completion
      const nameParts = (fUser.displayName || "").trim().split(" ");
      const suggestedFirstName = nameParts[0] || "";
      const suggestedLastName = nameParts.slice(1).join(" ") || "";

      setPendingGoogleUser({
        idToken: token,
        firebaseUid: fUser.uid,
        email: fUser.email,
        suggestedFirstName,
        suggestedLastName,
        photoUrl: fUser.photoURL || undefined,
      });
      setIsPendingRegistration(true);
      setUser(null);
    } catch (err) {
      console.error("Erro ao sincronizar usuário:", err);
      setError("Erro ao carregar dados do usuário.");
    }
  }, []);

  // Monitor Firebase Auth state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (fUser) => {
      setLoading(true);
      setFirebaseUser(fUser);

      if (fUser) {
        await syncBackendUser(fUser);
      } else {
        setUser(null);
        setIdToken(null);
        setIsPendingRegistration(false);
        setPendingGoogleUser(null);
      }

      setLoading(false);
    });

    return () => unsubscribe();
  }, [syncBackendUser]);

  const signInWithGoogle = async () => {
    try {
      setError(null);
      setLoading(true);
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: "select_account" });
      const result = await signInWithPopup(auth, provider);
      const fUser = result.user;
      const token = await fUser.getIdToken();
      setIdToken(token);

      // Try initial login
      const nameParts = (fUser.displayName || "").trim().split(" ");
      const suggestedFirstName = nameParts[0] || "";
      const suggestedLastName = nameParts.slice(1).join(" ") || "";

      // Attempt backend google login with minimal info
      const loginPayload: GoogleLoginDto = {
        idToken: token,
        firstName: suggestedFirstName,
        lastName: suggestedLastName,
        photoUrl: fUser.photoURL || DEFAULT_PROFILE_PICTURE,
      };

      const response = await userService.googleLogin(loginPayload);

      if (response.success && response.data) {
        setUser(response.data);
        setIsPendingRegistration(false);
        setPendingGoogleUser(null);
      } else {
        // Needs mandatory registration fields (occupation, company)
        setPendingGoogleUser({
          idToken: token,
          firebaseUid: fUser.uid,
          email: fUser.email,
          suggestedFirstName,
          suggestedLastName,
          photoUrl: fUser.photoURL || undefined,
        });
        setIsPendingRegistration(true);
      }
    } catch (err: unknown) {
      const fbErr = err as { code?: string; message?: string };
      if (fbErr.code !== "auth/popup-closed-by-user" && fbErr.code !== "auth/cancelled-popup-request") {
        setError(fbErr.message || "Falha na autenticação com o Google.");
      }
    } finally {
      setLoading(false);
    }
  };

  const completeRegistration = async (data: RegisterFormData): Promise<boolean> => {
    if (!pendingGoogleUser || !idToken) {
      setError("Sessão de registro inválida ou expirada. Tente fazer login novamente.");
      return false;
    }

    try {
      setLoading(true);
      setError(null);

      let chosenPhotoUrl = pendingGoogleUser.photoUrl || DEFAULT_PROFILE_PICTURE;

      // Direct, safe upload to Firebase Storage from frontend
      if (data.photoFile) {
        const ext = getFileExtension(data.photoFile.name);
        if (ext) {
          const mimeType = ext === "png" ? "image/png" : "image/jpeg";
          const storageRef = ref(
            storage,
            `pictures/${pendingGoogleUser.firebaseUid}/profilePicture.${ext}`
          );
          await uploadBytes(storageRef, data.photoFile, { contentType: mimeType });
          chosenPhotoUrl = await getDownloadURL(storageRef);
        }
      }

      const payload: GoogleLoginDto = {
        idToken,
        firstName: data.firstName.trim(),
        lastName: data.lastName.trim(),
        occupation: data.occupation.trim(),
        company: data.company.trim(),
        photoUrl: chosenPhotoUrl,
      };

      const response = await userService.googleLogin(payload);

      if (!response.success || !response.data) {
        setError(response.error?.message || "Erro ao concluir cadastro.");
        return false;
      }

      setUser(response.data);
      setIsPendingRegistration(false);
      setPendingGoogleUser(null);
      return true;
    } catch (err) {
      console.error("Erro ao registrar:", err);
      setError("Ocorreu um erro ao salvar seu cadastro.");
      return false;
    } finally {
      setLoading(false);
    }
  };

  const cancelRegistration = async () => {
    setIsPendingRegistration(false);
    setPendingGoogleUser(null);
    await firebaseSignOut(auth);
    setUser(null);
    setIdToken(null);
  };

  const updateProfile = async (data: UpdateProfileDto): Promise<boolean> => {
    if (!idToken) {
      setError("Usuário não autenticado.");
      return false;
    }

    try {
      setLoading(true);
      setError(null);
      const res = await userService.updateProfile(data, idToken);

      if (res.success && res.data) {
        setUser(res.data);
        return true;
      } else {
        setError(res.error?.message || "Erro ao atualizar dados.");
        return false;
      }
    } catch (err) {
      console.error("Erro ao atualizar perfil:", err);
      setError("Erro de rede ao salvar alterações.");
      return false;
    } finally {
      setLoading(false);
    }
  };

  const uploadProfilePicture = async (file: File): Promise<boolean> => {
    if (!firebaseUser || !idToken) {
      setError("Usuário não autenticado.");
      return false;
    }

    const ext = getFileExtension(file.name);
    if (!ext) {
      setError("Formato de arquivo inválido. Use apenas PNG, JPG ou JPEG.");
      return false;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("Tamanho máximo de imagem é 5MB.");
      return false;
    }

    try {
      setLoading(true);
      setError(null);

      const mimeType = ext === "png" ? "image/png" : "image/jpeg";
      const storageRef = ref(storage, `pictures/${firebaseUser.uid}/profilePicture.${ext}`);

      // Direct upload from frontend to Firebase Storage (enforced by storage security rules)
      await uploadBytes(storageRef, file, { contentType: mimeType });
      const downloadUrl = await getDownloadURL(storageRef);

      // Update profile with the new public photo URL
      const res = await userService.updateProfile({ photoUrl: downloadUrl }, idToken);

      if (res.success && res.data) {
        setUser(res.data);
        return true;
      } else {
        setError(res.error?.message || "Erro ao atualizar foto no perfil.");
        return false;
      }
    } catch (err: unknown) {
      console.error("Erro ao fazer upload da foto:", err);
      const errorObj = err as Error;
      setError(errorObj.message || "Erro ao processar e salvar a imagem.");
      return false;
    } finally {
      setLoading(false);
    }
  };

  const refreshUser = async () => {
    if (!idToken) return;
    try {
      const res = await userService.getMe(idToken);
      if (res.success && res.data) {
        setUser(res.data);
      }
    } catch (err) {
      console.error("Erro ao atualizar dados:", err);
    }
  };

  const signOut = async () => {
    try {
      setLoading(true);
      await firebaseSignOut(auth);
      setUser(null);
      setIdToken(null);
      setIsPendingRegistration(false);
      setPendingGoogleUser(null);
      setError(null);
    } catch (err) {
      console.error("Erro ao sair:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        firebaseUser,
        user,
        idToken,
        loading,
        isPendingRegistration,
        pendingGoogleUser,
        error,
        signInWithGoogle,
        completeRegistration,
        cancelRegistration,
        updateProfile,
        uploadProfilePicture,
        refreshUser,
        signOut,
        clearError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth deve ser usado dentro de um AuthProvider");
  }
  return context;
}
