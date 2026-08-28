import { setGlobalOptions } from "firebase-functions";
import { onRequest } from "firebase-functions/v2/https";
import express from "express";
import cors from "cors";
import { sendSuccess } from "./shared/infrastructure/utils/apiResponse";
import { authMiddleware } from "./shared/infrastructure/middlewares/auth.middleware";
import { userController } from "./modules/users/controllers/user.controller";

export * from "./shared/infrastructure/types/api.types";
export * from "./shared/infrastructure/utils/apiResponse";
export * from "./modules/users/domain/occupation.enum";

setGlobalOptions({ maxInstances: 10 });

const app = express();

const allowedOrigins = [
  "https://matias-log.vercel.app",
  "http://localhost:3000",
  "http://127.0.0.1:3000",
];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Blocked."));
    }
  },
  credentials: true,
}));

app.use(express.json({ limit: "10mb" }));

app.get("/", (_req, res) => {
  sendSuccess(res, { message: "Api Running" });
});

// User & Auth Routes
app.post("/users/google-login", (req, res) => userController.googleLogin(req, res));
app.get("/users/me", authMiddleware, (req, res) => userController.getMe(req, res));
app.patch("/users/me", authMiddleware, (req, res) => userController.updateProfile(req, res));
app.post("/users/me/photo", authMiddleware, (req, res) => userController.uploadProfilePicture(req, res));

export const api = onRequest({ invoker: "public" }, app);
