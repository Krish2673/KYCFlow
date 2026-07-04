import { z } from "zod";

const envSchema = z.object({

    PORT:
        z.string()
        .default("5000"),

    DATABASE_URL:
        z.string()
        .min(1),

    JWT_SECRET:
        z.string()
        .min(1),

    JWT_REFRESH_SECRET:
        z.string()
        .min(1),

    REDIS_URL:
        z.string()
        .min(1),

    SUPABASE_URL:
        z.string()
        .url(),

    SUPABASE_SERVICE_ROLE_KEY:
        z.string()
        .min(1),

    SUPABASE_BUCKET:
    z.string().min(1),

    RESEND_API_KEY:
        z.string()
        .min(1),

    FRONTEND_URL:
        z.string()
        .url()
        .or(
            z.literal(
                "http://localhost:5173"
            )
        ),

});

export const env =
envSchema.parse(
    process.env
);