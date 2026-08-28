import { setGlobalOptions } from "firebase-functions";
import { onRequest } from "firebase-functions/v2/https";
import express from "express";
import cors from "cors";

setGlobalOptions({ maxInstances: 10 });

const app = express();

app.use(cors({ origin: "*" }));

app.use(express.json());

app.get("/", (_req, res) => {
    res.send("API Running!");
});

export const api = onRequest(app);


