import cors from "cors";
import express from "express";
import helmet from "helmet";

import { env } from "./config/env";

export const createApp = (): express.Express => {
  const app = express();

  app.use(helmet());
  app.use(cors({ origin: env.clientOrigin }));
  app.use(express.json({ limit: "1mb" }));
  app.use(express.urlencoded({ extended: false, limit: "1mb" }));

  app.get("/api/health", (_request, response) => {
    response.json({ status: "ok" });
  });

  return app;
};
