import { supabase } from "@/integrations/supabase/client";

export async function uploadMedia(file: File, folder: "products" | "gallery"): Promise<{ url: string; path: string }> {
  const ext = file.name.split(".").pop() || "bin";
  const path = `${folder}/${crypto.randomUUID()}.${ext}`;
  const { error } = await supabase.storage.from("media").upload(path, file, { upsert: false });
  if (error) throw error;
  const { data } = supabase.storage.from("media").getPublicUrl(path);
  return { url: data.publicUrl, path };
}

export async function removeMedia(path: string | null | undefined): Promise<void> {
  if (!path) return;
  await supabase.storage.from("media").remove([path]);
}
