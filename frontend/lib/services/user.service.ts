import { Api } from "@/lib/api";
import { ApiResponse } from "@/types/api.types";
import {
  GoogleLoginDto,
  UpdateProfileDto,
  UploadPhotoDto,
  UserResponseDto,
} from "@/types/user.types";

export class UserService {
  /**
   * Performs Google Login or Registration on backend.
   * If the user already exists in Firestore, backend logs them in and returns 200.
   * If new, backend requires firstName, lastName, occupation, company and returns 201.
   */
  public async googleLogin(dto: GoogleLoginDto): Promise<ApiResponse<UserResponseDto>> {
    return Api.post<UserResponseDto>("/users/google-login", dto);
  }

  /**
   * Fetches the current authenticated user profile.
   */
  public async getMe(idToken: string): Promise<ApiResponse<UserResponseDto>> {
    return Api.get<UserResponseDto>("/users/me", undefined, {
      headers: {
        Authorization: `Bearer ${idToken}`,
      },
    });
  }

  /**
   * Updates profile information (links, names, occupation, company, etc.).
   */
  public async updateProfile(
    dto: UpdateProfileDto,
    idToken: string
  ): Promise<ApiResponse<UserResponseDto>> {
    return Api.patch<UserResponseDto>("/users/me", dto, {
      headers: {
        Authorization: `Bearer ${idToken}`,
      },
    });
  }

  /**
   * Uploads base64 encoded profile picture to Firebase Storage via backend.
   */
  public async uploadPhoto(
    dto: UploadPhotoDto,
    idToken: string
  ): Promise<ApiResponse<UserResponseDto>> {
    return Api.post<UserResponseDto>("/users/me/photo", dto, {
      headers: {
        Authorization: `Bearer ${idToken}`,
      },
    });
  }
}

export const userService = new UserService();
