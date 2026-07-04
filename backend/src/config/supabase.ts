import { createClient } from "@supabase/supabase-js";
import { env } from "./env";

export const supabase = createClient(
  env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);