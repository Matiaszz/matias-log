import { Response } from "express";
import { randomUUID } from "crypto";
import { firebaseAdminAuth } from "../../../shared/infrastructure/firebaseAdmin";
import { sendError, sendSuccess } from "../../../shared/infrastructure/utils/apiResponse";
import { ErrorCode } from "../../../shared/infrastructure/types/api.types";
import { AuthenticatedRequest } from "../../../shared/infrastructure/middlewares/auth.middleware";
import { userRepository } from "../repositories/user.repository";
import { UserEntity, DEFAULT_PROFILE_PICTURE, checkIsProfileComplete } from "../domain/user.entity";
import { toUserResponseDto } from "../dto/user-response.dto";
import { GoogleLoginDto } from "../dto/google-login.dto";
import { UpdateProfileDto } from "../dto/update-profile.dto";

export class UserController {
  /**
   * Handle Google Login / Registration
   * Endpoint: POST /api/users/google-login
   */
  public async googleLogin(req: AuthenticatedRequest, res: Response): Promise<void> {
    const { idToken, firstName, lastName, occupation, company, photoUrl } = req.body as GoogleLoginDto;

    if (!idToken) {
      sendError(res, ErrorCode.BAD_REQUEST, req.path, {
        message: "O idToken do Google é obrigatório.",
      });
      return;
    }

    let decodedToken;
    try {
      decodedToken = await firebaseAdminAuth.verifyIdToken(idToken);
    } catch {
      sendError(res, ErrorCode.UNAUTHORIZED, req.path, {
        message: "Token do Google inválido ou expirado.",
      });
      return;
    }

    const firebaseUid = decodedToken.uid;
    const email = decodedToken.email || "";

    const existingUser = await userRepository.findByFirebaseUid(firebaseUid);

    if (existingUser) {
      sendSuccess(res, toUserResponseDto(existingUser));
      return;
    }

    if (!firstName || !lastName || !occupation || !company) {
      sendError(res, ErrorCode.BAD_REQUEST, req.path, {
        message: "Campos obrigatórios para registro: nome, sobrenome, ocupação e empresa.",
      });
      return;
    }

    const newUserId = randomUUID();
    const now = new Date().toISOString();

    const newUser: UserEntity = {
      id: newUserId,
      firebaseUid,
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email,
      photoUrl: photoUrl && photoUrl.trim() ? photoUrl.trim() : DEFAULT_PROFILE_PICTURE,
      occupation: occupation.trim(),
      company: company.trim(),
      isProfileComplete: false,
      createdAt: now,
      updatedAt: now,
    };

    newUser.isProfileComplete = checkIsProfileComplete(newUser);

    const savedUser = await userRepository.create(newUser);
    sendSuccess(res, toUserResponseDto(savedUser), 201);
  }

  /**
   * Get current authenticated user profile
   * Endpoint: GET /api/users/me
   */
  public async getMe(req: AuthenticatedRequest, res: Response): Promise<void> {
    if (!req.firebaseUid) {
      sendError(res, ErrorCode.UNAUTHORIZED, req.path);
      return;
    }

    const user = await userRepository.findByFirebaseUid(req.firebaseUid);

    if (!user) {
      sendError(res, ErrorCode.NOT_FOUND, req.path, {
        message: "Usuário não encontrado.",
      });
      return;
    }

    sendSuccess(res, toUserResponseDto(user));
  }

  /**
   * Update profile details
   * Endpoint: PATCH /api/users/me
   */
  public async updateProfile(req: AuthenticatedRequest, res: Response): Promise<void> {
    if (!req.firebaseUid) {
      sendError(res, ErrorCode.UNAUTHORIZED, req.path);
      return;
    }

    const user = await userRepository.findByFirebaseUid(req.firebaseUid);

    if (!user) {
      sendError(res, ErrorCode.NOT_FOUND, req.path, {
        message: "Usuário não encontrado.",
      });
      return;
    }

    const { firstName, lastName, occupation, company, linkedinUrl, githubUrl, websiteUrl, photoUrl } =
      req.body as UpdateProfileDto;

    const isValidUrl = (url?: string) => {
      if (!url) return true;
      try {
        new URL(url);
        return true;
      } catch {
        return false;
      }
    };

    if (!isValidUrl(linkedinUrl) || !isValidUrl(githubUrl) || !isValidUrl(websiteUrl)) {
      sendError(res, ErrorCode.BAD_REQUEST, req.path, {
        message: "Uma ou mais URLs fornecidas são inválidas.",
      });
      return;
    }

    const updates: Partial<UserEntity> = {};

    if (firstName) updates.firstName = firstName.trim();
    if (lastName) updates.lastName = lastName.trim();
    if (occupation) updates.occupation = occupation.trim();
    if (company) updates.company = company.trim();
    if (linkedinUrl !== undefined) updates.linkedinUrl = linkedinUrl.trim();
    if (githubUrl !== undefined) updates.githubUrl = githubUrl.trim();
    if (websiteUrl !== undefined) updates.websiteUrl = websiteUrl.trim();
    if (photoUrl) updates.photoUrl = photoUrl.trim();

    const mergedUser = { ...user, ...updates };
    updates.isProfileComplete = checkIsProfileComplete(mergedUser);

    const updatedUser = await userRepository.update(user.id, updates);

    if (!updatedUser) {
      sendError(res, ErrorCode.INTERNAL_ERROR, req.path, {
        message: "Erro ao atualizar perfil.",
      });
      return;
    }

    sendSuccess(res, toUserResponseDto(updatedUser));
  }
}

export const userController = new UserController();
