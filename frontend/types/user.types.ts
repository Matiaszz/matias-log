export enum Occupation {
  ESTUDANTE = "Estudante",
  ESTAGIARIO = "Estagiário",
  DEV_JUNIOR = "Desenvolvedor Júnior",
  DEV_PLENO = "Desenvolvedor Pleno",
  DEV_SENIOR = "Desenvolvedor Sênior",
  TECH_LEAD = "Tech Lead",
  TECH_RECRUITER = "Tech Recruiter",
  ENGINEERING_MANAGER = "Engineering Manager",
  SCRUM_MASTER = "Scrum Master / Agile Coach",
  PRODUCT_OWNER = "Product Owner / Product Manager",
  SOFTWARE_ARCHITECT = "Arquitetura de Software / Sistemas",
  IT_GOVERNANCE = "Governança de T.I. / COBIT / ITIL",
  IT_MANAGER = "Gerente de T.I. / Diretor de T.I.",
  PROFESSOR = "Professor",
  CTO = "CTO",
  CEO = "CEO",
  IT_CONSULTANT = "Consultor de T.I.",
  OUTRO = "Outro",
}

export const OCCUPATION_OPTIONS = Object.values(Occupation);

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

export interface GoogleLoginDto {
  idToken: string;
  firstName?: string;
  lastName?: string;
  occupation?: string;
  company?: string;
  photoUrl?: string;
}

export interface UpdateProfileDto {
  firstName?: string;
  lastName?: string;
  occupation?: string;
  company?: string;
  linkedinUrl?: string;
  githubUrl?: string;
  websiteUrl?: string;
  photoUrl?: string;
}

export interface UploadPhotoDto {
  imageBase64: string;
  extension: "png" | "jpg" | "jpeg";
}

export const DEFAULT_PROFILE_PICTURE = "standardProfilePicture/profilePicture.png";
