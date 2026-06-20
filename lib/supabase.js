import { createBrowserClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "https://placeholder.supabase.co";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "placeholder";

export const supabase = createBrowserClient(supabaseUrl, supabaseAnonKey);

/** Server-side admin client (uses service role key) */
export function createAdminClient() {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceRoleKey) throw new Error("Missing SUPABASE_SERVICE_ROLE_KEY");
  return createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

/**
 * Upload a student photo to Supabase Storage
 * @param {File} file
 * @param {string} studentId
 */
export async function uploadStudentPhoto(file, studentId) {
  const ext = file.name.split(".").pop();
  const path = `students/${studentId}.${ext}`;
  const { error } = await supabase.storage.from("student-photos").upload(path, file, {
    upsert: true,
    contentType: file.type,
  });
  if (error) throw error;
  const { data } = supabase.storage.from("student-photos").getPublicUrl(path);
  return data.publicUrl;
}
