import "dotenv/config";

const required = (name: string): string => {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
};

export const env = {
  nodeEnv: process.env.NODE_ENV ?? "development",
  port: Number(process.env.PORT ?? 5000),
  clientOrigin: process.env.CLIENT_ORIGIN ?? "http://localhost:3000",
  mongoUri: required("MONGODB_URI"),
  jwtSecret: required("JWT_SECRET"),
  jwtExpiresIn: process.env.JWT_EXPIRES_IN ?? "7d",
} as const;

if (!Number.isInteger(env.port) || env.port < 1 || env.port > 65535) {
  throw new Error("PORT must be an integer between 1 and 65535");
}
