import { setGlobalOptions } from "firebase-functions";
import { onRequest } from "firebase-functions/v2/https";
import express from "express";
import cors from "cors";
import { sendSuccess } from "./shared/infrastructure/utils/apiResponse";

export * from "./shared/infrastructure/types/api.types";
export * from "./shared/infrastructure/utils/apiResponse";

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
      callback(new Error("Bloqueado por CORS"));
    }
  },
  credentials: true,
}));

app.use(express.json());

app.get("/", (_req, res) => {
  sendSuccess(res, { message: "Api Running" });
});

export const api = onRequest({ invoker: "public" }, app);
