import { Occupation } from "./occupation.enum";

export const DEFAULT_PROFILE_PICTURE = "standardProfilePicture/profilePicture.png";

export interface UserEntity {
  id: string;
  firebaseUid: string;
  firstName: string;
  lastName: string;
  email: string;
  photoUrl: string;
  occupation: Occupation | string;
  company: string;
  linkedinUrl?: string;
  githubUrl?: string;
  websiteUrl?: string;
  isProfileComplete: boolean;
  createdAt: string;
  updatedAt: string;
}

/**
 * Evaluates whether a profile is complete.
 * Returns false if optional links (LinkedIn, GitHub, Website) are empty,
 * triggering the discrete yellow border + exclamation mark on the UI.
 */
export function checkIsProfileComplete(user: Partial<UserEntity>): boolean {
  const hasLinkedin = Boolean(user.linkedinUrl && user.linkedinUrl.trim().length > 0);
  const hasGithub = Boolean(user.githubUrl && user.githubUrl.trim().length > 0);
  const hasWebsite = Boolean(user.websiteUrl && user.websiteUrl.trim().length > 0);

  return hasLinkedin && hasGithub && hasWebsite;
}
