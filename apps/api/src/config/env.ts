const port = Number(
  process.env.PORT ?? 4000,
);

export const env = {
  NODE_ENV:
    process.env.NODE_ENV ?? "development",

  HOST:
    process.env.HOST ?? "0.0.0.0",

  PORT: port,

  CORS_ORIGIN:
    process.env.CORS_ORIGIN ??
    "http://localhost:3000",

  OPENAI_API_KEY:
    process.env.OPENAI_API_KEY ?? "",

  OPENAI_EVALUATION_MODEL:
    process.env.OPENAI_EVALUATION_MODEL ??
    "gpt-4o-mini",
};