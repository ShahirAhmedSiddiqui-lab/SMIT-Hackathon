import { createApp } from "./app";
import { connectDatabase } from "./config/database";
import { env } from "./config/env";

const start = async (): Promise<void> => {
  await connectDatabase(env.mongoUri);

  const app = createApp();
  app.listen(env.port, () => {
    console.log(`API server listening on http://localhost:${env.port}`);
  });
};

start().catch((error: unknown) => {
  console.error("Failed to start API server", error);
  process.exit(1);
});
