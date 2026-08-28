import { UserEntity } from "../domain/user.entity";

export interface UserResponseDto {
  id: string;
  firstName: string;
  lastName: string;
  photoUrl: string;
  occupation: string;
  company: string;
  linkedinUrl?: string;
  githubUrl?: string;
  websiteUrl?: string;
  isProfileComplete: boolean;
  createdAt: string;
}

export function toUserResponseDto(user: UserEntity): UserResponseDto {
  return {
    id: user.id,
    firstName: user.firstName,
    lastName: user.lastName,
    photoUrl: user.photoUrl,
    occupation: user.occupation,
    company: user.company,
    ...(user.linkedinUrl && { linkedinUrl: user.linkedinUrl }),
    ...(user.githubUrl && { githubUrl: user.githubUrl }),
    ...(user.websiteUrl && { websiteUrl: user.websiteUrl }),
    isProfileComplete: user.isProfileComplete,
    createdAt: user.createdAt,
  };
}
