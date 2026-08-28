import { setGlobalOptions } from "firebase-functions";
import { onRequest } from "firebase-functions/v2/https";
import express from "express";
import cors from "cors";
import { sendSuccess } from "./shared/infrastructure/utils/apiResponse";

export * from "./shared/infrastructure/types/api.types";
export * from "./shared/infrastructure/utils/apiResponse";

setGlobalOptions({ maxInstances: 10 });

const app = express();

app.use(cors({ origin: "https://matias-log.vercel.app/" }));
app.use(express.json());

app.get("/", (_req, res) => {
  sendSuccess(res, { message: "Api Running" });
});

export const api = onRequest(app);
