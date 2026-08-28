import { Request, Response, NextFunction } from "express";
import { firebaseAdminAuth } from "../firebaseAdmin";
import { sendError } from "../utils/apiResponse";
import { ErrorCode } from "../types/api.types";

export interface AuthenticatedRequest extends Request {
  firebaseUid?: string;
  userEmail?: string;
}

export async function authMiddleware(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    sendError(res, ErrorCode.UNAUTHORIZED, req.path, {
      message: "Unauthorized.",
    });
    return;
  }

  const idToken = authHeader.split("Bearer ")[1]?.trim();

  if (!idToken) {
    sendError(res, ErrorCode.UNAUTHORIZED, req.path, {
      message: "Missing authentication token.",
    });
    return;
  }

  try {
    const decodedToken = await firebaseAdminAuth.verifyIdToken(idToken);
    req.firebaseUid = decodedToken.uid;
    req.userEmail = decodedToken.email;
    next();
  } catch {
    sendError(res, ErrorCode.UNAUTHORIZED, req.path, {
      message: "Invalid or expired authentication.",
    });
  }
}
